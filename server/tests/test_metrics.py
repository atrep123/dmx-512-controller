from __future__ import annotations

import json
import re

import pytest
import requests
import websockets

pytestmark = pytest.mark.asyncio


def _post_cmd(base: str, cid: str, ch: int, val: int) -> dict:
    resp = requests.post(
        f"{base}/command",
        headers={"content-type": "application/json"},
        data=json.dumps({
            "type": "dmx.patch",
            "id": cid,
            "ts": 0,
            "universe": 0,
            "patch": [{"ch": ch, "val": val}],
        }),
        timeout=2.0,
    )
    assert resp.status_code == 200
    return resp.json()


def _has(text: str, pat: str) -> bool:
    return re.search(pat, text) is not None


async def test_metrics_prometheus_text(live_server_url: str):
    # Send 2 REST commands
    _post_cmd(live_server_url, "m-1", 1, 10)
    _post_cmd(live_server_url, "m-2", 2, 20)
    # Send 1 WS command
    uri = live_server_url.replace("http", "ws") + "/ws?token=demo-key"
    async with websockets.connect(uri, ping_timeout=5) as ws:
        # drain initial
        for _ in range(2):
            try:
                ws_msg = await ws.recv()
                if not ws_msg:
                    break
            except Exception:
                break
        await ws.send(json.dumps({
            "type": "dmx.patch",
            "id": "m-3",
            "ts": 0,
            "universe": 0,
            "patch": [{"ch": 3, "val": 30}],
        }))
        # read ack
        await ws.recv()

    txt = requests.get(f"{live_server_url}/metrics", timeout=2.0).text
    # counters by proto/type/accepted
    assert _has(txt, r"dmx_core_cmds_total\{[^}]*proto=\"rest\"[^}]*type=\"dmx\.patch\"[^}]*accepted=\"true\"[^}]*\}\s+\d+")
    assert _has(txt, r"dmx_core_cmds_total\{[^}]*proto=\"ws\"[^}]*type=\"dmx\.patch\"[^}]*accepted=\"true\"[^}]*\}\s+\d+")
    # latency histogram present
    assert _has(txt, r"dmx_core_ack_latency_ms_bucket\{.*\}\s+\d+")
    # patch size gauge present
    assert _has(txt, r"^dmx_core_patch_size\s+\d+\s*$")
    # dedup hits counter exists (value may be 0)
    assert _has(txt, r"^dmx_core_dedup_hits_total\s+\d+\s*$")

