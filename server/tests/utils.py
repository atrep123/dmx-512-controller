from __future__ import annotations

from typing import Any, Dict, List, Union


Frame = Union[List[Any], Dict[Any, Any]]


def _coerce_int(value: Any) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        try:
            return int(float(value))
        except Exception:
            return 0


def _universes_container(state: dict[str, Any]) -> Any:
    return state.get("universes", {})


def get_universe_frame(state: dict[str, Any], universe: int) -> Frame:
    universes = _universes_container(state)
    if isinstance(universes, list):
        if 0 <= universe < len(universes):
            return universes[universe] or []
        return []
    if isinstance(universes, dict):
        return universes.get(universe) or universes.get(str(universe)) or {}
    return {}


def channel_value(state: dict[str, Any], universe: int, channel: int) -> int:
    frame = get_universe_frame(state, universe)
    if isinstance(frame, list):
        if 0 <= channel < len(frame):
            return _coerce_int(frame[channel])
        return 0
    if isinstance(frame, dict):
        if channel in frame:
            return _coerce_int(frame[channel])
        if str(channel) in frame:
            return _coerce_int(frame[str(channel)])
    return 0
