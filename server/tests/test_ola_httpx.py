from __future__ import annotations

import contextlib
import json
import os
import socket
import threading
import time

import httpx
import pytest
import requests
import uvicorn


def _free_port() -> int:
    with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


@pytest.mark.parametrize("codes", [[200, 504, 500]])
def test_ola_httpx_errors_and_queue_depth(monkeypatch, codes):
    os.environ["OUTPUT_MODE"] = "ola"
    port = _free_port()

    calls: list[dict] = []

    class FakeResp:
        def __init__(self, status_code: int) -> None:
            self.status_code = status_code

    async def fake_post(self, url: str, data=None, timeout=None):  # type: ignore[no-redef]
        # record call
        calls.append({"url": url, "data": data})
        code = codes[min(len(calls) - 1, len(codes) - 1)]
        # simulate timeout
        if code == 504:
            raise httpx.TimeoutException("timeout")
        return FakeResp(code)

    monkeypatch.setattr(httpx.AsyncClient, "post", fake_post, raising=True)

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
        # two quick patches -> second likely rate-limited; with our fake client, record errors
        for val in (10, 11, 12):
            requests.post(
                f"{base}/command",
                headers={"content-type": "application/json"},
                data=json.dumps({
                    "type": "dmx.patch",
                    "id": f"h-{val}-{time.time_ns()}",
                    "ts": 0,
                    "universe": 0,
                    "patch": [{"ch": 1, "val": val}],
                }),
                timeout=2.0,
            )
        time.sleep(0.3)
        metrics = requests.get(f"{base}/metrics", timeout=2.0).text
        assert "dmx_core_ola_http_errors_total" in metrics
        assert "dmx_core_ola_http_errors_total_by_code" in metrics
        # queue depth gauge present (may be 0 if timings align, so only assert presence)
        assert "dmx_core_ola_queue_depth" in metrics
    finally:
        server.should_exit = True
        t.join(timeout=5)
