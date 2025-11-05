"""Minimal sACN (E1.31) receiver with HTP/priority merge."""

from __future__ import annotations

import asyncio
import struct
import time
from dataclasses import dataclass, field
from typing import Dict, Tuple, List, Any


def parse_sacn_packet(data: bytes) -> tuple[int, int, int, bytes, str, bytes, int]:
    # Validate Root Layer
    if len(data) < 126:
        raise ValueError("packet too short")
    # Preamble Size (16), Post-amble (0)
    preamble_size = struct.unpack_from("!H", data, 0)[0]
    if preamble_size != 0x0010:
        raise ValueError("bad preamble")
    # ACN Packet Identifier "ASC-E1.17"
    if data[4:16] != b"ASC-E1.17\x00\x00\x00\x00\x00\x00":
        raise ValueError("bad ACN PID")
    # Root layer length + vector
    # flags & length (2 bytes), then vector (4 bytes)
    _, = struct.unpack_from("!H", data, 16)
    root_vector = struct.unpack_from("!I", data, 18)[0]
    if root_vector != 0x00000004:
        raise ValueError("not data packet")
    # CID (16 bytes)
    cid = data[22:38]
    # Framing Layer starts at 38
    framing_vector = struct.unpack_from("!I", data, 38)[0]
    if framing_vector != 0x00000002:
        raise ValueError("bad framing vector")
    source_name = data[42:106].split(b"\x00", 1)[0].decode(errors="ignore")
    priority = data[106]
    # Sync address (2), seq (1), options (1), universe (2)
    seq = data[109]
    universe = struct.unpack_from("!H", data, 111)[0]
    # DMP Layer starts at 113
    dmp_vector = data[115]
    if dmp_vector != 0x02:
        raise ValueError("bad dmp vector")
    # Address & Data Type (1), First Property Address (2), Address Increment (2), property value count (2)
    prop_count = struct.unpack_from("!H", data, 123)[0]
    if prop_count < 1 or prop_count > 513:
        raise ValueError("bad property count")
    # Property values begin at 125
    start_code = data[125]
    if start_code != 0x00:
        # only process start_code 0x00 DMX data
        raise ValueError("unsupported start code")
    values_len = prop_count - 1
    dmx = data[126:126 + values_len]
    if len(dmx) < values_len:
        raise ValueError("truncated dmx")
    # pad to 512
    if values_len < 512:
        dmx = dmx + bytes(512 - values_len)
    return int(universe), int(priority), int(seq), cid, source_name, dmx[:512], int(start_code)


@dataclass
class SACNSource:
    priority: int
    last_seq: int
    last_seen_ms: int
    frame: bytearray = field(default_factory=lambda: bytearray(512))


class SACNReceiver(asyncio.DatagramProtocol):
    def __init__(self, context) -> None:
        self.context = context
        self.transport: asyncio.transports.DatagramTransport | None = None
        # (universe, cid) -> source
        self.sources: Dict[Tuple[int, bytes], SACNSource] = {}
        self.composites: Dict[int, bytearray] = {}
        # metrics storage on context.core
        core = context.core
        # Prepare metric dicts if not exist
        for attr in ("sacn_packets_total", "sacn_sources", "sacn_ooo_total", "sacn_priority_current"):
            if not hasattr(core, attr):
                setattr(core, attr, {})
        # Pre-compute allowed universes set from settings (CSV and ranges like 0,1,10-12)
        self._allowed_universes: set[int] = set()
        try:
            spec = str(context.settings.sacn_universes or "").strip()
            if spec:
                for part in spec.split(','):
                    part = part.strip()
                    if not part:
                        continue
                    if '-' in part:
                        a, b = part.split('-', 1)
                        start = int(a)
                        end = int(b)
                        if start <= end:
                            for u in range(start, end + 1):
                                self._allowed_universes.add(u)
                        else:
                            for u in range(end, start + 1):
                                self._allowed_universes.add(u)
                    else:
                        self._allowed_universes.add(int(part))
        except Exception:
            self._allowed_universes = set()

    def connection_made(self, transport) -> None:  # type: ignore[override]
        self.transport = transport

    def datagram_received(self, data: bytes, addr) -> None:  # type: ignore[override]
        core = self.context.core
        try:
            u, prio, seq, cid, name, dmx, _ = parse_sacn_packet(data)
        except Exception:
            return
        # Universe filter (accept only configured universes if provided)
        if self._allowed_universes and (int(u) not in self._allowed_universes):
            return
        # metrics
        core.sacn_packets_total[u] = core.sacn_packets_total.get(u, 0) + 1
        key = (u, cid)
        now_ms = int(time.time() * 1000)
        src = self.sources.get(key)
        if src is None:
            src = SACNSource(priority=prio, last_seq=seq, last_seen_ms=now_ms)
            self.sources[key] = src
        # Out-of-order check with wraparound; accept equal (dup)
        if ((seq - src.last_seq) & 0xFF) > 128:  # likely out-of-order
            core.sacn_ooo_total[u] = core.sacn_ooo_total.get(u, 0) + 1
            return
        src.last_seq = seq
        src.last_seen_ms = now_ms
        src.priority = prio
        # update frame
        if len(dmx) < 512:
            dmx = dmx + bytes(512 - len(dmx))
        src.frame[:] = dmx[:512]
        # recompute composite & apply
        composite = self._recompute_composite(u)
        core.sacn_sources[u] = sum(1 for (uu, _), s in self.sources.items() if uu == u)
        core.sacn_priority_current[u] = prio if composite is not None else 0
        if composite is not None:
            self.context.dmx.apply_sacn_composite(u, composite)
            self.context.dmx.recompute_output(u)

    def _recompute_composite(self, universe: int) -> bytearray | None:
        # select sources for this universe
        now_ms = int(time.time() * 1000)
        timeout = int(self.context.settings.sacn_source_timeout_ms)
        lst = [(cid, s) for (u, cid), s in list(self.sources.items()) if u == universe]
        # purge stale
        for cid, s in lst:
            if now_ms - s.last_seen_ms > timeout:
                del self.sources[(universe, cid)]
        lst = [(cid, s) for (u, cid), s in list(self.sources.items()) if u == universe]
        if not lst:
            self.composites[universe] = bytearray(512)
            return self.composites[universe]
        # max priority
        max_prio = max(s.priority for _, s in lst)
        chosen = [s for _, s in lst if s.priority == max_prio]
        # HTP per channel
        comp = self.composites.get(universe) or bytearray(512)
        for i in range(512):
            v = 0
            for s in chosen:
                if s.frame[i] > v:
                    v = s.frame[i]
            comp[i] = v
        self.composites[universe] = comp
        return comp

    async def close(self) -> None:
        if self.transport is not None:
            self.transport.close()
