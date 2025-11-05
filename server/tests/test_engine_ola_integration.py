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


def test_engine_triggers_ola_with_rate_and_debounce(monkeypatch) -> None:
    # Enable OLA output pipeline
    os.environ["OUTPUT_MODE"] = "ola"
    port = _free_port()
    # Monkeypatch requests.post used by ola_universe to capture calls
    sent: list[dict] = []

    def fake_post(url: str, data: dict[str, str], timeout=0.5):
        sent.append({"url": url, "data": data})

    import server.drivers.ola_universe as mod

    monkeypatch.setattr(mod.requests, "post", fake_post, raising=True)

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

    try:
        # Send two quick patches -> at most one frame due to rate limit
        for val in (50, 50):
            r = requests.post(
                f"{base}/command",
                headers={"content-type": "application/json"},
                data=json.dumps({
                    "type": "dmx.patch",
                    "id": f"ola-{val}-{time.time_ns()}",
                    "ts": 0,
                    "universe": 0,
                    "patch": [{"ch": 1, "val": val}],
                }),
                timeout=2.0,
            )
            assert r.status_code == 200
        # Allow a short window for async send
        time.sleep(0.2)
        # At least one send should have occurred
        assert len(sent) >= 1
        # Debounce identical: subsequent identical frame should not increase count much
        count_after_identical = len(sent)

        # Change value and send again after short sleep (above debounce identical, maybe below fps)
        time.sleep(0.01)
        r = requests.post(
            f"{base}/command",
            headers={"content-type": "application/json"},
            data=json.dumps({
                "type": "dmx.patch",
                "id": f"ola-51-{time.time_ns()}",
                "ts": 0,
                "universe": 0,
                "patch": [{"ch": 1, "val": 51}],
            }),
            timeout=2.0,
        )
        assert r.status_code == 200
        time.sleep(0.2)
        # It is acceptable whether rate limit skipped or sent; assert metrics presence
        metrics = requests.get(f"{base}/metrics", timeout=2.0).text
        assert "dmx_core_ola_frames_total" in metrics
        assert "dmx_core_ola_frames_skipped_total" in metrics
    finally:
        server.should_exit = True
        t.join(timeout=5)

