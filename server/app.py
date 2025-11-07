"""Application bootstrap for the DMX demo server."""

from __future__ import annotations

import asyncio
from pathlib import Path
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any, cast

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import Settings, get_settings
from .context import AppContext
from .drivers.ola import OLAClient
from .drivers.ola_universe import OLAUniverseManager, OLAMetrics
from .dmx.fade_engine import FadeEngine
from .inputs.sacn_receiver import SACNReceiver
from .fixtures.profiles import load_profiles
from .fixtures.patch import load_patch
from .engine import Engine
from .models import SceneModel
from .mqtt_in import run_mqtt_in
from .mqtt_out import build_publisher, publish_state
from .persistence.dedupe import CommandDeduplicator
from .persistence.store import RGBState, StateStore
from .persistence.scenes import ScenesStore
from .persistence.show import ShowStore
from .util.log import configure_logging
from .ws_hub import WSHub

app: FastAPI | None = None


def _build_ola(settings: Settings) -> OLAClient | None:
    if not settings.ola_enabled:
        return None
    return OLAClient(settings.ola_url, settings.ola_universe, settings.ola_fps)


def create_context(settings: Settings) -> AppContext:
    hub = WSHub()
    store = StateStore(settings.persistence_path)
    dedupe = CommandDeduplicator(
        ttl_seconds=settings.cmd_dedupe_ttl_seconds,
        capacity=settings.cmd_dedupe_capacity,
        path=settings.dedupe_path,
    )
    return AppContext(settings=settings, hub=hub, store=store, dedupe=dedupe)


def _sanitize_scene_list(payload: object) -> list[dict[str, Any]]:
    """Coerce arbitrary payload into a validated list of scenes."""

    if not isinstance(payload, list):
        return []
    sanitized: list[dict[str, Any]] = []
    for item in payload:
        try:
            model = SceneModel.model_validate(item)
        except Exception:
            continue
        sanitized.append(model.model_dump())
    return sanitized


async def _load_scenes_from_store(store: ScenesStore | None) -> list[dict[str, Any]]:
    if store is None:
        return []
    try:
        raw = await store.load()
    except Exception:
        return []
    return _sanitize_scene_list(raw)


async def _load_show_snapshot(store: ShowStore | None) -> dict[str, Any]:
    if store is None:
        return {}
    try:
        raw = await store.load()
    except Exception:
        return {}
    if not isinstance(raw, dict):
        return {}
    snapshot: dict[str, Any] = {
        "version": raw.get("version", "1.1"),
        "exportedAt": raw.get("exportedAt"),
        "universes": raw.get("universes") if isinstance(raw.get("universes"), list) else [],
        "fixtures": raw.get("fixtures") if isinstance(raw.get("fixtures"), list) else [],
        "effects": raw.get("effects") if isinstance(raw.get("effects"), list) else [],
        "stepperMotors": raw.get("stepperMotors") if isinstance(raw.get("stepperMotors"), list) else [],
        "servos": raw.get("servos") if isinstance(raw.get("servos"), list) else [],
        "scenes": _sanitize_scene_list(raw.get("scenes")),
    }
    return snapshot


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    configure_logging()
    settings = get_settings()
    context = create_context(settings)
    app.state.context = context
    data_root = Path(settings.persistence_path).parent
    context.scenes_store = ScenesStore(data_root / "scenes.json")
    context.show_store = ShowStore(data_root / "show.json")
    context.scenes = await _load_scenes_from_store(context.scenes_store)
    context.show_snapshot = await _load_show_snapshot(context.show_store)
    if not context.scenes:
        fallback = list(context.show_snapshot.get("scenes") or [])
        if fallback:
            context.scenes = fallback
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

    engine = Engine(
        publish_state_cb=publish,
        broadcast_state_cb=context.hub.send_state,
        persist_state_cb=context.store.save,
        dedupe_accept=context.dedupe.accept,
        ola_cb=(
            (lambda state: _on_state_ola(context, state))  # type: ignore[arg-type]
            if context.ola_manager is not None
            else ola_driver
        ),
        queue_limit=settings.queue_size,
        metrics=context.metrics,
    )
    context.engine = engine
    context.mqtt_publisher = publisher
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
