from __future__ import annotations

import contextlib
import socket
import threading
import time

import requests
import uvicorn

from server.inputs.sacn_receiver import SACNReceiver


def _free_port() -> int:
    with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def test_sacn_diag_and_metrics(monkeypatch):
    port = _free_port()
    monkeypatch.setenv("SACN_ENABLED", "false")
    import importlib
    import server.app as appmod
    importlib.reload(appmod)
    config = uvicorn.Config(
        "server.app:app",
        host="127.0.0.1",
        port=port,
        log_level="warning",
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
        ctx = appmod.app.state.context
        rec = SACNReceiver(ctx)
        appmod.app.state.context._sacn_receiver = rec
        # inject one fake source
        cid = b"X" * 16
        from server.inputs.sacn_receiver import SACNSource
        rec.sources[(0, cid)] = SACNSource(priority=90, last_seq=1, last_seen_ms=int(time.time()*1000))

        # diagnostics endpoint returns list
        diag = requests.get(f"{base}/sacn/sources", timeout=2).json()
        assert isinstance(diag, list) and diag and diag[0]["universe"] == 0

        # metrics presence
        metrics = requests.get(f"{base}/metrics", timeout=2).text
        # No packets yet, but sources gauge may be updated by rec
        assert "dmx_core_sacn_sources" in metrics
    finally:
        server.should_exit = True
        t.join(timeout=5)
