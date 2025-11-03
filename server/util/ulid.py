"""ULID utilities."""

from __future__ import annotations

import os
import time
from typing import Final

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
