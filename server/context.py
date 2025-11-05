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
from .util.ratelimit import RateLimiter
from .util.metrics import CoreMetrics
from .drivers.ola_universe import OLAUniverseManager
from .fixtures.profiles import Profile
from .fixtures.patch import FixtureInstance
from .dmx.engine import DMXEngine


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
    core: CoreMetrics = field(default_factory=CoreMetrics)
    rlimit: RateLimiter = field(default_factory=RateLimiter)
    ola_manager: OLAUniverseManager | None = None
    dmx: DMXEngine = field(default_factory=DMXEngine)
    fixture_profiles: dict[str, Profile] | None = None
    fixture_instances: dict[str, FixtureInstance] | None = None

    def set_mqtt_connected(self, value: bool) -> None:
        self.mqtt_connected = value


__all__ = ["AppContext"]
