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


async def test_jobs_gauge_parallel_fades(fake_clock):
    from server.dmx.fade_engine import FadeEngine
    from server.util.metrics import CoreMetrics

    metrics = CoreMetrics()
    state: dict[int, dict[int, int]] = {0: {}}

    def get_current(u: int, ch: int) -> int:
        return int(state.get(u, {}).get(ch, 0))

    async def broadcast(payload):
        return None

    def apply_patch(u: int, items: list[dict]):
        uni = state.setdefault(u, {})
        for it in items:
            uni[int(it["ch"])]= int(it["val"]) 
        return items, 0, 0

    fe = FadeEngine()
    now = int(time.time() * 1000)
    # first job: ch1,ch2 ; second job: ch3
    fe.add_fade(universe=0, patch=[{"ch": 1, "val": 100}, {"ch": 2, "val": 100}], duration_ms=1000, now_ms=now, get_current=get_current, easing="linear", metrics=metrics)
    fe.add_fade(universe=0, patch=[{"ch": 3, "val": 100}], duration_ms=1000, now_ms=now, get_current=get_current, easing="linear", metrics=metrics)

    # At scheduling time gauges should reflect 2 jobs and 3 channels
    lines = metrics.prometheus_lines()
    jobs = [ln for ln in lines if ln.startswith("dmx_core_fade_jobs_active") and 'universe="0"' in ln]
    active = [ln for ln in lines if ln.startswith("dmx_core_fade_active") and 'universe="0"' in ln]
    assert jobs and int(jobs[-1].split()[-1]) == 2
    assert active and int(active[-1].split()[-1]) == 3

    async def runner():
        await fe.run(apply_patch=apply_patch, broadcast=broadcast, ola_apply=None, metrics=metrics)

    task = asyncio.create_task(runner())
    await fake_clock.sleep(1.2)
    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task

    # At end gauges should be zero
    lines2 = metrics.prometheus_lines()
    jobs2 = [ln for ln in lines2 if ln.startswith("dmx_core_fade_jobs_active") and 'universe="0"' in ln]
    active2 = [ln for ln in lines2 if ln.startswith("dmx_core_fade_active") and 'universe="0"' in ln]
    assert jobs2 and jobs2[-1].split()[-1] == '0'
    assert active2 and active2[-1].split()[-1] == '0'
