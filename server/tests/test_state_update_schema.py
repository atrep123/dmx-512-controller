from __future__ import annotations

from server.util.schema import validate_state_update


def test_validate_state_update_valid() -> None:
    ok, err = validate_state_update({
        "type": "state.update",
        "rev": 1,
        "ts": 0,
        "universe": 0,
        "full": False,
        "delta": [{"ch": 1, "val": 10}],
    })
    assert ok and err is None


def test_validate_state_update_invalid() -> None:
    ok, err = validate_state_update({
        "type": "state.update",
        "rev": 1,
        "ts": 0,
        "universe": 0,
        "full": False,
        "delta": [{"ch": 0, "val": 256}],
    })
    assert ok is False
    assert err is not None

