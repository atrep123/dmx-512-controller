from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import Any, List


class ScenesStore:
    def __init__(self, path: Path) -> None:
        self.path = path
        self._lock = asyncio.Lock()

    async def load(self) -> list[dict[str, Any]]:
        try:
            data = await asyncio.to_thread(self.path.read_text, "utf-8")
        except FileNotFoundError:
            return []
        except OSError:
            return []
        try:
            payload = json.loads(data)
        except json.JSONDecodeError:
            return []
        if isinstance(payload, list):
            return payload
        return []

    async def save(self, scenes: List[dict[str, Any]]) -> None:
        async with self._lock:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            data = json.dumps(scenes, ensure_ascii=False, separators=(",", ":"))
            await asyncio.to_thread(self.path.write_text, data, "utf-8")


__all__ = ["ScenesStore"]
