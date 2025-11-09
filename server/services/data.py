"""Helpers for loading/sanitizing scene + show data."""

from __future__ import annotations

from typing import Any

from ..models import SceneModel
from ..persistence.scenes import ScenesStore
from ..persistence.show import ShowStore


def sanitize_scene_list(payload: object) -> list[dict[str, Any]]:
    if not isinstance(payload, list):
        return []
    sanitized: list[dict[str, Any]] = []
    for item in payload:
        try:
            model = SceneModel.model_validate(item)
        except Exception:
            continue
        sanitized.append(model.model_dump())
    return sanitized


async def load_scenes(store: ScenesStore | None) -> list[dict[str, Any]]:
    if store is None:
        return []
    try:
        raw = await store.load()
    except Exception:
        return []
    return sanitize_scene_list(raw)


async def load_show_snapshot(store: ShowStore | None) -> dict[str, Any]:
    if store is None:
        return {}
    try:
        raw = await store.load()
    except Exception:
        return {}
    if not isinstance(raw, dict):
        return {}
    snapshot: dict[str, Any] = {
        "version": raw.get("version", "1.1"),
        "exportedAt": raw.get("exportedAt"),
        "universes": raw.get("universes") if isinstance(raw.get("universes"), list) else [],
        "fixtures": raw.get("fixtures") if isinstance(raw.get("fixtures"), list) else [],
        "effects": raw.get("effects") if isinstance(raw.get("effects"), list) else [],
        "stepperMotors": raw.get("stepperMotors") if isinstance(raw.get("stepperMotors"), list) else [],
        "servos": raw.get("servos") if isinstance(raw.get("servos"), list) else [],
        "midiMappings": raw.get("midiMappings") if isinstance(raw.get("midiMappings"), list) else [],
        "scenes": sanitize_scene_list(raw.get("scenes")),
    }
    return snapshot
