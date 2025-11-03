"""Application bootstrap for the DMX demo server."""

from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any, cast

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import Settings, get_settings
from .context import AppContext
from .drivers.ola import OLAClient
from .engine import Engine
from .mqtt_in import run_mqtt_in
from .mqtt_out import build_publisher, publish_state
from .persistence.dedupe import CommandDeduplicator
from .persistence.store import RGBState, StateStore
from .util.log import configure_logging
from .ws_hub import WSHub


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


@asynccontextmanager
def lifespan(app: FastAPI) -> AsyncIterator[None]:
    configure_logging()
    settings = get_settings()
    context = create_context(settings)
    app.state.context = context
    ola_driver = _build_ola(settings)
    publisher = await build_publisher(settings)

    async def publish(state: dict[str, Any]) -> None:
        await publish_state(publisher, state)

    engine = Engine(
        publish_state_cb=publish,
        broadcast_state_cb=context.hub.send_state,
        persist_state_cb=context.store.save,
        dedupe_accept=context.dedupe.accept,
        ola_cb=ola_driver,
        queue_limit=settings.queue_size,
        metrics=context.metrics,
    )
    context.engine = engine
    context.mqtt_publisher = publisher

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

    try:
        yield
    finally:
        mqtt_task.cancel()
        engine_task.cancel()
        await asyncio.gather(mqtt_task, return_exceptions=True)
        await asyncio.gather(engine_task, return_exceptions=True)
        await publisher.disconnect()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="DMX Demo Server", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    from .api import router  # Imported lazily to avoid circular import

    app.include_router(router)
    return app


app = create_app()

__all__ = ["app", "create_app"]
