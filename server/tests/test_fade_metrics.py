from __future__ import annotations

import json
import os
import re
import time

import requests


def has_line(txt: str, pat: str) -> bool:
    return re.search(pat, txt) is not None


def test_fade_metrics_exposed(live_server_url: str, monkeypatch) -> None:
    # enable fades via env (fixture may reuse already running app; assume metrics still present after fade runs)
    os.environ["FADES_ENABLED"] = "true"

    r = requests.post(
        f"{live_server_url}/command",
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
    txt = requests.get(f"{live_server_url}/metrics", timeout=2).text
    assert has_line(txt, r"dmx_core_fade_ticks_total\{[^}]*universe=\"0\"[^}]*\}\s+\d+")
    assert has_line(txt, r"dmx_core_fade_tick_ms_bucket\{.*\}\s+\d+")
