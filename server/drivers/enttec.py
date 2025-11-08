"""Enttec DMX USB PRO driver and device discovery."""

from __future__ import annotations

import asyncio
import dataclasses
import logging
import time
from typing import Any, Callable, Iterable, Sequence

import anyio

try:  # pragma: no cover - optional import guarded at runtime
    import serial  # type: ignore
    from serial.tools import list_ports
except Exception:  # pragma: no cover
    serial = None  # type: ignore
    list_ports = None  # type: ignore

logger = logging.getLogger("drivers.enttec")

ENTTEC_VENDOR_IDS = {0x0403}
ENTTEC_PRODUCT_IDS = {0x6001, 0x6010, 0x0400}
DMX_PACKET_LABEL = 0x06
START_BYTE = 0x7E
END_BYTE = 0xE7


@dataclasses.dataclass(slots=True)
class USBDeviceInfo:
    """Normalized metadata about a USB serial device."""

    port: str
    vid: int | None
    pid: int | None
    manufacturer: str | None
    product: str | None
    serial_number: str | None

    def matches(self, vendor_ids: set[int], product_ids: set[int]) -> bool:
        if self.vid is None:
            return False
        if vendor_ids and self.vid not in vendor_ids:
            return False
        if product_ids and self.pid is not None and product_ids and self.pid not in product_ids:
            return False
        return True


def list_usb_devices() -> list[USBDeviceInfo]:
    """Enumerate USB serial ports present on the host."""

    if list_ports is None:
        return []
    devices: list[USBDeviceInfo] = []
    for port in list_ports.comports():
        try:
            devices.append(
                USBDeviceInfo(
                    port=port.device,
                    vid=port.vid,
                    pid=port.pid,
                    manufacturer=getattr(port, "manufacturer", None),
                    product=getattr(port, "product", None),
                    serial_number=getattr(port, "serial_number", None),
                )
            )
        except Exception:
            continue
    return devices


def find_enttec_device(
    preferred_port: str | None = None,
    vendor_ids: Iterable[int] | None = None,
    product_ids: Iterable[int] | None = None,
) -> USBDeviceInfo | None:
    """Return the first Enttec-compatible device, honoring an optional preferred port."""

    vendor_set = set(vendor_ids or ENTTEC_VENDOR_IDS)
    product_set = set(product_ids or ENTTEC_PRODUCT_IDS)
    devices = list_usb_devices()
    if preferred_port:
        for dev in devices:
            if dev.port == preferred_port:
                return dev
    for dev in devices:
        if dev.matches(vendor_set, product_set):
            return dev
    # fallback: try fuzzy match on product name
    for dev in devices:
        name = (dev.product or "").lower()
        if "enttec" in name or "dmx usb pro" in name:
            return dev
    return None


class USBDeviceMonitor:
    """Background poller that tracks available USB serial devices."""

    def __init__(
        self,
        interval_sec: float = 5.0,
        vendor_ids: Sequence[int] | None = None,
        product_ids: Sequence[int] | None = None,
        on_change: Callable[[list[USBDeviceInfo]], None] | None = None,
    ) -> None:
        self.interval = interval_sec
        self.vendor_ids = set(vendor_ids or ENTTEC_VENDOR_IDS)
        self.product_ids = set(product_ids or ENTTEC_PRODUCT_IDS)
        self._devices: list[USBDeviceInfo] = []
        self._task: asyncio.Task[None] | None = None
        self._stop = asyncio.Event()
        self._on_change = on_change

    def snapshot(self) -> list[USBDeviceInfo]:
        return list(self._devices)

    def pick_candidate(self) -> USBDeviceInfo | None:
        return find_enttec_device(None, self.vendor_ids, self.product_ids)

    async def start(self) -> None:
        if self._task:
            return
        await self._update()
        self._stop.clear()
        self._task = asyncio.create_task(self._run(), name="usb-monitor")

    async def stop(self) -> None:
        if self._task is None:
            return
        self._stop.set()
        self._task.cancel()
        await asyncio.gather(self._task, return_exceptions=True)
        self._task = None

    async def refresh_now(self) -> list[USBDeviceInfo]:
        await self._update()
        return self.snapshot()

    async def _run(self) -> None:
        try:
            while not self._stop.is_set():
                await asyncio.sleep(self.interval)
                await self._update()
        except asyncio.CancelledError:  # pragma: no cover - cooperative cancellation
            raise

    async def _update(self) -> None:
        devices = list_usb_devices()
        if devices != self._devices:
            self._devices = devices
            if self._on_change is not None:
                try:
                    self._on_change(self.snapshot())
                except Exception:
                    logger.exception("usb_monitor_callback_error")


class EnttecDMXUSBPro:
    """Async DMX writer for Enttec DMX USB PRO devices."""

    def __init__(
        self,
        port: str,
        baudrate: int = 57600,
        fps: int = 40,
        reconnect_attempts: int = 3,
    ) -> None:
        self.port = port
        self.baudrate = baudrate
        self._interval = 1.0 / max(fps, 1)
        self._lock = asyncio.Lock()
        self._next_ts = 0.0
        self._last_frame: tuple[int, int, int] | None = None
        self._serial: Any | None = None
        self._reconnect_attempts = reconnect_attempts

    async def open(self) -> None:
        await anyio.to_thread.run_sync(self._open_sync)

    def _open_sync(self) -> None:
        if serial is None:  # pragma: no cover - dependency missing handled in runtime
            raise RuntimeError("pyserial not installed")
        self._serial = serial.Serial(self.port, self.baudrate, timeout=0)  # type: ignore[call-arg]
        self._serial.reset_input_buffer()
        self._serial.reset_output_buffer()

    async def close(self) -> None:
        await anyio.to_thread.run_sync(self._close_sync)

    def _close_sync(self) -> None:
        if self._serial is not None:
            try:
                self._serial.close()
            finally:
                self._serial = None

    async def __call__(self, state: dict[str, Any]) -> None:
        frame = (
            int(state.get("r", 0)),
            int(state.get("g", 0)),
            int(state.get("b", 0)),
        )
        async with self._lock:
            now = time.monotonic()
            if self._last_frame == frame and now < self._next_ts:
                return
            if now < self._next_ts:
                return
            self._next_ts = now + self._interval
            self._last_frame = frame
        payload = self._build_packet(frame)
        for attempt in range(self._reconnect_attempts):
            try:
                await anyio.to_thread.run_sync(self._write_sync, payload)
                return
            except Exception as exc:
                logger.warning("enttec_write_failed attempt=%s error=%s", attempt + 1, exc)
                await self._reconnect()
        logger.error("enttec_write_dropped port=%s", self.port)

    async def _reconnect(self) -> None:
        await self.close()
        try:
            await self.open()
        except Exception as exc:  # pragma: no cover - guarded by tests via monkeypatch
            logger.error("enttec_reconnect_failed port=%s error=%s", self.port, exc)

    def _build_packet(self, rgb: tuple[int, int, int]) -> bytes:
        data = bytearray(513)
        data[0] = 0  # start code
        data[1:4] = bytes(rgb)
        length = len(data)
        payload = bytearray(5 + length)
        payload[0] = START_BYTE
        payload[1] = DMX_PACKET_LABEL
        payload[2] = length & 0xFF
        payload[3] = (length >> 8) & 0xFF
        payload[4 : 4 + length] = data
        payload[-1] = END_BYTE
        return bytes(payload)


__all__ = [
    "EnttecDMXUSBPro",
    "USBDeviceInfo",
    "USBDeviceMonitor",
    "find_enttec_device",
    "list_usb_devices",
]
