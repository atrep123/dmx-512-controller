"""Optional symmetric encryption for backups."""

from __future__ import annotations

import base64

from cryptography.fernet import Fernet


def build_cipher(key: str | None) -> Fernet | None:
    if not key:
        return None
    normalized = key.strip()
    try:
        base64.urlsafe_b64decode(normalized)
    except Exception:
        raise ValueError("CLOUD_BACKUP_ENCRYPTION_KEY must be a base64 urlsafe key generated via `python -m cryptography.fernet`")
    return Fernet(normalized)


def encrypt(payload: bytes, cipher: Fernet | None) -> bytes:
    if cipher is None:
        return payload
    return cipher.encrypt(payload)


def decrypt(payload: bytes, cipher: Fernet | None) -> bytes:
    if cipher is None:
        return payload
    return cipher.decrypt(payload)
