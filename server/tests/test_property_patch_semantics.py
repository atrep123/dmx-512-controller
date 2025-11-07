from __future__ import annotations

import contextlib
import json
import socket
import threading
import time
import uuid
from typing import Dict, List

import pytest
import requests
import uvicorn
from hypothesis import given, settings
from hypothesis import strategies as st


def _free_port() -> int:
    with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def _get_state(base: str) -> dict:
    return requests.get(f"{base}/state", timeout=2.0).json()


def _post_cmd(base: str, cid: str, patch: List[Dict[str, int]]) -> dict:
    resp = requests.post(
        f"{base}/command",
        headers={"content-type": "application/json"},
        data=json.dumps({
            "type": "dmx.patch",
            "id": cid,
            "ts": 0,
            "universe": 0,
            "patch": patch,
        }),
        timeout=2.0,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("accepted") is True
    time.sleep(0.01)
    return data


def _uni0_channels(state: dict) -> Dict[int, int]:
    universes = state.get("universes", {})
    uni0 = universes.get(0) or universes.get("0") or {}
    # normalize keys to int
    out: Dict[int, int] = {}
    for k, v in uni0.items():
        try:
            out[int(k)] = int(v)
        except Exception:
            pass
    return out


patch_item = st.fixed_dictionaries({
    "ch": st.integers(min_value=1, max_value=3),  # engine maps 1..3 -> RGB
    "val": st.integers(min_value=0, max_value=255),
})

patch_list = st.lists(patch_item, min_size=1, max_size=8)


@pytest.fixture(scope="module")
def prop_server_url() -> str:
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
            resp = requests.get(f"{base}/healthz", timeout=0.2)
            if resp.status_code == 200:
                break
        except Exception:
            pass
        time.sleep(0.05)

    try:
        yield base
    finally:
        server.should_exit = True
        t.join(timeout=5)


@settings(deadline=None, max_examples=30)
@given(seq=st.lists(patch_list, min_size=1, max_size=20))
def test_patch_sequence_last_write_wins(seq: list[list[dict]], prop_server_url: str):
    initial = _uni0_channels(_get_state(prop_server_url))
    expected = {1: initial.get(1, 0), 2: initial.get(2, 0), 3: initial.get(3, 0)}

    for patch in seq:
        temp = expected.copy()
        for it in patch:
            ch = int(it["ch"])
            val = int(it["val"])
            if ch in (1, 2, 3):
                temp[ch] = val
        expected = temp
        _post_cmd(prop_server_url, f"prop-{uuid.uuid4()}", patch)

    deadline = time.perf_counter() + 2.0
    ok = False
    while time.perf_counter() < deadline:
        cur = _uni0_channels(_get_state(prop_server_url))
        if cur.get(1) == expected[1] and cur.get(2) == expected[2] and cur.get(3) == expected[3]:
            ok = True
            break
        time.sleep(0.02)

    assert ok, f"Final state {cur} != expected {expected}"
