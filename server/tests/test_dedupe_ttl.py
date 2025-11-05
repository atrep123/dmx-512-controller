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


@pytest.mark.parametrize("ttl", [2])
def test_dedupe_ttl_expires(ttl: int) -> None:
    # Start a dedicated server with short dedupe TTL
    os.environ["DEDUPE_TTL_SEC"] = str(ttl)
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

    try:
        cid = "ttl-1"
        # First command
        a1 = requests.post(
            f"{base}/command",
            headers={"content-type": "application/json"},
            data=json.dumps({
                "type": "dmx.patch",
                "id": cid,
                "ts": 0,
                "universe": 0,
                "patch": [{"ch": 1, "val": 10}],
            }),
            timeout=2.0,
        ).json()
        assert a1.get("accepted") is True

        # Immediately retry same id -> deduped; request can be accepted=true but engine won't apply twice
        a2 = requests.post(
            f"{base}/command",
            headers={"content-type": "application/json"},
            data=json.dumps({
                "type": "dmx.patch",
                "id": cid,
                "ts": 0,
                "universe": 0,
                "patch": [{"ch": 1, "val": 20}],
            }),
            timeout=2.0,
        ).json()
        # Let TTL expire
        time.sleep(ttl + 0.3)

        # Same id after TTL should apply again (value changes to 30)
        a3 = requests.post(
            f"{base}/command",
            headers={"content-type": "application/json"},
            data=json.dumps({
                "type": "dmx.patch",
                "id": cid,
                "ts": 0,
                "universe": 0,
                "patch": [{"ch": 1, "val": 30}],
            }),
            timeout=2.0,
        ).json()
        assert a3.get("accepted") is True

        state = requests.get(f"{base}/state", timeout=2.0).json()
        uni0 = state["universes"][0]
        # Final value should be 30 (post-TTL apply)
        assert uni0[1] == 30
    finally:
        server.should_exit = True
        t.join(timeout=5)

