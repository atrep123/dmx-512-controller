"""OLA output with per-universe frame store, 44fps guard, and debounce."""

from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass
from typing import Any, Callable, Dict, Optional

import anyio
import httpx


HttpPost = Callable[[str, dict[str, str]], Any]


@dataclass
class OLAMetrics:
    frames_total: Dict[int, int]
    frames_skipped_identical: Dict[int, int]
    frames_skipped_rate: Dict[int, int]
    last_fps: Dict[int, float]
    http_errors_total: Dict[int, int] | None = None
    # Optional extended maps (if wired to CoreMetrics)
    http_errors_by_code: Dict[tuple[int, str], int] | None = None
    queue_depth: Dict[int, int] | None = None

    # Adapter-style helpers expected by UniverseFrame
    def inc_total(self, u: int) -> None:
        self.frames_total[u] = self.frames_total.get(u, 0) + 1

    def inc_skip_identical(self, u: int) -> None:
        self.frames_skipped_identical[u] = self.frames_skipped_identical.get(u, 0) + 1

    def inc_skip_rate(self, u: int) -> None:
        self.frames_skipped_rate[u] = self.frames_skipped_rate.get(u, 0) + 1

    def set_fps(self, u: int, fps: float) -> None:
        self.last_fps[u] = float(fps)

    def inc_http_error(self, u: int) -> None:
        if self.http_errors_total is not None:
            self.http_errors_total[u] = self.http_errors_total.get(u, 0) + 1

    # Extended helpers mirroring CoreMetrics API; safe no-ops if maps are not provided
    def ola_inc_http_error_code(self, u: int, code: str) -> None:
        if self.http_errors_by_code is not None:
            key = (u, str(code))
            self.http_errors_by_code[key] = self.http_errors_by_code.get(key, 0) + 1

    def ola_set_queue_depth(self, u: int, depth: int) -> None:
        if self.queue_depth is not None:
            self.queue_depth[u] = max(0, int(depth))


class UniverseFrame:
    def __init__(
        self,
        ola_universe: int,
        base_url: str,
        *,
        fps: int = 44,
        http_post: Optional[HttpPost] = None,
        metrics: Optional[OLAMetrics] = None,
    ) -> None:
        self.ola_universe = int(ola_universe)
        self.base_url = base_url.rstrip("/")
        self._frame = [0] * 512
        self._last_sent: Optional[list[int]] = None
        self._interval = 1.0 / max(1, int(fps))
        self._next_ts = 0.0
        self._lock = asyncio.Lock()
        self._http_post = http_post  # legacy sync hook (unused with AsyncClient)
        self._metrics = metrics or OLAMetrics({}, {}, {}, {})
        self._ema_fps: Optional[float] = None
        self._queue_suppressed: int = 0

    def apply_patch(self, items: list[dict[str, int]]) -> bool:
        """Apply a list of channel updates. Returns True if any value changed."""
        changed = False
        for it in items:
            ch = int(it["ch"])
            val = int(it["val"])
            idx = ch - 1
            if 0 <= idx < 512:
                if self._frame[idx] != val:
                    self._frame[idx] = val
                    changed = True
        return changed

    async def maybe_send(self) -> None:
        async with self._lock:
            now = time.monotonic()
            if now < self._next_ts:
                # rate guard
                # try CoreMetrics-style method first, fallback to adapter
                inc_rate = getattr(self._metrics, "ola_inc_skipped_rate", None)
                if callable(inc_rate):
                    inc_rate(self.ola_universe)  # type: ignore[misc]
                else:
                    self._metrics.inc_skip_rate(self.ola_universe)
                self._queue_suppressed += 1
                # update last fps gauge once
                set_fps = getattr(self._metrics, "ola_set_fps", None)
                if callable(set_fps):
                    set_fps(self.ola_universe, float(self._ema_fps or 0.0))  # type: ignore[misc]
                else:
                    self._metrics.set_fps(self.ola_universe, float(self._ema_fps or 0.0))
                # update queue depth gauge
                qd = getattr(self._metrics, "ola_set_queue_depth", None)
                if callable(qd):
                    qd(self.ola_universe, self._queue_suppressed)  # type: ignore[misc]
                return
            if self._last_sent is not None and self._frame == self._last_sent:
                inc_ident = getattr(self._metrics, "ola_inc_skipped_identical", None)
                if callable(inc_ident):
                    inc_ident(self.ola_universe)  # type: ignore[misc]
                else:
                    self._metrics.inc_skip_identical(self.ola_universe)
                return
            self._next_ts = now + self._interval
            frame = self._frame.copy()
            self._last_sent = frame
        # Send outside lock
        url = self.base_url if self.base_url.endswith("/set_dmx") else f"{self.base_url}/set_dmx"
        data = {
            "u": str(self.ola_universe),
            "d": ",".join(str(v) for v in frame),
        }
        start = time.perf_counter()
        try:
            # Use shared AsyncClient via manager
            if hasattr(self, "_client") and isinstance(self._client, httpx.AsyncClient):  # type: ignore[attr-defined]
                resp = await self._client.post(url, data=data, timeout=0.5)  # type: ignore[attr-defined]
                if resp.status_code >= 400:
                    # HTTP error metrics
                    inc_err = getattr(self._metrics, "ola_inc_http_error", None)
                    if callable(inc_err):
                        inc_err(self.ola_universe)  # type: ignore[misc]
                    else:
                        self._metrics.inc_http_error(self.ola_universe)
                    by_code = getattr(self._metrics, "ola_inc_http_error_code", None)
                    if callable(by_code):
                        by_code(self.ola_universe, str(resp.status_code))  # type: ignore[misc]
                    return
            else:
                # Fallback to sync hook if provided
                if self._http_post is not None:
                    await anyio.to_thread.run_sync(self._http_post, url, data)
        except httpx.TimeoutException:
            inc_err = getattr(self._metrics, "ola_inc_http_error", None)
            if callable(inc_err):
                inc_err(self.ola_universe)  # type: ignore[misc]
            else:
                self._metrics.inc_http_error(self.ola_universe)
            by_code = getattr(self._metrics, "ola_inc_http_error_code", None)
            if callable(by_code):
                by_code(self.ola_universe, "timeout")  # type: ignore[misc]
            return
        except Exception:
            inc_err = getattr(self._metrics, "ola_inc_http_error", None)
            if callable(inc_err):
                inc_err(self.ola_universe)  # type: ignore[misc]
            else:
                self._metrics.inc_http_error(self.ola_universe)
            by_code = getattr(self._metrics, "ola_inc_http_error_code", None)
            if callable(by_code):
                by_code(self.ola_universe, "error")  # type: ignore[misc]
            return
        finally:
            elapsed = time.perf_counter() - start
            # Update EMA of fps
            inst_fps = 1.0 / max(elapsed, 1e-3)
            if self._ema_fps is None:
                self._ema_fps = inst_fps
            else:
                self._ema_fps = 0.8 * self._ema_fps + 0.2 * inst_fps
            set_fps = getattr(self._metrics, "ola_set_fps", None)
            if callable(set_fps):
                set_fps(self.ola_universe, float(self._ema_fps))  # type: ignore[misc]
            else:
                self._metrics.set_fps(self.ola_universe, float(self._ema_fps))
        inc_total = getattr(self._metrics, "ola_inc_total", None)
        if callable(inc_total):
            inc_total(self.ola_universe)  # type: ignore[misc]
        else:
            self._metrics.inc_total(self.ola_universe)
        # reset queue depth after successful send
        self._queue_suppressed = 0
        qd = getattr(self._metrics, "ola_set_queue_depth", None)
        if callable(qd):
            qd(self.ola_universe, 0)  # type: ignore[misc]

    def snapshot(self) -> list[int]:
        return self._frame.copy()


class OLAUniverseManager:
    def __init__(
        self,
        *,
        base_url: str,
        fps: int,
        mapping: Dict[int, int] | None = None,
        http_post: Optional[HttpPost] = None,
        metrics: Optional[OLAMetrics] = None,
    ) -> None:
        self.base_url = base_url
        self.fps = fps
        self.mapping = mapping or {}
        self.http_post = http_post
        self.metrics = metrics or OLAMetrics({}, {}, {}, {})
        self._universes: Dict[int, UniverseFrame] = {}
        # Shared HTTP client
        self._client = httpx.AsyncClient(limits=httpx.Limits(max_keepalive_connections=4, max_connections=8))

    def _resolve(self, universe: int) -> UniverseFrame:
        uni = int(universe)
        target = self.mapping.get(uni, uni)
        if uni not in self._universes:
            uf = UniverseFrame(
                ola_universe=target,
                base_url=self.base_url,
                fps=self.fps,
                http_post=self.http_post,
                metrics=self.metrics,
            )
            # attach shared client
            setattr(uf, "_client", self._client)
            self._universes[uni] = uf
        return self._universes[uni]

    def apply_patch(self, universe: int, items: list[dict[str, int]]) -> bool:
        uf = self._resolve(universe)
        return uf.apply_patch(items)

    async def maybe_send(self, universe: int) -> None:
        uf = self._resolve(universe)
        await uf.maybe_send()

    def on_rgb_state(self, r: int, g: int, b: int) -> None:
        uf = self._resolve(0)
        uf.apply_patch([{"ch": 1, "val": r}, {"ch": 2, "val": g}, {"ch": 3, "val": b}])

    def frame_snapshot(self, universe: int) -> list[int]:
        return self._resolve(universe).snapshot()

    async def flush_all(self) -> None:
        for uni in list(self._universes.keys()):
            with anyio.move_on_after(0.2):
                await self._universes[uni].maybe_send()

    async def aclose(self) -> None:
        try:
            await self._client.aclose()
        except Exception:
            pass
