from __future__ import annotations

import asyncio
import json

import pytest
import websockets

pytestmark = pytest.mark.asyncio


async def _recv_json(ws, timeout: float = 2.0):
    msg = await asyncio.wait_for(ws.recv(), timeout=timeout)
    return json.loads(msg)


async def test_ws_ack_and_state_update(live_server_url: str):
    uri = live_server_url.replace("http", "ws") + "/ws?token=demo-key"
    async with websockets.connect(uri, ping_timeout=5) as ws:
        # On connect: legacy state first, then unified state.update full:true
        first = await _recv_json(ws, timeout=3)
        second = await _recv_json(ws, timeout=3)

        assert first.get("type") in {"state", "state.update"}
        assert second.get("type") in {"state", "state.update"}
        assert (first.get("type") == "state.update" and first.get("full") is True) or \
               (second.get("type") == "state.update" and second.get("full") is True)
        # Drain any additional initial full snapshots that might be queued when multiple universes exist
        while True:
            try:
                extra = await _recv_json(ws, timeout=0.5)
            except asyncio.TimeoutError:
                break
            if extra.get("type") == "state.update" and extra.get("full"):
                continue
            # No other payloads expected before issuing commands
            pytest.fail(f"unexpected pre-command payload: {extra}")

        # Send a unified command
        cmd = {"type": "dmx.patch", "id": "ws-it-1", "ts": 0, "universe": 0, "patch": [{"ch": 1, "val": 7}]}
        await ws.send(json.dumps(cmd))

        # Expect Ack quickly
        ack = None
        while ack is None:
            msg = await _recv_json(ws, timeout=2)
            if msg.get("type") == "state.update" and msg.get("full"):
                continue  # stray handshake payload
            assert msg.get("type") != "state.update", "state update arrived before ack"
            if msg.get("ack") == "ws-it-1":
                ack = msg
        assert ack.get("ack") == "ws-it-1"
        assert ack.get("accepted") is True

        # Then a delta update containing channel 1 = 7
        upd = None
        while upd is None:
            msg = await _recv_json(ws, timeout=2)
            if msg.get("type") == "state.update" and msg.get("full"):
                continue
            if msg.get("ack"):
                continue
            if msg.get("type") == "state.update":
                upd = msg
                break
        assert upd["type"] == "state.update"
        assert upd["universe"] == 0
        assert upd.get("full") is False
        assert {"ch": 1, "val": 7} in upd.get("delta", [])
