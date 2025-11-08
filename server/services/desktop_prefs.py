"""Persistence helpers for desktop onboarding preferences."""

from __future__ import annotations

import json
from pathlib import Path

from ..models import DesktopPreferences


def load_desktop_preferences(path: Path) -> DesktopPreferences:
    """Return persisted desktop preferences or defaults."""

    try:
        data = path.read_text("utf-8")
    except FileNotFoundError:
        return DesktopPreferences()
    except OSError:
        return DesktopPreferences()
    try:
        payload = json.loads(data)
        return DesktopPreferences.model_validate(payload)
    except Exception:
        return DesktopPreferences()


def save_desktop_preferences(path: Path, prefs: DesktopPreferences) -> None:
    """Write desktop preferences atomically."""

    path.parent.mkdir(parents=True, exist_ok=True)
    payload = prefs.model_dump(mode="json")
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


__all__ = ["load_desktop_preferences", "save_desktop_preferences"]
