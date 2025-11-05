from __future__ import annotations

import json
import time
import uuid
from typing import Dict, List

import pytest
import requests
from hypothesis import given, settings
from hypothesis import strategies as st


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
    return resp.json()


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


@pytest.mark.asyncio
@settings(deadline=None, max_examples=30)
@given(seq=st.lists(patch_list, min_size=1, max_size=20))
async def test_patch_sequence_last_write_wins(live_server_url: str, seq: list[list[dict]]):
    # Vezmi výchozí stav a spočítej očekávané hodnoty aplikací LWW
    initial = _uni0_channels(_get_state(live_server_url))
    expected = {1: initial.get(1, 0), 2: initial.get(2, 0), 3: initial.get(3, 0)}

    for patch in seq:
        # LWW uvnitř patche – poslední výskyt kanálu vyhrává
        temp = expected.copy()
        for it in patch:
            ch = int(it["ch"])
            val = int(it["val"])
            if ch in (1, 2, 3):
                temp[ch] = val
        expected = temp
        # Pošli příkaz s unikátním id, aby nezasáhl dedupe
        _post_cmd(live_server_url, f"prop-{uuid.uuid4()}", patch)

    # Pošli lehce „naháněcí“ smyčku, než engine dorovná stav
    deadline = time.perf_counter() + 2.0
    ok = False
    while time.perf_counter() < deadline:
        cur = _uni0_channels(_get_state(live_server_url))
        if cur.get(1) == expected[1] and cur.get(2) == expected[2] and cur.get(3) == expected[3]:
            ok = True
            break
        time.sleep(0.02)

    assert ok, f"Final state {cur} != expected {expected}"

