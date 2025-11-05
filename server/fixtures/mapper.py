from __future__ import annotations

from typing import Dict, List, Any

from .patch import FixtureInstance


def _split_16bit(value16: int) -> tuple[int, int]:
    v = max(0, min(65535, int(value16)))
    coarse = (v >> 8) & 0xFF
    fine = v & 0xFF
    return coarse, fine


def resolve_attrs(fx: FixtureInstance, attrs: Dict[str, Any]) -> List[Dict[str, int]]:
    out: List[Dict[str, int]] = []
    for attr, spec in attrs.items():
        mapping = fx.attr_map.get(attr)
        if mapping is None:
            continue
        invert = bool(fx.invert.get(attr, False))
        if "coarse" in mapping and "fine" in mapping:
            # 16-bit
            if isinstance(spec, dict) and "value16" in spec:
                coarse, fine = _split_16bit(int(spec["value16"]))
            else:
                # accept 8-bit and upscale
                v8 = max(0, min(255, int(spec)))
                coarse, fine = v8, int(round(v8 * 257)) & 0xFF
            if invert:
                inv = 65535 - ((coarse << 8) | fine)
                coarse, fine = _split_16bit(inv)
            out.append({"ch": int(mapping["coarse"]), "val": coarse})
            out.append({"ch": int(mapping["fine"]), "val": fine})
        else:
            # 8-bit
            v = max(0, min(255, int(spec) if not isinstance(spec, dict) else int(spec.get("value", 0))))
            if invert:
                v = 255 - v
            out.append({"ch": int(mapping["index"]), "val": v})
    return out

