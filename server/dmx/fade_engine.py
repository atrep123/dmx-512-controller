from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Tuple


def _clamp(v: int) -> int:
    return max(0, min(255, int(v)))


@dataclass
class FadeTask:
    universe: int
    targets: Dict[int, int]  # ch -> target value
    start_values: Dict[int, int]
    start_ms: int
    duration_ms: int
    easing: str = "linear"
    queued_at: Dict[int, float] = field(default_factory=dict)

    def value_at(self, ch: int, now_ms: int) -> int:
        sv = self.start_values.get(ch, 0)
        tv = self.targets.get(ch, sv)
        if self.duration_ms <= 0:
            return tv
        t = (now_ms - self.start_ms) / self.duration_ms
        if t <= 0:
            f = 0.0
        elif t >= 1:
            f = 1.0
        else:
            if self.easing == "linear":
                f = t
            elif self.easing == "s_curve":
                f = t * t * (3 - 2 * t)
            elif self.easing == "expo":
                f = 0 if t == 0 else 2 ** (10 * (t - 1))
                if f > 1:
                    f = 1.0
            else:
                f = t
        return _clamp(round(sv + (tv - sv) * f))


@dataclass
class FadeEngine:
    tick_hz: int = 44
    tasks: Dict[int, List[FadeTask]] = field(default_factory=dict)
    _running: bool = False
    _task: asyncio.Task | None = None

    def add_fade(self, *, universe: int, patch: List[dict], duration_ms: int, now_ms: int, get_current: callable, easing: str = "linear", metrics: Any | None = None) -> None:
        # Build start values from current frame
        start_values: Dict[int, int] = {}
        targets: Dict[int, int] = {}
        for it in patch:
            ch = int(it["ch"]) ; val = int(it["val"]) ; targets[ch] = val
            start_values[ch] = int(get_current(universe, ch))
        task = FadeTask(universe=universe, targets=targets, start_values=start_values, start_ms=now_ms, duration_ms=duration_ms, easing=easing)
        now_mono = time.monotonic()
        task.queued_at = {ch: now_mono for ch in targets.keys()}
        lst = self.tasks.setdefault(universe, [])
        lst.append(task)
        # metrics: started + active
        if metrics is not None and hasattr(metrics, "set_fade_active"):
            try:
                if hasattr(metrics, "inc_fades_started"):
                    metrics.inc_fades_started(universe, len(targets))
            except Exception:
                pass
            try:
                ch_count = sum(len(ft.targets) for ft in lst)
                metrics.set_fade_active(universe, ch_count)
                if hasattr(metrics, "set_fade_jobs_active"):
                    metrics.set_fade_jobs_active(universe, len(lst))
            except Exception:
                pass

    def cancel_channels(self, universe: int, channels: List[int], *, metrics: Any | None = None, reason: str = "ltp") -> None:
        """Remove channels from active fades (LTP)."""
        uni = int(universe)
        lst = self.tasks.get(uni, [])
        if not lst:
            return
        chans = set(int(c) for c in channels)
        remain: List[FadeTask] = []
        cancelled = 0
        for ft in lst:
            before = set(ft.targets.keys())
            ft.targets = {ch: v for ch, v in ft.targets.items() if ch not in chans}
            ft.start_values = {ch: v for ch, v in ft.start_values.items() if ch not in chans}
            for ch in list(ft.queued_at.keys()):
                if ch in chans:
                    ft.queued_at.pop(ch, None)
            removed = len(before & chans)
            cancelled += removed
            if ft.targets:
                remain.append(ft)
        self.tasks[uni] = remain
        if metrics is not None:
            try:
                ch_count = sum(len(ft.targets) for ft in remain)
                metrics.set_fade_active(uni, ch_count)
                if hasattr(metrics, "set_fade_jobs_active"):
                    metrics.set_fade_jobs_active(uni, len(remain))
            except Exception:
                pass
            try:
                if hasattr(metrics, "inc_fades_cancelled"):
                    metrics.inc_fades_cancelled(uni, reason, max(0, int(cancelled)))
            except Exception:
                pass

    async def run(self, *, apply_patch: callable, broadcast: callable, ola_apply: callable | None = None, metrics=None) -> None:
        if self._running:
            return
        self._running = True
        interval = 1.0 / max(1, int(self.tick_hz))
        try:
            while True:
                start = time.perf_counter()
                now_ms = int(time.time() * 1000)
                # Gather deltas per universe
                for uni, lst in list(self.tasks.items()):
                    if not lst:
                        continue
                    u_start = time.perf_counter()
                    deltas: Dict[int, int] = {}
                    remaining: List[FadeTask] = []
                    done_completed_channels = 0
                    for ft in lst:
                        done = now_ms >= ft.start_ms + ft.duration_ms
                        channels = list(ft.targets.keys())
                        for ch in channels:
                            if ch in ft.queued_at and hasattr(metrics, "observe_queue_delay"):
                                try:
                                    delay_ms = int((time.monotonic() - ft.queued_at[ch]) * 1000)
                                    metrics.observe_queue_delay(uni, delay_ms)
                                except Exception:
                                    pass
                                finally:
                                    ft.queued_at.pop(ch, None)
                            v = ft.value_at(ch, now_ms)
                            deltas[ch] = v
                        if not done:
                            remaining.append(ft)
                        else:
                            done_completed_channels += len(channels)
                    self.tasks[uni] = remaining
                    # metrics: active count
                    if metrics is not None and hasattr(metrics, "set_fade_active"):
                        try:
                            ch_count = sum(len(ft.targets) for ft in remaining)
                            metrics.set_fade_active(uni, ch_count)
                            if hasattr(metrics, "set_fade_jobs_active"):
                                metrics.set_fade_jobs_active(uni, len(remaining))
                        except Exception:
                            pass
                    if deltas:
                        delta_list = [{"ch": ch, "val": val} for ch, val in deltas.items()]
                        delta, rev, ts = apply_patch(uni, delta_list)
                        if delta:
                            await broadcast({
                                "type": "state.update",
                                "rev": rev,
                                "ts": ts,
                                "universe": uni,
                                "delta": delta,
                                "full": False,
                            })
                            if ola_apply is not None:
                                try:
                                    await ola_apply(uni, delta)
                                except Exception:
                                    pass
                    # metrics: per-universe tick
                    if metrics is not None and hasattr(metrics, "inc_fade_tick"):
                        try:
                            elapsed_ms = int((time.perf_counter() - u_start) * 1000)
                            metrics.inc_fade_tick(uni, elapsed_ms)
                        except Exception:
                            pass
                    # handle completed channels (done reason)
                    if done_completed_channels and metrics is not None and hasattr(metrics, "inc_fades_cancelled"):
                        try:
                            metrics.inc_fades_cancelled(uni, "done", int(done_completed_channels))
                        except Exception:
                            pass
                dur = time.perf_counter() - start
                if callable(metrics):
                    try:
                        metrics()
                    except Exception:
                        pass
                await asyncio.sleep(max(0.0, interval - dur))
        except asyncio.CancelledError:
            self._running = False
            raise
