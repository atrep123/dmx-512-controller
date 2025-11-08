"""Application context shared across the API."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from pathlib import Path
from typing import TYPE_CHECKING

from asyncio_mqtt import Client

from .config import Settings
from .engine import Engine, EngineMetrics
from .persistence.dedupe import CommandDeduplicator
from .persistence.store import StateStore
from .persistence.scenes import ScenesStore
from .ws_hub import WSHub
from .util.ratelimit import RateLimiter
from .util.metrics import CoreMetrics
from .drivers.ola_universe import OLAUniverseManager
from .fixtures.profiles import Profile
from .fixtures.patch import FixtureInstance
from .dmx.engine import DMXEngine
from .persistence.show import ShowStore
from .persistence.projects import ProjectsStore, ProjectsIndex, ProjectMetadata, ProjectPaths
from .backups.base import BackupClient
from .drivers.dmx_input import SparkFunDMXInput
from .models import DesktopPreferences

if TYPE_CHECKING:  # pragma: no cover
    from .drivers.enttec import USBDeviceMonitor, USBDeviceInfo, EnttecDMXUSBPro


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
    scenes_store: ScenesStore | None = None
    scenes: list[dict[str, object]] = field(default_factory=list)
    show_store: ShowStore | None = None
    show_snapshot: dict[str, object] | None = None
    projects_enabled: bool = False
    usb_monitor: "USBDeviceMonitor | None" = None
    usb_devices: list["USBDeviceInfo"] = field(default_factory=list)
    usb_driver: "EnttecDMXUSBPro | None" = None

    projects_store: ProjectsStore | None = None
    projects_index: ProjectsIndex | None = None
    active_project: ProjectMetadata | None = None
    project_paths: ProjectPaths | None = None
    project_lock: asyncio.Lock = field(default_factory=asyncio.Lock)
    backup_client: BackupClient | None = None
    backup_task: asyncio.Task | None = None
    dmx_input: SparkFunDMXInput | None = None
    dmx_input_state: dict[str, int] = field(default_factory=lambda: {"r": 0, "g": 0, "b": 0})
    dmx_input_lock: asyncio.Lock = field(default_factory=asyncio.Lock)
    desktop_prefs_path: Path | None = None
    desktop_prefs: DesktopPreferences | None = None

    def set_mqtt_connected(self, value: bool) -> None:
        self.mqtt_connected = value


__all__ = ["AppContext"]
