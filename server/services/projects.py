"""Project switching and backup helpers."""

from __future__ import annotations

import asyncio
import json
import time
from typing import Any, Tuple

from ..context import AppContext
from ..engine import Engine
from ..persistence.dedupe import CommandDeduplicator
from ..persistence.projects import ProjectMetadata, ProjectPaths, ProjectsStore
from ..persistence.scenes import ScenesStore
from ..persistence.show import ShowStore
from ..persistence.store import StateStore
from ..backups.base import BackupVersion
from ..services.data import load_scenes, load_show_snapshot
from ..util.ulid import new_ulid
from ..models import STATE_SCHEMA


async def switch_active_project(context: AppContext, project_id: str) -> ProjectMetadata:
    if not context.projects_enabled or context.projects_store is None or context.projects_index is None:
        raise RuntimeError("Projects are not enabled.")
    async with context.project_lock:
        if context.active_project and context.active_project.id == project_id:
            return context.active_project
        project = context.projects_index.find(project_id)
        if project is None:
            raise KeyError(project_id)
        paths = context.projects_store.paths_for(project_id)
        await _swap_project_stores(context, paths)
        context.projects_index.activeId = project_id
        context.active_project = project
        context.project_paths = paths
        await context.projects_store.save(context.projects_index)
        return project


async def _swap_project_stores(context: AppContext, paths: ProjectPaths) -> None:
    context.store = StateStore(paths.state_path)
    context.dedupe = CommandDeduplicator(
        ttl_seconds=context.settings.cmd_dedupe_ttl_seconds,
        capacity=context.settings.cmd_dedupe_capacity,
        path=paths.dedupe_path,
    )
    context.engine.dedupe_accept = context.dedupe.accept
    context.scenes_store = ScenesStore(paths.scenes_path)
    context.show_store = ShowStore(paths.show_path)
    restored = await context.store.load()
    if restored:
        await context.engine.replace_state(restored, src=f"project:{paths.base.name}")
    else:
        await context.engine.replace_state(
            {
                "schema": STATE_SCHEMA,
                "r": 0,
                "g": 0,
                "b": 0,
                "seq": 0,
                "updatedBy": f"project:{paths.base.name}",
                "ts": int(time.time() * 1000),
            }
        )
    context.scenes = await load_scenes(context.scenes_store)
    context.show_snapshot = await load_show_snapshot(context.show_store)
    if not context.scenes and context.show_snapshot.get("scenes"):
        context.scenes = list(context.show_snapshot.get("scenes"))


def serialize_project(meta: ProjectMetadata) -> dict[str, Any]:
    return meta.model_dump()


async def create_project_backup(context: AppContext, *, label: str | None = None) -> BackupVersion:
    if context.backup_client is None:
        raise RuntimeError("Backup client is disabled.")
    if context.active_project is None:
        raise RuntimeError("No active project.")
    await context.store.save(context.engine.state)  # ensure latest state persisted
    snapshot = {
        "project": serialize_project(context.active_project),
        "state": context.engine.state,
        "scenes": context.scenes,
        "show": context.show_snapshot,
        "timestamp": int(time.time() * 1000),
        "version": "1.2",
    }
    payload = json.dumps(snapshot, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    version = await context.backup_client.upload(
        context.active_project.id,
        payload,
        {"label": label, "versionId": new_ulid()},
    )
    if context.projects_store and context.projects_index:
        await context.projects_store.update_last_backup(context.projects_index, context.active_project.id, version.created_at)
        context.active_project.lastBackupAt = version.created_at
    return version


async def list_backups(context: AppContext, project_id: str) -> list[BackupVersion]:
    if context.backup_client is None:
        raise RuntimeError("Backup client disabled.")
    return await context.backup_client.list_versions(project_id)


async def restore_backup(context: AppContext, project_id: str, version_id: str) -> dict[str, Any]:
    if context.backup_client is None:
        raise RuntimeError("Backup client disabled.")
    if context.active_project is None or context.active_project.id != project_id:
        raise RuntimeError("Restore allowed only for active project.")
    payload = await context.backup_client.download(project_id, version_id)
    data = json.loads(payload.decode("utf-8"))
    state = data.get("state") or {}
    scenes = data.get("scenes") or []
    show_snapshot = data.get("show") or {}
    await context.store.save(state)
    context.scenes = scenes if isinstance(scenes, list) else []
    if context.scenes_store is not None:
        await context.scenes_store.save(context.scenes)
    context.show_snapshot = show_snapshot if isinstance(show_snapshot, dict) else {}
    if context.show_store is not None:
        await context.show_store.save(context.show_snapshot)
    await context.engine.replace_state(state, src=f"restore:{version_id}")
    return data
