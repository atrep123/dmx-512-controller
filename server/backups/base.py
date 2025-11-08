"""Backup client abstractions."""

from __future__ import annotations

import abc
from dataclasses import dataclass
from typing import Any


@dataclass(slots=True)
class BackupVersion:
    project_id: str
    version_id: str
    created_at: int
    size: int
    label: str | None = None
    provider: str = "local"
    encrypted: bool = False


class BackupClient(abc.ABC):
    """Interface for backup storage providers."""

    provider: str = "local"

    @abc.abstractmethod
    async def upload(self, project_id: str, payload: bytes, metadata: dict[str, Any]) -> BackupVersion:  # pragma: no cover - interface
        raise NotImplementedError

    @abc.abstractmethod
    async def list_versions(self, project_id: str) -> list[BackupVersion]:  # pragma: no cover - interface
        raise NotImplementedError

    @abc.abstractmethod
    async def download(self, project_id: str, version_id: str) -> bytes:  # pragma: no cover - interface
        raise NotImplementedError
