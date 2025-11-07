from __future__ import annotations

import asyncio
import time

import pytest


pytestmark = pytest.mark.asyncio


class FakeClock:
    def __init__(self) -> None:
        self.t = 0.0

    def now(self) -> float:
        return self.t

    def now_s(self) -> float:
        return self.t

    async def sleep(self, s: float) -> None:
        self.t += s


@pytest.fixture
def fake_clock(monkeypatch):
    clk = FakeClock()
    monkeypatch.setattr(time, "monotonic", clk.now)
    monkeypatch.setattr(time, "time", clk.now_s)

    real_asyncio_sleep = asyncio.sleep

    async def clock_sleep(s: float) -> None:
        clk.t += s
        await real_asyncio_sleep(0)

    async def fake_sleep(s: float, *_, **__):
        await clock_sleep(s)

    monkeypatch.setattr(clk, "sleep", clock_sleep, raising=False)
    monkeypatch.setattr(asyncio, "sleep", fake_sleep, raising=True)
    return clk


async def test_per_channel_counts_and_queue_delay(fake_clock):
    from server.dmx.fade_engine import FadeEngine
    from server.util.metrics import CoreMetrics

    metrics = CoreMetrics()
    state: dict[int, dict[int, int]] = {0: {}}
    rev = 0
    ts = 0

    def get_current(u: int, ch: int) -> int:
        return int(state.get(u, {}).get(ch, 0))

    async def broadcast(payload):
        return None

    def apply_patch(u: int, items: list[dict]):
        nonlocal rev, ts
        uni = state.setdefault(u, {})
        changed = []
        for it in items:
            ch = int(it["ch"]) ; val = int(it["val"]) ; prev = uni.get(ch, 0)
            if prev != val:
                uni[ch] = val
                changed.append({"ch": ch, "val": val})
        if changed:
            rev += 1
            ts = int(time.time() * 1000)
        return changed, rev, ts

    fe = FadeEngine()
    # schedule fade on ch1,ch2,ch3 (1000 ms)
    fe.add_fade(universe=0, patch=[{"ch": 1, "val": 200}, {"ch": 2, "val": 200}, {"ch": 3, "val": 200}], duration_ms=1000, now_ms=int(time.time() * 1000), get_current=get_current, easing="linear", metrics=metrics)

    async def runner():
        await fe.run(apply_patch=apply_patch, broadcast=broadcast, ola_apply=None, metrics=metrics)

    task = asyncio.create_task(runner())
    # after 300ms, LTP cancel channel 2
    await fake_clock.sleep(0.3)
    fe.cancel_channels(0, [2], metrics=metrics)
    # advance to finish
    await fake_clock.sleep(1.0)
    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task

    # Verify metrics: started=3, ltp cancelled=1, done=2, active/jobs=0
    lines = metrics.prometheus_lines()
    def find(name_sub: str) -> list[str]:
        return [ln for ln in lines if name_sub in ln]
    started = [ln for ln in find("dmx_core_fades_started_total") if 'universe="0"' in ln]
    assert started and int(started[0].split()[-1]) >= 3
    ltp = [ln for ln in find("dmx_core_fades_cancelled_total") if 'reason="ltp"' in ln]
    assert ltp and int(ltp[0].split()[-1]) >= 1
    done = [ln for ln in find("dmx_core_fades_cancelled_total") if 'reason="done"' in ln]
    assert done and int(done[0].split()[-1]) >= 2
    active = [ln for ln in find("dmx_core_fade_active") if 'universe="0"' in ln]
    jobs = [ln for ln in find("dmx_core_fade_jobs_active") if 'universe="0"' in ln]
    assert active and active[-1].split()[-1] == '0'
    assert jobs and jobs[-1].split()[-1] == '0'
    # queue delay histogram present
    qd = find("dmx_core_fade_queue_delay_ms_bucket")
    assert qd, "queue delay histogram should be present"
