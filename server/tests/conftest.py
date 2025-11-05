from __future__ import annotations

import asyncio
import contextlib
import socket
import sys
import threading
import time
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Any, cast

import pytest
import requests
import uvicorn
from fastapi import FastAPI

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from server.api import router
from server.config import Settings
from server.context import AppContext
from server.engine import Engine
from server.persistence.dedupe import CommandDeduplicator
from server.persistence.store import RGBState, StateStore
from server.ws_hub import WSHub


@pytest.fixture
async def test_app(tmp_path) -> AsyncIterator[tuple[FastAPI, AppContext, list[dict[str, Any]]]]:
    settings = Settings(
        persistence_path=tmp_path / "state.json",
        dedupe_path=tmp_path / "dedupe.json",
        metrics_enabled=True,
        mqtt_host="localhost",
        mqtt_port=1883,
        allow_origins=["*"],
    )
    hub = WSHub()
    store = StateStore(settings.persistence_path)
    dedupe = CommandDeduplicator(
        ttl_seconds=settings.cmd_dedupe_ttl_seconds,
        capacity=settings.cmd_dedupe_capacity,
        path=settings.dedupe_path,
    )
    published: list[dict[str, Any]] = []

    async def publish_state(state: dict[str, Any]) -> None:
        published.append(dict(state))

    async def broadcast_state(state: dict[str, Any]) -> None:
        await hub.send_state(state)

    async def persist_state(state: dict[str, Any]) -> None:
        await store.save(cast(RGBState, state))

    engine = Engine(
        publish_state_cb=publish_state,
        broadcast_state_cb=broadcast_state,
        persist_state_cb=persist_state,
        dedupe_accept=dedupe.accept,
        queue_limit=128,
    )

    context = AppContext(
        settings=settings,
        hub=hub,
        store=store,
        dedupe=dedupe,
        engine=engine,
        metrics=engine.metrics,
    )
    context.mqtt_connected = True

    app = FastAPI()
    app.include_router(router)
    app.state.context = context

    @app.on_event("startup")
    async def _startup() -> None:
        app.state.engine_task = asyncio.create_task(engine.run())

    @app.on_event("shutdown")
    async def _shutdown() -> None:
        task = getattr(app.state, "engine_task", None)
        if task is not None:
            task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await task

    yield app, context, published


def _free_port() -> int:
    with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


@pytest.fixture(scope="session")
def live_server_url() -> str:
    """
    Boot uvicorn in a background thread and wait for /healthz.
    Assumes MQTT either reachable or server handles backoff.
    """
    port = _free_port()
    config = uvicorn.Config("server.app:app", host="127.0.0.1", port=port, log_level="warning")
    server = uvicorn.Server(config)
    t = threading.Thread(target=server.run, daemon=True)
    t.start()

    base = f"http://127.0.0.1:{port}"
    for _ in range(100):
        try:
            r = requests.get(f"{base}/healthz", timeout=0.2)
            if r.status_code == 200:
                break
        except Exception:
            pass
        time.sleep(0.1)

    yield base
    server.should_exit = True
    t.join(timeout=5)
