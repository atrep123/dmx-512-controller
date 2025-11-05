from __future__ import annotations

import asyncio
import time

import pytest


pytestmark = pytest.mark.asyncio


async def test_cancel_channels_accounts_only_existing(monkeypatch):
    from server.dmx.fade_engine import FadeEngine
    from server.util.metrics import CoreMetrics

    # fake time to keep engine deterministic
    monkeypatch.setattr(time, "monotonic", lambda: 0.0)
    monkeypatch.setattr(time, "time", lambda: 0.0)

    metrics = CoreMetrics()

    state = {0: {}}

    def get_current(u: int, ch: int) -> int:
        return int(state.get(u, {}).get(ch, 0))

    async def broadcast(_: dict):
        return None

    def apply_patch(u: int, items: list[dict]):
        uni = state.setdefault(u, {})
        for it in items:
            uni[int(it["ch"])]= int(it["val"]) 
        return items, 0, 0

    fe = FadeEngine()
    now_ms = int(time.time() * 1000)
    # Add a fade on channels 1,2
    fe.add_fade(universe=0, patch=[{"ch": 1, "val": 100}, {"ch": 2, "val": 100}], duration_ms=1000, now_ms=now_ms, get_current=get_current, easing="linear", metrics=metrics)
    # Cancel channels [2,5]  only channel 2 exists
    fe.cancel_channels(0, [2, 5], metrics=metrics)
    # Run one tick to process metric updates
    task = asyncio.create_task(fe.run(apply_patch=apply_patch, broadcast=broadcast, ola_apply=None, metrics=metrics))
    await asyncio.sleep(0.01)
    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task

    # Expect fades_cancelled_total{reason="ltp"} incremented by 1 for universe 0
    lines = metrics.prometheus_lines()
    has_ltp = any(line.startswith("dmx_core_fades_cancelled_total") and 'reason="ltp"' in line and 'universe="0"' in line and line.strip().split()[-1] != '0' for line in lines)
    assert has_ltp
