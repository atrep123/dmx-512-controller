from __future__ import annotations

import asyncio
import json

import pytest
import websockets

pytestmark = pytest.mark.asyncio


async def _recv_json(ws, timeout: float = 2.0):
    msg = await asyncio.wait_for(ws.recv(), timeout=timeout)
    return json.loads(msg)


async def test_ws_multi_universe_delta(live_server_url: str):
    uri = live_server_url.replace("http", "ws") + "/ws?token=demo-key"
    async with websockets.connect(uri, ping_timeout=5) as ws:
        # Drain initial messages (legacy state + one or more full:true updates)
        for _ in range(3):
            try:
                await asyncio.wait_for(ws.recv(), timeout=1.0)
            except asyncio.TimeoutError:
                break

        # Send two patches for different universes
        cmd1 = {"type": "dmx.patch", "id": "mu-1", "ts": 0, "universe": 0, "patch": [{"ch": 10, "val": 50}]}
        cmd2 = {"type": "dmx.patch", "id": "mu-2", "ts": 0, "universe": 1, "patch": [{"ch": 5, "val": 100}]}
        await ws.send(json.dumps(cmd1))
        await ws.send(json.dumps(cmd2))

        acks = set()
        deltas: dict[int, list[dict]] = {}
        # Collect until we have both acks and both universes deltas
        while len(acks) < 2 or len(deltas) < 2:
            m = await _recv_json(ws, timeout=3)
            if isinstance(m, dict) and m.get("ack"):
                acks.add(m["ack"])  # type: ignore[arg-type]
            elif m.get("type") == "state.update" and not m.get("full", False):
                deltas[int(m["universe"])] = m["delta"]

        assert {"mu-1", "mu-2"} == acks
        assert any(d.get("ch") == 10 and d.get("val") == 50 for d in deltas[0])
        assert any(d.get("ch") == 5 and d.get("val") == 100 for d in deltas[1])

