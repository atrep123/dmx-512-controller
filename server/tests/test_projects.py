from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import Any

import pytest

from server.config import Settings
from server.context import AppContext
from server.engine import Engine
from server.persistence.dedupe import CommandDeduplicator
from server.persistence.projects import ProjectsStore
from server.persistence.scenes import ScenesStore
from server.persistence.show import ShowStore
from server.persistence.store import StateStore, RGBState
from server.services.projects import switch_active_project, create_project_backup, restore_backup
from server.backups.local import LocalBackupClient
from server.services.data import load_scenes, load_show_snapshot
from server.ws_hub import WSHub


@pytest.fixture(name="anyio_backend")
def anyio_backend_fixture():
    return "asyncio"


async def _noop(_: dict[str, Any]) -> None:  # pragma: no cover - helper
    return None


def build_settings(tmp_path: Path) -> Settings:
    return Settings(
        persistence_path=tmp_path / "state.json",
        dedupe_path=tmp_path / "dedupe.json",
        mqtt_host="localhost",
        mqtt_port=1883,
        allow_origins=["*"],
        projects_enabled=True,
        projects_root=tmp_path / "projects",
        cloud_backup_enabled=True,
        cloud_backup_provider="local",
        cloud_backup_local_path=tmp_path / "backups",
    )


async def build_context(tmp_path: Path) -> AppContext:
    settings = build_settings(tmp_path)
    projects_store = ProjectsStore(settings.projects_root)
    index = await projects_store.load()
    active = index.find(index.activeId)
    assert active is not None
    paths = projects_store.paths_for(active.id)
    store = StateStore(paths.state_path)
    dedupe = CommandDeduplicator(
        ttl_seconds=settings.cmd_dedupe_ttl_seconds,
        capacity=settings.cmd_dedupe_capacity,
        path=paths.dedupe_path,
    )
    context = AppContext(settings=settings, hub=WSHub(), store=store, dedupe=dedupe)
    engine = Engine(
        publish_state_cb=_noop,
        broadcast_state_cb=_noop,
        persist_state_cb=store.save,
        dedupe_accept=dedupe.accept,
    )
    context.engine = engine
    context.projects_enabled = True
    context.projects_store = projects_store
    context.projects_index = index
    context.active_project = active
    context.project_paths = paths
    context.scenes_store = ScenesStore(paths.scenes_path)
    context.show_store = ShowStore(paths.show_path)
    context.scenes = await load_scenes(context.scenes_store)
    context.show_snapshot = await load_show_snapshot(context.show_store)
    context.backup_client = LocalBackupClient(settings.cloud_backup_local_path)
    return context


@pytest.mark.anyio("asyncio")
async def test_switch_active_project(tmp_path: Path) -> None:
    context = await build_context(tmp_path)
    assert context.projects_store is not None
    assert context.projects_index is not None
    # Create template project with predefined state + scenes
    new = await context.projects_store.create_project(
        context.projects_index, name="Show B", venue="Arena", event_date="2025-02-01", notes=None, template_id=None
    )
    paths = context.projects_store.paths_for(new.id)
    await StateStore(paths.state_path).save(
        RGBState(schema="demo.rgb.state.v1", r=1, g=2, b=3, seq=42, updatedBy="seed", ts=123456)
    )
    await ScenesStore(paths.scenes_path).save(
        [{"id": "scene-1", "name": "Intro", "channelValues": {"1": 255}, "timestamp": 1_234_567}]
    )
    await ShowStore(paths.show_path).save({"scenes": [{"id": "scene-1", "name": "Intro", "channelValues": {}, "timestamp": 1}]})

    switched = await switch_active_project(context, new.id)
    assert context.active_project is switched
    assert context.engine.state["r"] == 1
    assert len(context.scenes) == 1


@pytest.mark.anyio("asyncio")
async def test_create_and_restore_backup(tmp_path: Path) -> None:
    context = await build_context(tmp_path)
    assert context.active_project is not None
    # Seed state + scenes
    await context.engine.replace_state(
        RGBState(schema="demo.rgb.state.v1", r=5, g=10, b=15, seq=1, updatedBy="test", ts=111)
    )
    context.scenes = [{"id": "scene-a", "name": "A", "channelValues": {}, "timestamp": 1}]
    if context.scenes_store:
        await context.scenes_store.save(context.scenes)

    version = await create_project_backup(context, label="unit-test")
    assert version.label == "unit-test"

    # Mutate state and restore
    await context.engine.replace_state({"schema": "demo.rgb.state.v1", "r": 0, "g": 0, "b": 0, "seq": 2, "ts": 999, "updatedBy": "tmp"})
    context.scenes = []
    if context.scenes_store:
        await context.scenes_store.save([])

    await restore_backup(context, context.active_project.id, version.version_id)
    assert context.engine.state["r"] == 5
    assert context.scenes and context.scenes[0]["id"] == "scene-a"
