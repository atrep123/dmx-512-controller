"""ULID utilities."""

from __future__ import annotations

import os
import time
from typing import Final
import hashlib

_ULID_ALPHABET: Final = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"


def _encode(value: int, length: int) -> str:
    chars = ["0"] * length
    for i in range(length - 1, -1, -1):
        value, remainder = divmod(value, 32)
        chars[i] = _ULID_ALPHABET[remainder]
    return "".join(chars)


def new_ulid() -> str:
    """Return a new ULID string."""

    timestamp = int(time.time() * 1000)
    randomness = int.from_bytes(os.urandom(10), "big")
    return _encode(timestamp, 10) + _encode(randomness, 16)


def is_valid_ulid(value: str) -> bool:
    """Return True if *value* looks like a ULID."""

    if len(value) != 26:
        return False
    return all(ch in _ULID_ALPHABET for ch in value)


__all__ = ["new_ulid", "is_valid_ulid"]

def ulid_from_string(value: str) -> str:
    """Create a deterministic ULID from an arbitrary string.

    Uses SHA1(value) to derive the 16-char randomness part; timestamp set to 0.
    This is only for idempotence mapping (not for ordering).
    """
    if is_valid_ulid(value):
        return value
    # timestamp 0 encoded to 10 chars
    ts_part = _encode(0, 10)
    digest = hashlib.sha1(value.encode("utf-8")).digest()
    # take first 10 bytes to form 16 base32 chars (80 bits -> fits 16 * 5 = 80)
    rnd_int = int.from_bytes(digest[:10], "big")
    rnd_part = _encode(rnd_int, 16)
    return ts_part + rnd_part

__all__.append("ulid_from_string")
