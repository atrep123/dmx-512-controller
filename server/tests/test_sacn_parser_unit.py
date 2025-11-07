from __future__ import annotations

import struct
import pytest

from server.inputs.sacn_receiver import ACN_PACKET_IDENTIFIER, parse_sacn_packet


def _make_packet(universe: int, priority: int, seq: int, dmx: bytes, start_code: int = 0x00) -> bytes:
    dmx = dmx[:512]
    prop_vals = bytes([start_code]) + dmx

    dmp_layer_body = b"".join([
        b"\x02",  # DMP vector
        b"\xa1",  # address & data type
        struct.pack("!H", 0x0000),  # first property address
        struct.pack("!H", 0x0001),  # address increment
        struct.pack("!H", len(prop_vals)),  # property value count
        prop_vals,
    ])
    dmp_layer = struct.pack("!H", 0x7000 | len(dmp_layer_body)) + dmp_layer_body

    source_name = (b"test-source" + b"\x00" * 64)[:64]
    framing_layer_body = b"".join([
        struct.pack("!I", 0x00000002),
        source_name,
        struct.pack("!B", priority),
        struct.pack("!H", 0),  # sync addr
        struct.pack("!B", seq),
        struct.pack("!B", 0),  # options
        struct.pack("!H", universe),
        dmp_layer,
    ])
    framing_layer = struct.pack("!H", 0x7000 | len(framing_layer_body)) + framing_layer_body

    cid = b"\x01" * 16
    root_body = b"".join([
        struct.pack("!I", 0x00000004),
        cid,
        framing_layer,
    ])
    root_layer = b"".join([
        struct.pack("!H", 0x0010),
        struct.pack("!H", 0x0000),
        ACN_PACKET_IDENTIFIER,
        struct.pack("!H", 0x7000 | len(root_body)),
        root_body,
    ])

    return root_layer


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
