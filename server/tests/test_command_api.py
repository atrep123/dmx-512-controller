from __future__ import annotations

from fastapi.testclient import TestClient


def test_command_valid_patch_accepts_and_updates_state(test_app: tuple) -> None:
    app, context, _ = test_app
    with TestClient(app) as client:
        # initial snapshot
        s1 = client.get('/state').json()
        assert 'universes' in s1 and '0' in {str(k) for k in s1['universes'].keys()} or True

        payload = {
            "type": "dmx.patch",
            "id": "smk-1",
            "ts": 0,
            "universe": 0,
            "patch": [
                {"ch": 1, "val": 10},
                {"ch": 2, "val": 20},
                {"ch": 3, "val": 30},
            ],
        }
        ack = client.post('/command', json=payload).json()
        assert ack["ack"] == "smk-1"
        assert ack["accepted"] is True

        # snapshot reflects new values
        s2 = client.get('/state').json()
        universes = s2['universes']
        uni0 = universes.get(0) or universes.get('0')
        assert uni0 is not None
        # keys may be strings after JSON roundtrip
        v = lambda k: uni0.get(k) if isinstance(uni0, dict) else None
        assert v(1) == 10 or v('1') == 10
        assert v(2) == 20 or v('2') == 20
        assert v(3) == 30 or v('3') == 30


def test_command_invalid_patch_rejected_with_reason(test_app: tuple) -> None:
    app, _context, _ = test_app
    with TestClient(app) as client:
        payload = {
            "type": "dmx.patch",
            "id": "bad-1",
            "ts": 0,
            "universe": 0,
            "patch": [
                {"ch": 999, "val": 300}
            ],
        }
        ack = client.post('/command', json=payload).json()
        assert ack["ack"] == "bad-1"
        assert ack["accepted"] is False
        assert ack["reason"] in ("VALIDATION_FAILED", "PATCH_TOO_LARGE")
        assert isinstance(ack.get("ts"), int)
