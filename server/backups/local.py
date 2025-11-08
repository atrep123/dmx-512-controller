"""Local filesystem backup client."""

from __future__ import annotations

import asyncio
import json
import time
from pathlib import Path
from typing import Any

from .base import BackupClient, BackupVersion
from .crypto import encrypt, decrypt, build_cipher


class LocalBackupClient(BackupClient):
    provider = "local"

    def __init__(self, root: Path, encryption_key: str | None = None) -> None:
        self.root = root
        self.root.mkdir(parents=True, exist_ok=True)
        self.cipher = build_cipher(encryption_key)
        self._lock = asyncio.Lock()

    def _project_dir(self, project_id: str) -> Path:
        path = self.root / project_id
        path.mkdir(parents=True, exist_ok=True)
        return path

    def _index_path(self, project_id: str) -> Path:
        return self._project_dir(project_id) / "index.json"

    async def upload(self, project_id: str, payload: bytes, metadata: dict[str, Any]) -> BackupVersion:
        ts_ms = int(time.time() * 1000)
        version_id = metadata.get("versionId") or f"{ts_ms}"
        encrypted_payload = encrypt(payload, self.cipher)
        file_path = self._project_dir(project_id) / f"{version_id}.bin"
        meta = {
            "versionId": version_id,
            "createdAt": ts_ms,
            "size": len(encrypted_payload),
            "label": metadata.get("label"),
            "encrypted": self.cipher is not None,
        }
        async with self._lock:
            await asyncio.to_thread(file_path.write_bytes, encrypted_payload)
            index = await self._load_index(project_id)
            index.insert(0, meta)
            await self._save_index(project_id, index)
        return BackupVersion(
            project_id=project_id,
            version_id=version_id,
            created_at=ts_ms,
            size=len(encrypted_payload),
            label=metadata.get("label"),
            provider=self.provider,
            encrypted=self.cipher is not None,
        )

    async def list_versions(self, project_id: str) -> list[BackupVersion]:
        index = await self._load_index(project_id)
        versions: list[BackupVersion] = []
        for entry in index:
            versions.append(
                BackupVersion(
                    project_id=project_id,
                    version_id=str(entry.get("versionId")),
                    created_at=int(entry.get("createdAt", 0)),
                    size=int(entry.get("size", 0)),
                    label=entry.get("label"),
                    provider=self.provider,
                    encrypted=bool(entry.get("encrypted")),
                )
            )
        return versions

    async def download(self, project_id: str, version_id: str) -> bytes:
        file_path = self._project_dir(project_id) / f"{version_id}.bin"
        data = await asyncio.to_thread(file_path.read_bytes)
        return decrypt(data, self.cipher)

    async def _load_index(self, project_id: str) -> list[dict[str, Any]]:
        index_path = self._index_path(project_id)
        if not index_path.exists():
            return []
        try:
            data = await asyncio.to_thread(index_path.read_text, "utf-8")
            payload = json.loads(data)
            if isinstance(payload, list):
                return payload
        except Exception:
            return []
        return []

    async def _save_index(self, project_id: str, index: list[dict[str, Any]]) -> None:
        index_path = self._index_path(project_id)
        await asyncio.to_thread(
            index_path.write_text,
            json.dumps(index, ensure_ascii=False, separators=(",", ":")),
            "utf-8",
        )
