"""Multi-project persistence helpers."""

from __future__ import annotations

import asyncio
import json
import re
import shutil
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field

from ..util.ulid import new_ulid


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    if not slug:
        slug = "project"
    suffix = new_ulid()[-6:].lower()
    return f"{slug}-{suffix}"


class ProjectMetadata(BaseModel):
    id: str
    name: str
    venue: str | None = None
    eventDate: str | None = None
    notes: str | None = None
    createdAt: int = Field(default_factory=lambda: int(time.time() * 1000))
    updatedAt: int = Field(default_factory=lambda: int(time.time() * 1000))
    lastBackupAt: int | None = None


class ProjectsIndex(BaseModel):
    activeId: str
    projects: list[ProjectMetadata]

    def find(self, project_id: str) -> ProjectMetadata | None:
        for project in self.projects:
            if project.id == project_id:
                return project
        return None


@dataclass(slots=True)
class ProjectPaths:
    base: Path
    state_path: Path
    scenes_path: Path
    show_path: Path
    dedupe_path: Path
    backups_path: Path


class ProjectsStore:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.index_path = root / "projects.json"
        self._lock = asyncio.Lock()

    async def load(self) -> ProjectsIndex:
        await asyncio.to_thread(self.root.mkdir, True, True)
        if not self.index_path.exists():
            default = ProjectMetadata(id="default", name="Default show")
            index = ProjectsIndex(activeId=default.id, projects=[default])
            await self.save(index)
            await self._ensure_project_dirs(default.id)
            return index
        try:
            data = await asyncio.to_thread(self.index_path.read_text, "utf-8")
        except OSError:
            default = ProjectMetadata(id="default", name="Default show")
            index = ProjectsIndex(activeId=default.id, projects=[default])
            await self.save(index)
            await self._ensure_project_dirs(default.id)
            return index
        try:
            payload = json.loads(data)
            index = ProjectsIndex.model_validate(payload)
        except Exception:
            default = ProjectMetadata(id="default", name="Default show")
            index = ProjectsIndex(activeId=default.id, projects=[default])
            await self.save(index)
            await self._ensure_project_dirs(default.id)
            return index
        if not index.projects:
            default = ProjectMetadata(id="default", name="Default show")
            index.projects.append(default)
            index.activeId = default.id
            await self.save(index)
            await self._ensure_project_dirs(default.id)
        return index

    async def save(self, index: ProjectsIndex) -> None:
        async with self._lock:
            self.root.mkdir(parents=True, exist_ok=True)
            data = index.model_dump(mode="json")
            await asyncio.to_thread(
                self.index_path.write_text,
                json.dumps(data, ensure_ascii=False, separators=(",", ":")),
                "utf-8",
            )

    async def create_project(
        self,
        index: ProjectsIndex,
        *,
        name: str,
        venue: str | None = None,
        event_date: str | None = None,
        notes: str | None = None,
        template_id: str | None = None,
    ) -> ProjectMetadata:
        project_id = _slugify(name)
        if index.find(project_id):
            project_id = _slugify(f"{name}-{new_ulid()[-4:]}")
        metadata = ProjectMetadata(
            id=project_id,
            name=name.strip() or "New Show",
            venue=venue,
            eventDate=event_date,
            notes=notes,
        )
        index.projects.append(metadata)
        await self._ensure_project_dirs(project_id)
        if template_id:
            await self._copy_template(template_id, project_id)
        await self.save(index)
        return metadata

    async def update_project(self, index: ProjectsIndex, project_id: str, updates: dict[str, Any]) -> ProjectMetadata:
        project = index.find(project_id)
        if project is None:
            raise KeyError(project_id)
        has_changes = False
        for field in ("name", "venue", "eventDate", "notes"):
            if field in updates and getattr(project, field) != updates[field]:
                setattr(project, field, updates[field])
                has_changes = True
        if has_changes:
            project.updatedAt = int(time.time() * 1000)
            await self.save(index)
        return project

    async def set_active(self, index: ProjectsIndex, project_id: str) -> ProjectMetadata:
        project = index.find(project_id)
        if project is None:
            raise KeyError(project_id)
        if index.activeId != project_id:
            index.activeId = project_id
            await self.save(index)
        await self._ensure_project_dirs(project_id)
        return project

    def paths_for(self, project_id: str) -> ProjectPaths:
        base = self.root / project_id
        return ProjectPaths(
            base=base,
            state_path=base / "state.json",
            scenes_path=base / "scenes.json",
            show_path=base / "show.json",
            dedupe_path=base / "cmd_seen.json",
            backups_path=base / "backups",
        )

    async def update_last_backup(self, index: ProjectsIndex, project_id: str, ts_ms: int) -> None:
        project = index.find(project_id)
        if project is None:
            raise KeyError(project_id)
        project.lastBackupAt = ts_ms
        project.updatedAt = ts_ms
        await self.save(index)

    async def _ensure_project_dirs(self, project_id: str) -> None:
        paths = self.paths_for(project_id)
        await asyncio.to_thread(paths.base.mkdir, True, True)
        await asyncio.to_thread(paths.backups_path.mkdir, True, True)

    async def _copy_template(self, template_id: str, dest_id: str) -> None:
        src = self.paths_for(template_id)
        dst = self.paths_for(dest_id)
        try:
            if src.state_path.exists():
                shutil.copy2(src.state_path, dst.state_path)
            if src.scenes_path.exists():
                shutil.copy2(src.scenes_path, dst.scenes_path)
            if src.show_path.exists():
                shutil.copy2(src.show_path, dst.show_path)
        except OSError:
            # Best effort clone
            pass


__all__ = [
    "ProjectMetadata",
    "ProjectsIndex",
    "ProjectsStore",
    "ProjectPaths",
]
