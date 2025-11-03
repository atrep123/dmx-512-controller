"""Null driver that discards frames."""

from __future__ import annotations

from typing import Any


class NullDriver:
    """A driver that ignores state updates."""

    async def __call__(self, state: dict[str, Any]) -> None:  # noqa: D401
        return None


__all__ = ["NullDriver"]
