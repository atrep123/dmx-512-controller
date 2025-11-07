"""JSON Schema loading and validation helpers."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator
from typing import Tuple


class SchemaBundle:
    def __init__(self, root: Path) -> None:
        self.root = root
        self._validators: dict[str, Draft202012Validator] = {}

    def _load(self, rel: str) -> Draft202012Validator:
        path = self.root / rel
        with path.open("r", encoding="utf-8") as f:
            schema = json.load(f)
        return Draft202012Validator(schema)

    def command(self) -> Draft202012Validator:
        if "command" not in self._validators:
            self._validators["command"] = self._load("shared/schema/command.schema.json")
        return self._validators["command"]

    def state(self) -> Draft202012Validator:
        if "state" not in self._validators:
            self._validators["state"] = self._load("shared/schema/state.schema.json")
        return self._validators["state"]

    def ack(self) -> Draft202012Validator:
        if "ack" not in self._validators:
            self._validators["ack"] = self._load("shared/schema/ack.schema.json")
        return self._validators["ack"]

    def state_update(self) -> Draft202012Validator:
        if "state.update" not in self._validators:
            self._validators["state.update"] = self._load("shared/schema/state.update.schema.json")
        return self._validators["state.update"]

    def fixture(self) -> Draft202012Validator:
        if "fixture.set" not in self._validators:
            self._validators["fixture.set"] = self._load("shared/schema/fixture.set.schema.json")
        return self._validators["fixture.set"]

    def fade(self) -> Draft202012Validator:
        if "fade" not in self._validators:
            self._validators["fade"] = self._load("shared/schema/fade.schema.json")
        return self._validators["fade"]

    def validate_state_update(self, payload: dict) -> Tuple[bool, str | None]:
        """Validate a state.update payload. Returns (ok, error_message)."""
        try:
            errors = list(self.state_update().iter_errors(payload))
        except Exception as exc:  # pragma: no cover - defensive
            return False, str(exc)
        if errors:
            # Return the first concise error for quick diagnostics
            err = errors[0]
            path = "/" + "/".join(map(str, err.path))
            return False, f"{path}: {err.message}"
        return True, None


def load_schemas() -> SchemaBundle:
    # Repository root: two levels up from this file (server/util/schema.py)
    root = Path(__file__).resolve().parents[2]
    return SchemaBundle(root)


# Convenience function for callers that don't want to keep a bundle around
def validate_state_update(payload: dict) -> tuple[bool, str | None]:
    return load_schemas().validate_state_update(payload)


__all__ = ["SchemaBundle", "load_schemas", "validate_state_update"]
