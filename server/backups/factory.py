"""Factory helpers for backup providers."""

from __future__ import annotations

from pathlib import Path

from ..config import Settings
from .base import BackupClient
from .local import LocalBackupClient
from .s3 import S3BackupClient


def create_backup_client(settings: Settings) -> BackupClient | None:
    if not settings.cloud_backup_enabled:
        return None
    provider = settings.cloud_backup_provider
    if provider == "local":
        return LocalBackupClient(Path(settings.cloud_backup_local_path), settings.cloud_backup_encryption_key)
    if provider == "s3":
        return S3BackupClient(
            bucket=settings.cloud_backup_s3_bucket,
            prefix=settings.cloud_backup_s3_prefix or "dmx-controller/backups",
            region=settings.cloud_backup_s3_region,
            access_key=settings.cloud_backup_s3_access_key,
            secret_key=settings.cloud_backup_s3_secret_key,
            session_token=settings.cloud_backup_s3_session_token,
            encryption_key=settings.cloud_backup_encryption_key,
        )
    raise ValueError(f"Unsupported backup provider: {provider}")
