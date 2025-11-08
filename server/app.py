"""Application bootstrap for the DMX demo server."""

from __future__ import annotations

import asyncio
from pathlib import Path
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any, cast

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import Settings, get_settings
from .context import AppContext
from .drivers.ola import OLAClient
from .drivers.ola_universe import OLAUniverseManager, OLAMetrics
from .drivers.enttec import EnttecDMXUSBPro, USBDeviceInfo, USBDeviceMonitor, find_enttec_device, list_usb_devices
from .drivers.dmx_input import SparkFunDMXInput
from .dmx.fade_engine import FadeEngine
from .inputs.sacn_receiver import SACNReceiver
from .fixtures.profiles import load_profiles
from .fixtures.patch import load_patch
from .engine import Engine
from .models import SceneModel, RGBCommand, CMD_SCHEMA
from .mqtt_in import run_mqtt_in
from .mqtt_out import build_publisher, publish_state
from .persistence.dedupe import CommandDeduplicator
from .persistence.store import RGBState, StateStore
from .persistence.scenes import ScenesStore
from .persistence.show import ShowStore
from .persistence.projects import ProjectsStore, ProjectMetadata, ProjectsIndex, ProjectPaths
from .util.log import configure_logging
from .util.ulid import new_ulid
from .ws_hub import WSHub
from .services.data import load_scenes, load_show_snapshot
from .services.projects import create_project_backup, switch_active_project
from .backups.factory import create_backup_client
from .backups.base import BackupClient

app: FastAPI | None = None
logger = logging.getLogger("app")


def _build_ola(settings: Settings) -> OLAClient | None:
    if not settings.ola_enabled:
        return None
    return OLAClient(settings.ola_url, settings.ola_universe, settings.ola_fps)


def create_context(settings: Settings, *, store: StateStore, dedupe: CommandDeduplicator) -> AppContext:
    hub = WSHub()
    return AppContext(settings=settings, hub=hub, store=store, dedupe=dedupe)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    configure_logging()
    settings = get_settings()
    data_root = Path(settings.persistence_path).parent
    state_path = settings.persistence_path
    dedupe_path = settings.dedupe_path
    scenes_path = data_root / "scenes.json"
    show_path = data_root / "show.json"
    projects_store: ProjectsStore | None = None
    projects_index: ProjectsIndex | None = None
    active_project: ProjectMetadata | None = None
    project_paths: ProjectPaths | None = None
    if settings.projects_enabled:
        projects_store = ProjectsStore(settings.projects_root)
        projects_index = await projects_store.load()
        active_project = projects_index.find(projects_index.activeId) or projects_index.projects[0]
        project_paths = projects_store.paths_for(active_project.id)
        state_path = project_paths.state_path
        dedupe_path = project_paths.dedupe_path
        scenes_path = project_paths.scenes_path
        show_path = project_paths.show_path
    store = StateStore(state_path)
    dedupe = CommandDeduplicator(
        ttl_seconds=settings.cmd_dedupe_ttl_seconds,
        capacity=settings.cmd_dedupe_capacity,
        path=dedupe_path,
    )
    context = create_context(settings, store=store, dedupe=dedupe)
    context.projects_enabled = settings.projects_enabled
    context.projects_store = projects_store
    context.projects_index = projects_index
    context.active_project = active_project
    context.project_paths = project_paths
    app.state.context = context
    context.scenes_store = ScenesStore(scenes_path)
    context.show_store = ShowStore(show_path)
    context.scenes = await load_scenes(context.scenes_store)
    context.show_snapshot = await load_show_snapshot(context.show_store)
    if not context.scenes:
        fallback = list(context.show_snapshot.get("scenes") or [])
        if fallback:
            context.scenes = fallback
    context.usb_devices = list_usb_devices()
    backup_client = create_backup_client(settings)
    context.backup_client = backup_client
    usb_monitor: USBDeviceMonitor | None = None
    enttec_driver: EnttecDMXUSBPro | None = None
    if (
        backup_client is not None
        and settings.cloud_backup_auto_interval_minutes > 0
        and context.projects_enabled
        and context.active_project is not None
    ):
        interval = settings.cloud_backup_auto_interval_minutes * 60

        async def auto_backup_loop() -> None:
            while True:
                await asyncio.sleep(interval)
                try:
                    await create_project_backup(context, label="auto")
                except Exception:
                    logger.exception("auto_backup_failed")

        backup_task = asyncio.create_task(auto_backup_loop(), name="auto_backup")
        context.backup_task = backup_task
    if settings.output_mode == "enttec":
        def _on_usb(devices: list[USBDeviceInfo]) -> None:
            context.usb_devices = devices

        usb_monitor = USBDeviceMonitor(
            interval_sec=float(settings.usb_scan_interval_sec),
            vendor_ids=settings.usb_vendor_ids,
            product_ids=settings.usb_product_ids,
            on_change=_on_usb,
        )
        context.usb_monitor = usb_monitor
        try:
            await usb_monitor.start()
        except Exception:
            logger.exception("usb_monitor_start_failed")
        context.usb_devices = usb_monitor.snapshot()
        candidate = find_enttec_device(
            settings.usb_port,
            settings.usb_vendor_ids,
            settings.usb_product_ids,
        )
        if candidate is None:
            candidate = usb_monitor.pick_candidate() if usb_monitor else None
        if candidate is None:
            logger.warning("usb_autodetect_no_device vendor_ids=%s product_ids=%s", settings.usb_vendor_ids, settings.usb_product_ids)
        else:
            enttec_driver = EnttecDMXUSBPro(
                port=candidate.port,
                baudrate=settings.usb_baudrate,
                fps=settings.usb_fps,
            )
            try:
                await enttec_driver.open()
                context.usb_driver = enttec_driver
                logger.info("usb_enttec_ready port=%s", candidate.port)
            except Exception:
                logger.exception("usb_enttec_open_failed port=%s", candidate.port)
                enttec_driver = None
    ola_driver = _build_ola(settings)
    # Feature-flagged OLA universe manager
    if settings.output_mode == "ola":
        # Derive base URL (strip trailing /set_dmx if present)
        base = settings.ola_url
        if base.endswith("/set_dmx"):
            base = base[: -len("/set_dmx")]
        # Optional: mapping from config file
        mapping: dict[int, int] = {}
        try:
            import yaml  # type: ignore

            if settings.patch_file.exists():
                with settings.patch_file.open("r", encoding="utf-8") as f:
                    doc = yaml.safe_load(f) or {}
                universes = (doc or {}).get("universes", {})
                for k, v in universes.items():
                    try:
                        mapping[int(k)] = int(v.get("ola_universe", k))
                    except Exception:
                        continue
        except Exception:
            mapping = {}
        context.ola_manager = OLAUniverseManager(
            base_url=base,
            fps=int(settings.ola_fps),
            mapping=mapping,
            metrics=OLAMetrics(
                context.core.ola_frames_total,
                context.core.ola_frames_skipped_identical,
                context.core.ola_frames_skipped_rate,
                context.core.ola_last_fps,
                context.core.ola_http_errors_total,
                context.core.ola_http_errors_by_code,
                context.core.ola_queue_depth,
            ),
        )
    publisher = await build_publisher(settings)

    async def publish(state: dict[str, Any]) -> None:
        await publish_state(publisher, state)

    output_cb = None
    if enttec_driver is not None:
        output_cb = enttec_driver
    elif context.ola_manager is not None:
        output_cb = lambda state: _on_state_ola(context, state)  # type: ignore[assignment]
    else:
        output_cb = ola_driver

    engine = Engine(
        publish_state_cb=publish,
        broadcast_state_cb=context.hub.send_state,
        persist_state_cb=context.store.save,
        dedupe_accept=context.dedupe.accept,
        ola_cb=output_cb,  # type: ignore[arg-type]
        queue_limit=settings.queue_size,
        metrics=context.metrics,
    )
    context.engine = engine
    context.mqtt_publisher = publisher
    context.dmx_input_state = {
        "r": int(engine.state.get("r", 0)),
        "g": int(engine.state.get("g", 0)),
        "b": int(engine.state.get("b", 0)),
    }
    dmx_input_driver: SparkFunDMXInput | None = None
    if settings.dmx_input_enabled:
        if not settings.dmx_input_port:
            logger.warning("dmx_input_enabled but DMX_INPUT_PORT not set")
        else:
            channel_limit = max(1, min(settings.dmx_input_channel_count, 3))

            async def handle_dmx_channel(ch: int, value: int) -> None:
                if ch < 1 or ch > channel_limit:
                    return
                key = {1: "r", 2: "g", 3: "b"}.get(ch)
                if key is None:
                    return
                async with context.dmx_input_lock:
                    state = context.dmx_input_state
                    if state.get(key) == value:
                        return
                    state[key] = value
                    rgb = (
                        int(state.get("r", 0)),
                        int(state.get("g", 0)),
                        int(state.get("b", 0)),
                    )
                cmd = RGBCommand(
                    schema=CMD_SCHEMA,
                    cmdId=new_ulid(),
                    src=settings.dmx_input_src,
                    r=rgb[0],
                    g=rgb[1],
                    b=rgb[2],
                    ts=None,
                )
                await engine.submit(cmd)

            try:
                dmx_input_driver = SparkFunDMXInput(
                    port=settings.dmx_input_port,
                    baudrate=settings.dmx_input_baudrate,
                    on_channel=handle_dmx_channel,
                )
                await dmx_input_driver.start()
                context.dmx_input = dmx_input_driver
                logger.info("dmx_input_started port=%s", settings.dmx_input_port)
            except Exception:
                logger.exception("dmx_input_start_failed port=%s", settings.dmx_input_port)
                dmx_input_driver = None
    # Optional: start fade engine
    fade_engine: FadeEngine | None = None
    if settings.fades_enabled:
        fe = FadeEngine()
        async def fe_metrics():
            # could update metrics here if needed
            return None
        async def fe_broadcast(payload: dict[str, object]) -> None:
            await context.hub.send_payload(payload)
        async def fe_ola_apply(universe: int, delta: list[dict[str, int]]) -> None:
            if context.ola_manager is not None:
                context.ola_manager.apply_patch(universe, delta)
                await context.ola_manager.maybe_send(universe)
        context.dmx  # ensure dmx initialized
        async def fe_run():
            await fe.run(
                apply_patch=context.dmx.apply_patch,
                broadcast=fe_broadcast,
                ola_apply=fe_ola_apply,
                metrics=context.core,
            )
        context.app_fade_task = asyncio.create_task(fe_run(), name="fade_engine")  # type: ignore[attr-defined]
        fade_engine = fe
        # attach for API access
        setattr(context, "_fade_engine", fe)
    # Fixtures load (optional)
    if settings.fixtures_enabled:
        try:
            profiles = load_profiles(settings.fixture_profiles_dir)
            instances = load_patch(settings.fixture_patch_file, profiles)
            context.fixture_profiles = profiles
            context.fixture_instances = instances
        except Exception:
            context.fixture_profiles = {}
            context.fixture_instances = {}

    restored = await context.store.load()
    if restored:
        await engine.bootstrap(restored)
    await context.store.save(cast(RGBState, engine.state))
    await publish(engine.state)

    engine_task = asyncio.create_task(engine.run(), name="engine")
    context.engine_task = engine_task

    def on_connect() -> None:
        context.set_mqtt_connected(True)

    def on_disconnect() -> None:
        context.set_mqtt_connected(False)

    mqtt_task = asyncio.create_task(
        run_mqtt_in(engine, settings, on_connect=on_connect, on_disconnect=on_disconnect),
        name="mqtt_in",
    )
    context.mqtt_task = mqtt_task
    # sACN receiver (optional)
    sacn_task: asyncio.Task | None = None
    receiver: SACNReceiver | None = None
    if settings.sacn_enabled:
        receiver = SACNReceiver(context)
        loop = asyncio.get_running_loop()
        try:
            await loop.create_datagram_endpoint(lambda: receiver, local_addr=(settings.sacn_bind_addr, settings.sacn_port))
            # prune task (TTL cleanup)
            async def prune():
                while True:
                    await asyncio.sleep(0.5)
                    # trigger recompute to purge stale
                    for uni in list({u for (u, _) in receiver.sources.keys()}):
                        comp = receiver._recompute_composite(uni)
                        if comp is not None:
                            context.dmx.apply_sacn_composite(uni, comp)
                            context.dmx.recompute_output(uni)
        
            sacn_task = asyncio.create_task(prune(), name="sacn_prune")
            # attach for diagnostics
            setattr(context, "_sacn_receiver", receiver)
        except Exception:
            receiver = None

    try:
        yield
    finally:
        # stop fade engine
        task = getattr(context, "app_fade_task", None)
        if task is not None:
            task.cancel()
            await asyncio.gather(task, return_exceptions=True)
        # stop sACN
        if sacn_task is not None:
            sacn_task.cancel()
            await asyncio.gather(sacn_task, return_exceptions=True)
        if receiver is not None:
            try:
                await receiver.close()
            except Exception:
                pass
        if context.dmx_input is not None:
            try:
                await context.dmx_input.stop()
            except Exception:
                pass
        # Attempt graceful OLA flush and close HTTP client if enabled
        if context.ola_manager is not None:
            from contextlib import suppress
            try:
                with suppress(asyncio.CancelledError):
                    await context.ola_manager.flush_all()
            except Exception:
                pass
            try:
                with suppress(asyncio.CancelledError):
                    await context.ola_manager.aclose()
            except Exception:
                pass
        if enttec_driver is not None:
            try:
                await enttec_driver.close()
            except Exception:
                pass
        if usb_monitor is not None:
            try:
                await usb_monitor.stop()
            except Exception:
                pass
        if context.backup_task is not None:
            context.backup_task.cancel()
            await asyncio.gather(context.backup_task, return_exceptions=True)
        mqtt_task.cancel()
        engine_task.cancel()
        await asyncio.gather(mqtt_task, return_exceptions=True)
        await asyncio.gather(engine_task, return_exceptions=True)
        await publisher.disconnect()


def create_app() -> FastAPI:
    settings = get_settings(force_reload=True)
    application = FastAPI(title="DMX Demo Server", lifespan=lifespan)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    from .api import router  # Imported lazily to avoid circular import

    application.include_router(router)
    global app
    app = application
    return application


app = create_app()

__all__ = ["app", "create_app"]


async def _on_state_ola(context: AppContext, state: dict[str, Any]) -> None:
    """Map RGB state to universe 0 frame and schedule OLA send.

    This preserves legacy behavior (RGB-only) while exercising the universe pipeline.
    """
    mgr = context.ola_manager
    if mgr is None:
        return
    try:
        mgr.on_rgb_state(int(state["r"]), int(state["g"]), int(state["b"]))
        await mgr.maybe_send(0)
    except Exception:
        # Fail open
        pass
