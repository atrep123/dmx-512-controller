from __future__ import annotations

import asyncio
import json
import time

import pytest
import websockets

pytestmark = pytest.mark.asyncio


async def _drain_initial(ws):
    for _ in range(2):
        try:
            await asyncio.wait_for(ws.recv(), timeout=1.0)
        except asyncio.TimeoutError:
            break


async def test_ws_slow_client_does_not_block_others(live_server_url: str):
    uri = live_server_url.replace("http", "ws") + "/ws?token=demo-key"
    async with websockets.connect(uri, ping_timeout=5) as fast_ws:
        async with websockets.connect(uri, ping_timeout=5) as slow_ws:
            # Fast client drains initial messages quickly
            await _drain_initial(fast_ws)
            # Slow client intentionally does not read now

            cmd = {
                "type": "dmx.patch",
                "id": "slow-1",
                "ts": 0,
                "universe": 0,
                "patch": [{"ch": 1, "val": 15}],
            }
            # Send from fast client
            await fast_ws.send(json.dumps(cmd))

            # Expect ack quickly
            ack = await asyncio.wait_for(fast_ws.recv(), timeout=1.0)
            ack_obj = json.loads(ack)
            assert ack_obj.get("ack") == "slow-1"

            # Expect state.update soon even though slow_ws is not reading
            start = time.perf_counter()
            upd_raw = await asyncio.wait_for(fast_ws.recv(), timeout=0.5)
            elapsed = time.perf_counter() - start
            upd = json.loads(upd_raw)
            assert upd.get("type") == "state.update"
            assert {"ch": 1, "val": 15} in upd.get("delta", [])
            # Soft check: under ~0.5s indicates broadcast is not blocked by the slow client
            assert elapsed < 0.5

