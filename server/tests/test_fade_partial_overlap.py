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


def _free_port() -> int:
    with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def test_fade_partial_overlap_ltp() -> None:
    os.environ["FADES_ENABLED"] = "true"
    port = _free_port()
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
        # Fade ch1->200, ch2->200 /1000 ms
        requests.post(
            f"{base}/command",
            headers={"content-type": "application/json"},
            data=json.dumps({
                "type": "dmx.fade",
                "id": "F2",
                "ts": 0,
                "universe": 0,
                "durationMs": 1000,
                "easing": "linear",
                "patch": [{"ch": 1, "val": 200}, {"ch": 2, "val": 200}],
            }),
            timeout=2,
        )
        time.sleep(0.2)
        # LTP patch ch2:7
        requests.post(
            f"{base}/command",
            headers={"content-type": "application/json"},
            data=json.dumps({
                "type": "dmx.patch",
                "id": "P2",
                "ts": 0,
                "universe": 0,
                "patch": [{"ch": 2, "val": 7}],
            }),
            timeout=2,
        )
        time.sleep(0.7)
        st = requests.get(f"{base}/state", timeout=2).json()
        # ch1 should be > 0 (fade progressed), ch2 must be exactly 7
        assert st["universes"][0][1] > 0
        assert st["universes"][0][2] == 7
        metrics = requests.get(f"{base}/metrics", timeout=2).text
        assert "dmx_core_fades_cancelled_total" in metrics and "reason=\"ltp\"" in metrics
    finally:
        server.should_exit = True
        t.join(timeout=5)

