"""WebSocket hub for broadcasting state updates."""

from __future__ import annotations

import asyncio
import contextlib
import json
from typing import Any

from fastapi import WebSocket
import os
import logging
from .util.schema import validate_state_update

DEBUG_SCHEMA = os.getenv("DEBUG", "false").lower() in {"1", "true", "yes"}
logger = logging.getLogger("ws_hub")


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
        message_legacy = {
            "type": "state",
            "r": state["r"],
            "g": state["g"],
            "b": state["b"],
            "seq": state["seq"],
            "ts": state["ts"],
        }
        payload_legacy = json.dumps(message_legacy)

        message_unified = {
            "type": "state.update",
            "rev": state["seq"],
            "ts": state["ts"],
            "universe": 0,
            "delta": [
                {"ch": 1, "val": state["r"]},
                {"ch": 2, "val": state["g"]},
                {"ch": 3, "val": state["b"]},
            ],
            "full": False,
        }
        # DEV/CI guard: validate outgoing state.update against schema
        if DEBUG_SCHEMA:
            ok, err = validate_state_update(message_unified)
            if not ok:
                logger.error("state_update_schema_invalid", extra={"err": err})
                message_unified = None  # don't send invalid unified payload in DEBUG
        payload_unified = json.dumps(message_unified) if message_unified is not None else None
        async with self._lock:
            clients = list(self._clients)
        if not clients:
            return
        async def send_both(ws: WebSocket) -> None:
            await self._send(ws, payload_legacy)
            if payload_unified is not None:
                await self._send(ws, payload_unified)
        tasks = [asyncio.create_task(send_both(ws)) for ws in clients]
        _, pending = await asyncio.wait(tasks, timeout=self._send_timeout)
        for pending_task in pending:
            pending_task.cancel()

    async def send_payload(self, payload: dict[str, Any]) -> None:
        data = json.dumps(payload)
        async with self._lock:
            clients = list(self._clients)
        if not clients:
            return
        tasks = [asyncio.create_task(self._send(ws, data)) for ws in clients]
        _, pending = await asyncio.wait(tasks, timeout=self._send_timeout)
        for p in pending:
            p.cancel()

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
