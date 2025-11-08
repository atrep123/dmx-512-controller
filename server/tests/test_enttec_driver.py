from __future__ import annotations

import types

import pytest

from server.drivers import enttec as enttec_mod
from server.drivers.enttec import (
    ENTTEC_PRODUCT_IDS,
    ENTTEC_VENDOR_IDS,
    EnttecDMXUSBPro,
    USBDeviceInfo,
    find_enttec_device,
)


def test_enttec_packet_structure() -> None:
    driver = EnttecDMXUSBPro("COM1", fps=30)
    packet = driver._build_packet((10, 20, 30))
    # Framing bytes
    assert packet[0] == enttec_mod.START_BYTE
    assert packet[-1] == enttec_mod.END_BYTE
    length = len(packet) - 5  # header + footer
    assert packet[2] | (packet[3] << 8) == length
    # Payload start code + RGB
    assert packet[4] == 0
    assert packet[5:8] == bytes([10, 20, 30])


def test_find_enttec_device_prefers_vendor_match(monkeypatch: pytest.MonkeyPatch) -> None:
    devices = [
        USBDeviceInfo(port="COMX", vid=0x1111, pid=0x2222, manufacturer=None, product=None, serial_number=None),
        USBDeviceInfo(port="COMY", vid=list(ENTTEC_VENDOR_IDS)[0], pid=list(ENTTEC_PRODUCT_IDS)[0], manufacturer="Enttec", product="DMX", serial_number="1"),
    ]
    monkeypatch.setattr(enttec_mod, "list_usb_devices", lambda: devices)
    found = find_enttec_device()
    assert found is not None
    assert found.port == "COMY"


@pytest.mark.anyio
async def test_usb_monitor_refresh(monkeypatch: pytest.MonkeyPatch) -> None:
    sequence = [
        [USBDeviceInfo(port="A", vid=1, pid=2, manufacturer=None, product=None, serial_number=None)],
        [USBDeviceInfo(port="B", vid=3, pid=4, manufacturer=None, product=None, serial_number=None)],
    ]
    state = {"idx": 0}

    def fake_list():
        value = sequence[state["idx"]]
        state["idx"] = min(state["idx"] + 1, len(sequence) - 1)
        return value

    monkeypatch.setattr(enttec_mod, "list_usb_devices", fake_list)
    captured: list[list[USBDeviceInfo]] = []

    monitor = enttec_mod.USBDeviceMonitor(interval_sec=0.01, on_change=lambda items: captured.append(list(items)))
    await monitor.start()
    await monitor.refresh_now()
    await monitor.stop()
    assert captured, "on_change should be invoked"
    assert captured[-1][0].port == "B"
