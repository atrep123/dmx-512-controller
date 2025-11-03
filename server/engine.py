"""Single-writer state engine."""

from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass, field
from typing import Awaitable, Callable, Deque, Dict

from .models import RGBCommand, STATE_SCHEMA

PublishStateCallback = Callable[[dict[str, int | str]], Awaitable[None]]
BroadcastCallback = Callable[[dict[str, int | str]], Awaitable[None]]
PersistCallback = Callable[[dict[str, int | str]], Awaitable[None]]


@dataclass
class EngineMetrics:
    """Counters exposed by the engine."""

    processed: int = 0
    deduped: int = 0
    dropped: int = 0
    last_latency_ms: int = 0


@dataclass
class Engine:
    """Single writer engine responsible for canonical state updates."""

    publish_state_cb: PublishStateCallback
    broadcast_state_cb: BroadcastCallback
    persist_state_cb: PersistCallback
    dedupe_accept: Callable[[str | None], Awaitable[bool]] | None = None
    ola_cb: Callable[[dict[str, int | str]], Awaitable[None]] | None = None
    queue_limit: int = 10_000
    metrics: EngineMetrics = field(default_factory=EngineMetrics)

    def __post_init__(self) -> None:
        initial_ts = int(time.time() * 1000)
        self.state: Dict[str, int | str] = {
            "schema": STATE_SCHEMA,
            "r": 0,
            "g": 0,
            "b": 0,
            "seq": 0,
            "updatedBy": "init",
            "ts": initial_ts,
        }
        self._queue: asyncio.Queue[RGBCommand] = asyncio.Queue(maxsize=self.queue_limit)
        self._queue_lock = asyncio.Lock()
        self._running = False

    async def submit(self, cmd: RGBCommand) -> bool:
        """Submit a command for processing, respecting backpressure."""

        try:
            self._queue.put_nowait(cmd)
            return True
        except asyncio.QueueFull:
            async with self._queue_lock:
                dropped = self._drop_ui_command()
                if dropped:
                    self.metrics.dropped += 1
                    self._queue.put_nowait(cmd)
                    return True
            await self._queue.put(cmd)
            return True

    def _drop_ui_command(self) -> bool:
        queue = self._queue
        try:
            internal_queue: Deque[RGBCommand] = queue._queue  # type: ignore[attr-defined]
        except AttributeError:  # pragma: no cover - CPython specific safeguard
            return False
        for idx, item in enumerate(internal_queue):
            if item.src == "ui":
                del internal_queue[idx]
                return True
        return False

    def queue_depth(self) -> int:
        return self._queue.qsize()

    def queue_empty(self) -> bool:
        return self._queue.empty()

    async def bootstrap(self, state: dict[str, int | str]) -> None:
        """Seed engine state from persisted data."""

        self.state.update(state)

    async def run(self) -> None:
        """Main processing loop."""

        if self._running:
            return
        self._running = True
        try:
            while True:
                cmd = await self._queue.get()
                start = time.perf_counter()
                if self.dedupe_accept is not None:
                    accepted = await self.dedupe_accept(cmd.cmdId)
                    if not accepted:
                        self.metrics.deduped += 1
                        continue
                updated = await self._apply(cmd)
                if not updated:
                    continue
                latency_ms = int((time.perf_counter() - start) * 1000)
                self.metrics.processed += 1
                self.metrics.last_latency_ms = latency_ms
        except asyncio.CancelledError:
            self._running = False
            raise

    async def _apply(self, cmd: RGBCommand) -> bool:
        r = max(0, min(255, int(cmd.r)))
        g = max(0, min(255, int(cmd.g)))
        b = max(0, min(255, int(cmd.b)))
        prev_rgb = (self.state["r"], self.state["g"], self.state["b"])
        if prev_rgb == (r, g, b):
            return False
        seq = int(self.state["seq"]) + 1
        now_ms = int(time.time() * 1000)
        self.state.update(
            {
                "schema": STATE_SCHEMA,
                "r": r,
                "g": g,
                "b": b,
                "seq": seq,
                "updatedBy": cmd.src,
                "ts": now_ms,
            }
        )
        await self.persist_state_cb(self.state)
        await self.publish_state_cb(self.state)
        await self.broadcast_state_cb(self.state)
        if self.ola_cb is not None:
            await self.ola_cb(self.state)
        return True


__all__ = ["Engine", "EngineMetrics"]
