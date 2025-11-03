"""Application context shared across the API."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field

from asyncio_mqtt import Client

from .config import Settings
from .engine import Engine, EngineMetrics
from .persistence.dedupe import CommandDeduplicator
from .persistence.store import StateStore
from .ws_hub import WSHub


@dataclass
class AppContext:
    settings: Settings
    hub: WSHub
    store: StateStore
    dedupe: CommandDeduplicator
    engine: Engine | None = None
    mqtt_publisher: Client | None = None
    engine_task: asyncio.Task[None] | None = None
    mqtt_task: asyncio.Task[None] | None = None
    mqtt_connected: bool = False
    metrics: EngineMetrics = field(default_factory=EngineMetrics)

    def set_mqtt_connected(self, value: bool) -> None:
        self.mqtt_connected = value


__all__ = ["AppContext"]
