"""OLA DMX driver."""

from __future__ import annotations

import asyncio
import time
from typing import Any

import anyio
import requests


class OLAClient:
    """Rate-limited OLA DMX client."""

    def __init__(self, url: str, universe: int, fps: int = 44) -> None:
        self.url = url
        self.universe = universe
        self._interval = 1.0 / fps
        self._next_ts = 0.0
        self._last_frame: list[int] | None = None
        self._lock = asyncio.Lock()

    async def __call__(self, state: dict[str, Any]) -> None:
        frame = [0] * 512
        frame[0:3] = [int(state["r"]), int(state["g"]), int(state["b"])]
        async with self._lock:
            now = time.monotonic()
            if frame == self._last_frame:
                return
            if now < self._next_ts:
                return
            self._next_ts = now + self._interval
            self._last_frame = frame.copy()
        await self._post(frame)

    async def _post(self, frame: list[int]) -> None:
        data = {
            "u": self.universe,
            "d": ",".join(str(value) for value in frame),
        }
        try:
            await anyio.to_thread.run_sync(
                requests.post,
                self.url,
                data=data,
                timeout=0.5,
            )
        except Exception:
            # Fail open: the engine must not block on OLA errors.
            pass


__all__ = ["OLAClient"]
