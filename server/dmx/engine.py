"""General DMX engine with multi-universe state and layered output.

Layers:
 - local_frame: state from local commands and fades
 - sacn_frame: state merged from sACN sources
 - output_frame: max(local, sacn) per channel, published to clients/OLA
"""

from __future__ import annotations

import time
from typing import Dict, List, Tuple


class DMXEngine:
    def __init__(self) -> None:
        # universe -> 512-byte frame for each layer
        self._local: Dict[int, bytearray] = {0: bytearray(512)}
        self._sacn: Dict[int, bytearray] = {}
        self._output: Dict[int, bytearray] = {0: bytearray(512)}
        self._rev: int = 0
        self._ts: int = int(time.time() * 1000)

    def _frame_local(self, universe: int) -> bytearray:
        if universe not in self._local:
            self._local[universe] = bytearray(512)
        return self._local[universe]

    def _frame_sacn(self, universe: int) -> bytearray:
        if universe not in self._sacn:
            self._sacn[universe] = bytearray(512)
        return self._sacn[universe]

    def _frame_output(self, universe: int) -> bytearray:
        if universe not in self._output:
            self._output[universe] = bytearray(512)
        return self._output[universe]

    def apply_patch(self, universe: int, items: List[dict]) -> Tuple[List[dict], int, int]:
        """Apply a local patch and recompute output. Returns (delta, rev, ts)."""
        return self.apply_local_patch(universe, items)

    def apply_local_patch(self, universe: int, items: List[dict]) -> Tuple[List[dict], int, int]:
        """Apply a patch to the local layer and recompute output. Returns output delta."""
        uni = int(universe)
        frame = self._frame_local(uni)
        latest: Dict[int, int] = {}
        for it in items:
            ch = int(it.get("ch"))
            val = int(it.get("val"))
            if 1 <= ch <= 512 and 0 <= val <= 255:
                latest[ch] = val
        changed = False
        for ch, val in latest.items():
            idx = ch - 1
            if frame[idx] != val:
                frame[idx] = val
                changed = True
        return self.recompute_output(uni) if changed else ([], self._rev, self._ts)

    def apply_sacn_composite(self, universe: int, frame_bytes: bytes | bytearray | list[int]) -> Tuple[List[dict], int, int]:
        """Replace sACN composite frame for universe and recompute output."""
        uni = int(universe)
        frame = self._frame_sacn(uni)
        # normalize to list of 512 ints
        arr = list(frame_bytes)
        if len(arr) < 512:
            arr = arr + [0] * (512 - len(arr))
        changed = False
        for i in range(512):
            val = int(arr[i]) & 0xFF
            if frame[i] != val:
                frame[i] = val
                changed = True
        return self.recompute_output(uni) if changed else ([], self._rev, self._ts)

    def recompute_output(self, universe: int) -> Tuple[List[dict], int, int]:
        """Compute output = max(local, sacn) per channel; return delta vs last output."""
        uni = int(universe)
        local = self._frame_local(uni)
        sacn = self._frame_sacn(uni)
        out = self._frame_output(uni)
        delta: List[dict] = []
        for i in range(512):
            v = local[i] if local[i] >= sacn[i] else sacn[i]
            if out[i] != v:
                out[i] = v
                delta.append({"ch": i + 1, "val": int(v)})
        if delta:
            self._rev += 1
            self._ts = int(time.time() * 1000)
        return delta, self._rev, self._ts

    def snapshot(self) -> Dict[int, Dict[int, int]]:
        out: Dict[int, Dict[int, int]] = {}
        for uni, frame in self._output.items():
            out[uni] = {i + 1: int(v) for i, v in enumerate(frame) if True}
        return out

    @property
    def rev(self) -> int:
        return self._rev

    @property
    def ts(self) -> int:
        return self._ts

    # Diagnostics
    def sacn_frame(self, universe: int) -> list[int]:
        return list(self._frame_sacn(int(universe)))
