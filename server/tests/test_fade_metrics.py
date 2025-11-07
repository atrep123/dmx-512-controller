from __future__ import annotations

import contextlib
import json
import os
import re
import socket
import threading
import time

import requests
import uvicorn


def _free_port() -> int:
    with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def has_line(txt: str, pat: str) -> bool:
    return re.search(pat, txt) is not None


def test_fade_metrics_exposed() -> None:
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
        r = requests.post(
            f"{base}/command",
            headers={"content-type": "application/json"},
            data=json.dumps({
                "type": "dmx.fade",
                "id": "M-1",
                "ts": 0,
                "universe": 0,
                "durationMs": 200,
                "easing": "linear",
                "patch": [{"ch": 1, "val": 50}],
            }),
            timeout=2,
        )
        assert r.status_code == 200

        time.sleep(0.3)
        txt = ""
        deadline = time.time() + 1.0
        while time.time() < deadline:
            txt = requests.get(f"{base}/metrics", timeout=2).text
            if has_line(txt, r"dmx_core_fade_ticks_total\{[^}]*universe=\"0\"[^}]*\}\s+\d+") and has_line(txt, r"dmx_core_fade_tick_ms_bucket\{.*\}\s+\d+"):
                break
            time.sleep(0.05)
        assert has_line(txt, r"dmx_core_fade_ticks_total\{[^}]*universe=\"0\"[^}]*\}\s+\d+")
        assert has_line(txt, r"dmx_core_fade_tick_ms_bucket\{.*\}\s+\d+")
    finally:
        server.should_exit = True
        t.join(timeout=5)
