"""WebSocket hub for broadcasting state updates."""

from __future__ import annotations

import asyncio
import contextlib
import json
from typing import Any

from fastapi import WebSocket


class WSHub:
    """Track WebSocket clients and broadcast messages."""

    def __init__(self, *, send_timeout: float = 0.2) -> None:
        self._clients: set[WebSocket] = set()
        self._lock = asyncio.Lock()
        self._send_timeout = send_timeout

    async def register(self, ws: WebSocket) -> None:
        await ws.accept()
        async with self._lock:
            self._clients.add(ws)

    async def unregister(self, ws: WebSocket) -> None:
        async with self._lock:
            self._clients.discard(ws)

    async def send_state(self, state: dict[str, Any]) -> None:
        message = {
            "type": "state",
            "r": state["r"],
            "g": state["g"],
            "b": state["b"],
            "seq": state["seq"],
            "ts": state["ts"],
        }
        payload = json.dumps(message)
        async with self._lock:
            clients = list(self._clients)
        if not clients:
            return
        tasks = [asyncio.create_task(self._send(ws, payload)) for ws in clients]
        _, pending = await asyncio.wait(tasks, timeout=self._send_timeout)
        for pending_task in pending:
            pending_task.cancel()

    async def count(self) -> int:
        async with self._lock:
            return len(self._clients)

    async def _send(self, ws: WebSocket, payload: str) -> None:
        try:
            await ws.send_text(payload)
        except Exception:
            await self.unregister(ws)
            with contextlib.suppress(Exception):
                await ws.close()


__all__ = ["WSHub"]
