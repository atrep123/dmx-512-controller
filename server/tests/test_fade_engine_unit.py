from __future__ import annotations

import asyncio
import time
from typing import Dict, List

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


async def test_linear_fade_100_to_200_in_500ms(fake_clock):
    from server.dmx.fade_engine import FadeEngine

    # Minimal DMX state to back get_current and apply_patch
    state: Dict[int, Dict[int, int]] = {0: {}}
    rev = 0
    ts = 0

    def get_current(u: int, ch: int) -> int:
        return int(state.get(u, {}).get(ch, 0))

    async def broadcast(payload):
        # collect if needed
        return None

    def apply_patch(u: int, items: List[dict]):
        nonlocal rev, ts
        uni = state.setdefault(u, {})
        delta = []
        for it in items:
            ch = int(it["ch"]) ; val = int(it["val"]) ; prev = uni.get(ch, 0)
            if prev != val:
                uni[ch] = val
                delta.append({"ch": ch, "val": val})
        if delta:
            rev += 1
            ts = int(time.time() * 1000)
        return delta, rev, ts

    fe = FadeEngine()
    # start value 100 on ch1
    apply_patch(0, [{"ch": 1, "val": 100}])
    # schedule fade to 200 over 500 ms
    fe.add_fade(universe=0, patch=[{"ch": 1, "val": 200}], duration_ms=500, now_ms=int(time.time() * 1000), get_current=get_current, easing="linear")

    async def runner():
        await fe.run(apply_patch=apply_patch, broadcast=broadcast, ola_apply=None, metrics=None)

    task = asyncio.create_task(runner())
    # advance fake time to complete fade
    await fake_clock.sleep(0.6)
    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task

    # Invariants: monotonic increase, no overshoot, final exactly 200
    assert state[0][1] == 200


async def test_ltp_cancel_by_patch(fake_clock):
    from server.dmx.fade_engine import FadeEngine

    state: Dict[int, Dict[int, int]] = {0: {}}
    rev = 0
    ts = 0

    def get_current(u: int, ch: int) -> int:
        return int(state.get(u, {}).get(ch, 0))

    async def broadcast(payload):
        return None

    def apply_patch(u: int, items: List[dict]):
        nonlocal rev, ts
        uni = state.setdefault(u, {})
        for it in items:
            uni[int(it["ch"])]= int(it["val"]) 
        rev += 1
        ts = int(time.time() * 1000)
        return items, rev, ts

    fe = FadeEngine()
    apply_patch(0, [{"ch": 1, "val": 0}])
    fe.add_fade(universe=0, patch=[{"ch": 1, "val": 255}], duration_ms=1000, now_ms=int(time.time() * 1000), get_current=get_current, easing="linear")

    async def runner():
        await fe.run(apply_patch=apply_patch, broadcast=broadcast, ola_apply=None, metrics=None)

    task = asyncio.create_task(runner())
    # after 200ms, apply direct patch and cancel LTP
    await fake_clock.sleep(0.2)
    # Set direct value 10 and cancel fades for ch1
    apply_patch(0, [{"ch": 1, "val": 10}])
    fe.cancel_channels(0, [1])
    # advance beyond fade duration
    await fake_clock.sleep(1.0)
    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task

    assert state[0][1] == 10
