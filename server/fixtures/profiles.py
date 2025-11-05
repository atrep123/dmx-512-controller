from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List

import yaml

from server.util.schema import load_schemas


@dataclass
class ChannelDef:
    index: int
    attr: str
    merge: str
    resolution: str
    coarse_index: int | None = None
    fine_index: int | None = None


@dataclass
class Profile:
    id: str
    channels: List[ChannelDef]
    defaults: Dict[str, int]


def _load_file(path: Path) -> dict[str, Any]:
    text = path.read_text(encoding="utf-8")
    if path.suffix.lower() in (".yaml", ".yml"):
        return yaml.safe_load(text) or {}
    return json.loads(text)


def load_profiles(dir_path: Path) -> Dict[str, Profile]:
    schema = load_schemas()._load("shared/schema/fixture.profile.schema.json")
    profiles: Dict[str, Profile] = {}
    if not dir_path.exists():
        return profiles
    files: list[Path] = []
    # Collect YAML and JSON files explicitly; rglob returns generators, so concatenate results
    for pat in ("*.yaml", "*.yml", "*.json"):
        files.extend(dir_path.rglob(pat))
    for p in files:
        try:
            data = _load_file(p)
        except Exception:
            continue
        for err in schema.iter_errors(data):
            raise ValueError(f"invalid profile {p.name}: {err.message}")
        pid = str(data.get("id"))
        chans: List[ChannelDef] = []
        for cd in data.get("channels", []):
            res = cd.get("resolution") or data.get("resolution") or "8bit"
            chans.append(ChannelDef(
                index=int(cd["index"]),
                attr=str(cd["attr"]),
                merge=str(cd.get("merge", "LTP")),
                resolution=str(res),
                coarse_index=cd.get("coarse_index"),
                fine_index=cd.get("fine_index"),
            ))
        defaults = {str(k): int(v) for k, v in (data.get("defaults") or {}).items()}
        profiles[pid] = Profile(id=pid, channels=chans, defaults=defaults)
    return profiles
