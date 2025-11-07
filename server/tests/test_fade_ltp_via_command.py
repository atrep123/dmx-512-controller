from __future__ import annotations

import contextlib
import json
import os
import socket
import threading
import time

import pytest
import requests
import uvicorn

from server.tests.utils import channel_value


def _free_port() -> int:
    with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def test_fade_ltp_via_command_cancel() -> None:
    os.environ["FADES_ENABLED"] = "true"
    port = _free_port()
    config = uvicorn.Config(
        "server.app:create_app",
        host="127.0.0.1",
        port=port,
        log_level="warning",
        factory=True,
    )
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
        # Start fade 0->200 over 600ms
        requests.post(
            f"{base}/command",
            headers={"content-type": "application/json"},
            data=json.dumps({
                "type": "dmx.fade",
                "id": "F1",
                "ts": 0,
                "universe": 0,
                "durationMs": 600,
                "easing": "linear",
                "patch": [{"ch": 1, "val": 200}],
            }),
            timeout=2,
        )
        time.sleep(0.2)
        # LTP patch to 10
        requests.post(
            f"{base}/command",
            headers={"content-type": "application/json"},
            data=json.dumps({
                "type": "dmx.patch",
                "id": "P1",
                "ts": 0,
                "universe": 0,
                "patch": [{"ch": 1, "val": 10}],
            }),
            timeout=2,
        )
        time.sleep(0.5)
        st = requests.get(f"{base}/state", timeout=2).json()
        assert channel_value(st, 0, 1) == 10
        metrics = requests.get(f"{base}/metrics", timeout=2).text
        assert "dmx_core_fades_cancelled_total" in metrics and "reason=\"ltp\"" in metrics
    finally:
        server.should_exit = True
        t.join(timeout=5)
