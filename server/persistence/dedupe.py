"""Command deduplication cache with persistence."""

from __future__ import annotations

import asyncio
import json
import time
from collections import OrderedDict
from pathlib import Path
from typing import Iterable


class CommandDeduplicator:
    """LRU deduplication cache with TTL and persistence."""

    def __init__(
        self,
        *,
        ttl_seconds: int,
        capacity: int,
        path: Path,
    ) -> None:
        self.ttl_seconds = ttl_seconds
        self.capacity = capacity
        self.path = path
        self._entries: OrderedDict[str, float] = OrderedDict()
        self._lock = asyncio.Lock()
        self._load()

    def _load(self) -> None:
        if not self.path.exists():
            return
        try:
            data = json.loads(self.path.read_text("utf-8"))
        except (OSError, json.JSONDecodeError):
            return
        now = time.time()
        for cmd_id, ts in data.items():
            if not isinstance(cmd_id, str):
                continue
            try:
                ts_val = float(ts)
            except (TypeError, ValueError):
                continue
            if now - ts_val < self.ttl_seconds:
                self._entries[cmd_id] = ts_val
        self._prune(now)

    def _save(self) -> None:
        try:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            self.path.write_text(json.dumps(self._entries), encoding="utf-8")
        except OSError:
            # Persistence is best-effort.
            pass

    def _prune(self, now: float) -> None:
        ttl = self.ttl_seconds
        expired: Iterable[str] = [
            key for key, ts in self._entries.items() if now - ts >= ttl
        ]
        for key in expired:
            self._entries.pop(key, None)
        while len(self._entries) > self.capacity:
            self._entries.popitem(last=False)

    async def accept(self, cmd_id: str | None) -> bool:
        """Return True if the command should be processed."""

        if not cmd_id:
            return True
        now = time.time()
        async with self._lock:
            if cmd_id in self._entries:
                if now - self._entries[cmd_id] < self.ttl_seconds:
                    return False
            self._entries[cmd_id] = now
            self._entries.move_to_end(cmd_id)
            self._prune(now)
            self._save()
        return True


__all__ = ["CommandDeduplicator"]
