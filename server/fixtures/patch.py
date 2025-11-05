from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Set

import yaml

from server.util.schema import load_schemas
from .profiles import Profile


@dataclass
class FixtureInstance:
    id: str
    name: str
    profile: Profile
    universe: int
    address: int
    invert: Dict[str, bool]
    occupied: Set[int]
    attr_map: Dict[str, Dict[str, int]]  # attr -> {"index": ch} or {"coarse": ch, "fine": ch}


def _load_file(path: Path) -> dict[str, Any]:
    text = path.read_text(encoding="utf-8")
    if path.suffix.lower() in (".yaml", ".yml"):
        return yaml.safe_load(text) or {}
    return json.loads(text)


def load_patch(path: Path, profiles: Dict[str, Profile]) -> Dict[str, FixtureInstance]:
    schema = load_schemas()._load("shared/schema/fixture.patch.schema.json")
    data = _load_file(path) if path.exists() else {"fixtures": []}
    for err in schema.iter_errors(data):
        raise ValueError(f"invalid patch: {err.message}")
    instances: Dict[str, FixtureInstance] = {}
    occupied_per_uni: Dict[int, Set[int]] = {}
    for item in data.get("fixtures", []):
        fx_id = str(item["id"])
        prof_id = str(item["profile"])
        prof = profiles.get(prof_id)
        if prof is None:
            raise ValueError(f"profile not found: {prof_id}")
        uni = int(item["universe"]) ; addr = int(item["address"]) ; name = str(item.get("name", fx_id))
        invert = {str(k): bool(v) for k, v in (item.get("invert") or {}).items()}
        # Build occupied channel set and attr_map
        occ: Set[int] = set()
        attr_map: Dict[str, Dict[str, int]] = {}
        for chdef in prof.channels:
            if (chdef.resolution == "16bit") and (chdef.coarse_index is not None and chdef.fine_index is not None):
                coarse_abs = addr + int(chdef.coarse_index) - 1
                fine_abs = addr + int(chdef.fine_index) - 1
                if fine_abs > 512:
                    raise ValueError(f"16-bit channel exceeds 512 at fixture {fx_id}")
                occ.update({coarse_abs, fine_abs})
                attr_map[chdef.attr] = {"coarse": coarse_abs, "fine": fine_abs}
            else:
                abs_ch = addr + int(chdef.index) - 1
                if abs_ch < 1 or abs_ch > 512:
                    raise ValueError(f"channel out of range at fixture {fx_id}")
                occ.add(abs_ch)
                attr_map[chdef.attr] = {"index": abs_ch}
        # overlaps
        occ_set = occupied_per_uni.setdefault(uni, set())
        overlap = occ_set.intersection(occ)
        if overlap:
            raise ValueError(f"address overlap in universe {uni}: {sorted(overlap)}")
        occ_set.update(occ)
        instances[fx_id] = FixtureInstance(id=fx_id, name=name, profile=prof, universe=uni, address=addr, invert=invert, occupied=occ, attr_map=attr_map)
    return instances

