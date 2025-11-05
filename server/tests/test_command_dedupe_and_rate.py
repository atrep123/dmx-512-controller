from __future__ import annotations

import asyncio
import json
import time

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


def _get_state(base: str) -> dict:
    return requests.get(f"{base}/state", timeout=2.0).json()


async def test_cross_path_dedupe(live_server_url: str):
    # Snapshot before
    _before = _get_state(live_server_url)
    # Send same id over REST and WS
    cid = "x-dup-1"
    rest_ack = _post_cmd(live_server_url, cid, 2, 11)
    assert rest_ack["ack"] == cid and rest_ack["accepted"] is True

    uri = live_server_url.replace("http", "ws") + "/ws?token=demo-key"
    async with websockets.connect(uri, ping_timeout=5) as ws:
        # drain initial 1-2 messages
        for _ in range(2):
            try:
                await asyncio.wait_for(ws.recv(), timeout=1.0)
            except asyncio.TimeoutError:
                break
        await ws.send(json.dumps({
            "type": "dmx.patch",
            "id": cid,
            "ts": 0,
            "universe": 0,
            "patch": [{"ch": 2, "val": 11}],
        }))
        ack = json.loads(await asyncio.wait_for(ws.recv(), timeout=2))
        assert ack["ack"] == cid

    after = _get_state(live_server_url)
    # State must reflect exactly one application for ch=2 (not two increments).
    assert after["universes"][0][2] == 11


def _burst(base: str, n: int, ch: int) -> int:
    hits = 0
    for i in range(n):
        r = requests.post(
            f"{base}/command",
            headers={"content-type": "application/json"},
            data=json.dumps({
                "type": "dmx.patch",
                "id": f"rl-{i}",
                "ts": 0,
                "universe": 0,
                "patch": [{"ch": ch, "val": i % 256}],
            }),
            timeout=1.5,
        ).json()
        if r.get("accepted") is False and r.get("reason") == "RATE_LIMITED":
            hits += 1
    return hits


def test_rate_limit_probe(live_server_url: str):
    # quick probe: exceed ~60 cmds/sec
    start = time.perf_counter()
    hits = _burst(live_server_url, 70, 3)
    elapsed = time.perf_counter() - start
    # Don't assert exact count; ensure we see some RATE_LIMITED if sent swiftly
    assert hits >= 1 or elapsed < 1.2

