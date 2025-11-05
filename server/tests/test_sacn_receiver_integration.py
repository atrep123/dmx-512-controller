from __future__ import annotations

import contextlib
import json
import socket
import threading
import time

import pytest
import requests
import uvicorn

from server.inputs.sacn_receiver import SACNReceiver


def _free_port() -> int:
    with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def _make_sacn_bytes(universe: int, priority: int, seq: int, level: int) -> bytes:
    # A very loose sACN packet with level repeated for all 512 slots
    dmx = bytes([level] * 512)
    # Reuse builder from unit test, but inline minimal form
    from server.tests.test_sacn_parser_unit import _make_packet
    return _make_packet(universe, priority, seq, dmx)


def test_sacn_integration_without_udp(monkeypatch):
    port = _free_port()
    # enable sACN for app, but we'll inject receiver manually
    monkeypatch.setenv("SACN_ENABLED", "false")
    config = uvicorn.Config("server.app:app", host="127.0.0.1", port=port, log_level="warning")
    server = uvicorn.Server(config)
    t = threading.Thread(target=server.run, daemon=True)
    t.start()

    base = f"http://127.0.0.1:{port}"
    for _ in range(100):
        try:
            r = requests.get(f"{base}/healthz", timeout=0.2)
            if r.status_code == 200:
                break
        except Exception:
            pass
        time.sleep(0.05)

    try:
        # attach receiver directly to context
        import server.app as appmod
        ctx = appmod.app.state.context
        rec = SACNReceiver(ctx)
        # send two sacn frames different priorities
        rec.datagram_received(_make_sacn_bytes(0, 100, 1, 5), ("127.0.0.1", 5568))
        rec.datagram_received(_make_sacn_bytes(0, 120, 2, 7), ("127.0.0.1", 5568))
        # lower local patch shouldn't override higher sACN if lower value
        requests.post(
            f"{base}/command",
            headers={"content-type": "application/json"},
            data=json.dumps({
                "type": "dmx.patch",
                "id": "L1",
                "ts": 0,
                "universe": 0,
                "patch": [{"ch": 1, "val": 6}],
            }),
            timeout=2,
        )
        st1 = requests.get(f"{base}/state", timeout=2).json()
        assert st1["universes"][0][1] == 7
        # higher local wins (>= sACN)
        requests.post(
            f"{base}/command",
            headers={"content-type": "application/json"},
            data=json.dumps({
                "type": "dmx.patch",
                "id": "L2",
                "ts": 0,
                "universe": 0,
                "patch": [{"ch": 1, "val": 10}],
            }),
            timeout=2,
        )
        st2 = requests.get(f"{base}/state", timeout=2).json()
        assert st2["universes"][0][1] == 10
    finally:
        server.should_exit = True
        t.join(timeout=5)

