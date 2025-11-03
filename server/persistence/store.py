"""Simple JSON state persistence."""

from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import Any, TypedDict


class RGBState(TypedDict):
    schema: str
    r: int
    g: int
    b: int
    seq: int
    updatedBy: str
    ts: int


class StateStore:
    """Persist last known state to disk for warm restarts."""

    def __init__(self, path: Path) -> None:
        self.path = path
        self._lock = asyncio.Lock()

    async def load(self) -> RGBState | None:
        try:
            data = await asyncio.to_thread(self.path.read_text, "utf-8")
        except FileNotFoundError:
            return None
        except OSError:
            return None
        try:
            payload = json.loads(data)
        except json.JSONDecodeError:
            return None
        if not isinstance(payload, dict):
            return None
        required_keys = {"schema", "r", "g", "b", "seq", "updatedBy", "ts"}
        if not required_keys <= payload.keys():
            return None
        return payload  # type: ignore[return-value]

    async def save(self, state: RGBState) -> None:
        async with self._lock:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            data = json.dumps(state, separators=(",", ":"))
            await asyncio.to_thread(self.path.write_text, data, "utf-8")


__all__ = ["StateStore", "RGBState"]
