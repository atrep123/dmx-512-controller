from __future__ import annotations

import json
import requests


def test_state_etag_and_sparse(live_server_url: str) -> None:
    r1 = requests.get(f"{live_server_url}/state", timeout=2)
    assert r1.status_code == 200
    etag = r1.headers.get("ETag")
    assert etag and etag.startswith('W/"rev-')

    r2 = requests.get(f"{live_server_url}/state", headers={"If-None-Match": etag}, timeout=2)
    assert r2.status_code == 304

    # nastav hodnoty
    payload = {
        "type": "dmx.patch",
        "id": "s-1",
        "ts": 0,
        "universe": 0,
        "patch": [{"ch": 3, "val": 9}, {"ch": 5, "val": 7}],
    }
    r_cmd = requests.post(
        f"{live_server_url}/command",
        headers={"content-type": "application/json"},
        data=json.dumps(payload),
        timeout=2,
    )
    assert r_cmd.status_code == 200

    r3 = requests.get(f"{live_server_url}/state", params={"sparse": 1}, timeout=2)
    assert r3.status_code == 200
    j = r3.json()
    assert j.get("sparse") is True
    us = j.get("universesSparse", {})
    u0 = us.get("0", {})
    assert u0.get("3") == 9 and u0.get("5") == 7
    assert "1" not in u0  # nulové kanály v sparse nesmí být

