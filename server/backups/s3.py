"""S3 backup client."""

from __future__ import annotations

import asyncio
import json
import time
from typing import Any

import anyio

try:  # pragma: no cover - optional dependency handled at runtime
    import boto3  # type: ignore
except Exception as exc:  # pragma: no cover
    boto3 = None  # type: ignore

from .base import BackupClient, BackupVersion
from .crypto import build_cipher, encrypt, decrypt


class S3BackupClient(BackupClient):
    provider = "s3"

    def __init__(
        self,
        *,
        bucket: str,
        prefix: str,
        region: str | None = None,
        access_key: str | None = None,
        secret_key: str | None = None,
        session_token: str | None = None,
        encryption_key: str | None = None,
    ) -> None:
        if boto3 is None:  # pragma: no cover - runtime guard
            raise RuntimeError("boto3 is required for S3 backup provider")
        client_kwargs: dict[str, Any] = {"service_name": "s3"}
        if region:
            client_kwargs["region_name"] = region
        if access_key and secret_key:
            client_kwargs["aws_access_key_id"] = access_key
            client_kwargs["aws_secret_access_key"] = secret_key
            if session_token:
                client_kwargs["aws_session_token"] = session_token
        self._client = boto3.client(**client_kwargs)
        self.bucket = bucket
        self.prefix = prefix.strip("/").rstrip("/")
        self.cipher = build_cipher(encryption_key)

    def _object_key(self, project_id: str, version_id: str) -> str:
        return f"{self.prefix}/{project_id}/{version_id}.bin"

    async def upload(self, project_id: str, payload: bytes, metadata: dict[str, Any]) -> BackupVersion:
        version_id = metadata.get("versionId") or f"{int(time.time() * 1000)}"
        created_at = int(time.time() * 1000)
        encrypted_payload = encrypt(payload, self.cipher)
        key = self._object_key(project_id, version_id)
        meta = {
            "createdAt": str(created_at),
            "label": metadata.get("label") or "",
            "encrypted": "1" if self.cipher else "0",
        }

        async def _put() -> None:
            self._client.put_object(Bucket=self.bucket, Key=key, Body=encrypted_payload, Metadata=meta)

        await anyio.to_thread.run_sync(_put)
        return BackupVersion(
            project_id=project_id,
            version_id=version_id,
            created_at=created_at,
            size=len(encrypted_payload),
            label=metadata.get("label"),
            provider=self.provider,
            encrypted=self.cipher is not None,
        )

    async def list_versions(self, project_id: str) -> list[BackupVersion]:
        prefix = f"{self.prefix}/{project_id}/"
        paginator = self._client.get_paginator("list_objects_v2")
        versions: list[BackupVersion] = []

        def _collect() -> list[dict[str, Any]]:
            items: list[dict[str, Any]] = []
            for page in paginator.paginate(Bucket=self.bucket, Prefix=prefix):
                items.extend(page.get("Contents", []))
            return items

        contents = await anyio.to_thread.run_sync(_collect)
        for entry in contents:
            key = entry["Key"]
            if not key.endswith(".bin"):
                continue
            version_id = key.rsplit("/", 1)[-1].replace(".bin", "")
            versions.append(
                BackupVersion(
                    project_id=project_id,
                    version_id=version_id,
                    created_at=int(entry.get("LastModified").timestamp() * 1000) if entry.get("LastModified") else 0,
                    size=int(entry.get("Size", 0)),
                    provider=self.provider,
                    encrypted=self.cipher is not None,
                )
            )
        versions.sort(key=lambda v: v.created_at, reverse=True)
        return versions

    async def download(self, project_id: str, version_id: str) -> bytes:

        key = self._object_key(project_id, version_id)

        def _get() -> bytes:
            response = self._client.get_object(Bucket=self.bucket, Key=key)
            body = response["Body"].read()
            return body

        data = await anyio.to_thread.run_sync(_get)
        return decrypt(data, self.cipher)
