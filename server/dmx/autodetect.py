"""DMX device enumeration helpers (serial + Art-Net)."""

from __future__ import annotations

import contextlib
import socket
from dataclasses import dataclass
from typing import Any

import serial  # type: ignore
import serial.tools.list_ports  # type: ignore

FTDI_VID = 0x0403
ENTTEC_PIDS = {0x6001, 0x6010, 0x6015}
DMXKING_VIDS = {0x04D8}


@dataclass
class SerialDevice:
    type: str
    path: str
    vendor: str | None
    product: str | None
    serial_number: str | None
    capabilities: list[str]


def enttec_handshake(port_path: str) -> bool:
    """Send GET_WIDGET_PARAMS frame (ENTTEC DMX USB PRO)."""

    try:
        with serial.Serial(port_path, baudrate=57600, timeout=0.25) as handle:  # type: ignore[attr-defined]
            request = bytes([0x7E, 0x03, 0x00, 0x00, 0xE7])
            handle.write(request)
            response = handle.read(5)
            return len(response) >= 5 and response[1] == 0x03
    except Exception:
        return False


def enumerate_serial_devices() -> list[dict[str, Any]]:
    devices: list[dict[str, Any]] = []
    for port in serial.tools.list_ports.comports():  # type: ignore[attr-defined]
        vendor_id = port.vid
        product_id = port.pid
        entry: dict[str, Any] = {
            "type": "serial",
            "path": port.device,
            "vendor": port.manufacturer or "",
            "product": port.product or "",
            "serialNumber": getattr(port, "serial_number", None),
            "capabilities": [],
        }
        if vendor_id == FTDI_VID and product_id in ENTTEC_PIDS:
            if enttec_handshake(port.device):
                entry["vendor"] = "ENTTEC"
                entry["product"] = "DMX USB Pro"
                entry["capabilities"] = ["dmx512"]
        elif vendor_id in DMXKING_VIDS:
            entry["vendor"] = "DMXKing"
            entry["capabilities"] = ["dmx512"]
        devices.append(entry)
    return devices


def enumerate_artnet_nodes(timeout_seconds: float = 0.5) -> list[dict[str, Any]]:
    """Broadcast ArtPoll and collect replies."""

    nodes: list[dict[str, Any]] = []
    poll = bytearray()
    poll.extend(b"Art-Net\x00")
    poll.extend((0x20).to_bytes(2, "little"))
    poll.extend((14).to_bytes(2, "little"))
    poll.extend(b"\x00" * 14)

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    sock.settimeout(timeout_seconds)
    try:
        sock.sendto(poll, ("255.255.255.255", 6454))
        while True:
            try:
                data, addr = sock.recvfrom(1024)
            except socket.timeout:
                break
            if not data.startswith(b"Art-Net\x00"):
                continue
            opcode = int.from_bytes(data[8:10], "little")
            if opcode != 0x2100:  # ArtPollReply
                continue
            short_name = data[42:58].split(b"\x00")[0].decode("ascii", errors="ignore")
            long_name = data[58:90].split(b"\x00")[0].decode("ascii", errors="ignore")
            nodes.append(
                {
                    "type": "artnet",
                    "ip": addr[0],
                    "shortName": short_name,
                    "longName": long_name,
                }
            )
    finally:
        with contextlib.suppress(Exception):
            sock.close()
    return nodes


__all__ = ["enumerate_serial_devices", "enumerate_artnet_nodes", "enttec_handshake"]
