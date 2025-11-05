from __future__ import annotations

import struct
import pytest

from server.inputs.sacn_receiver import parse_sacn_packet


def _make_packet(universe: int, priority: int, seq: int, dmx: bytes, start_code: int = 0x00) -> bytes:
    # Root Layer
    preamble = struct.pack("!H", 0x0010)
    postamble = struct.pack("!H", 0x0000)
    pid = b"ASC-E1.17\x00\x00\x00\x00\x00\x00"
    # We'll calculate lengths loosely (not strictly enforcing flags & length)
    root_vector = struct.pack("!I", 0x00000004)
    cid = b"\x01" * 16
    # Framing
    framing_vector = struct.pack("!I", 0x00000002)
    source_name = (b"test-source" + b"\x00" * 64)[:64]
    prio_b = struct.pack("!B", priority)
    sync_addr = struct.pack("!H", 0)
    seq_b = struct.pack("!B", seq)
    opts = struct.pack("!B", 0)
    uni_b = struct.pack("!H", universe)
    # DMP
    dmp_flags = b"\x00\x00"  # placeholder
    dmp_header = b"\x02\xa1\x00\x00\x00\x01"
    prop_count = struct.pack("!H", len(dmx) + 1)
    payload = bytes([start_code]) + dmx
    # Assemble approximate packet; lengths are not exact flags&length but parser is tolerant
    packet = (
        preamble + postamble + pid + struct.pack("!H", 0) + root_vector + cid +
        framing_vector + source_name + prio_b + sync_addr + seq_b + opts + uni_b +
        b"\x00\x00" + dmp_header + prop_count + bytes([start_code]) + dmx
    )
    # pad to minimal length
    return packet


def test_parse_valid_packet():
    dmx = bytes([i % 256 for i in range(1, 513)])
    pkt = _make_packet(0, 100, 42, dmx)
    u, prio, seq, cid, name, dbytes, sc = parse_sacn_packet(pkt)
    assert u == 0 and prio == 100 and seq == 42 and sc == 0
    assert len(dbytes) == 512
    assert dbytes[0] == 1 and dbytes[511] == 0


def test_parse_reject_non_zero_start_code():
    dmx = bytes([0] * 512)
    pkt = _make_packet(1, 100, 1, dmx, start_code=0xDD)
    with pytest.raises(ValueError):
        parse_sacn_packet(pkt)

