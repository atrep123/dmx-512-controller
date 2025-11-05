from __future__ import annotations

import asyncio
import contextlib
import json
import os
import socket
import threading
import time

import pytest
import requests
import websockets
import uvicorn


def _free_port() -> int:
    with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


pytestmark = pytest.mark.asyncio


async def test_fade_ack_and_updates() -> None:
    os.environ["FADES_ENABLED"] = "true"
    port = _free_port()
    config = uvicorn.Config("server.app:app", host="127.0.0.1", port=port, log_level="warning")
    server = uvicorn.Server(config)
    t = threading.Thread(target=server.run, daemon=True)
    t.start()

    base = f"http://127.0.0.1:{port}"
    # wait until /healthz responds
    for _ in range(100):
        try:
            r = requests.get(f"{base}/healthz", timeout=0.2)
            if r.status_code == 200:
                break
        except Exception:
            pass
        time.sleep(0.05)

    uri = base.replace("http", "ws") + "/ws?token=demo-key"
    try:
        async with websockets.connect(uri, ping_timeout=5) as ws:
            # drain initial
            for _ in range(2):
                try:
                    await asyncio.wait_for(ws.recv(), timeout=1.0)
                except asyncio.TimeoutError:
                    break
            # send fade 0->50 on ch 1 in 100ms
            cmd = {"type": "dmx.fade", "id": "f-1", "ts": 0, "universe": 0, "durationMs": 100, "easing": "linear", "patch": [{"ch": 1, "val": 50}]}
            await ws.send(json.dumps(cmd))

            saw_ack = False
            saw_delta = False
            deadline = time.monotonic() + 1.5
            while time.monotonic() < deadline and not (saw_ack and saw_delta):
                try:
                    m = json.loads(await asyncio.wait_for(ws.recv(), timeout=0.3))
                except asyncio.TimeoutError:
                    continue
                if m.get("ack") == "f-1":
                    saw_ack = True
                if m.get("type") == "state.update" and not m.get("full", False) and m.get("universe") == 0:
                    if any(d.get("ch") == 1 for d in m.get("delta", [])):
                        saw_delta = True
            assert saw_ack and saw_delta
            # final state should reach ~50
            time.sleep(0.2)
            st = requests.get(f"{base}/state", timeout=2.0).json()
            assert st["universes"][0][1] == 50
    finally:
        server.should_exit = True
        t.join(timeout=5)

