"""SparkFun DMX serial input driver."""

from __future__ import annotations

import asyncio
import logging
import re
from typing import Awaitable, Callable

try:
    import serial  # type: ignore
except Exception as exc:  # pragma: no cover
    serial = None  # type: ignore

LINE_RE = re.compile(r"DMX:\s*read value from channel\s+(\d+)\s*:\s*(\d+)", re.IGNORECASE)

logger = logging.getLogger("drivers.dmx_input")

OnChannelFn = Callable[[int, int], Awaitable[None]]


def parse_sparkfun_line(line: str) -> tuple[int, int] | None:
    """Return (channel, value) from SparkFun sample output line."""

    match = LINE_RE.search(line)
    if not match:
        return None
    try:
        ch = int(match.group(1))
        val = int(match.group(2))
    except (TypeError, ValueError):
        return None
    if not (1 <= ch <= 512):
        return None
    if not (0 <= val <= 255):
        return None
    return ch, val


class SparkFunDMXInput:
    """Reads DMX channel logs from SparkFun DMX shield (via ESP32 sample firmware) over serial."""

    def __init__(
        self,
        *,
        port: str,
        baudrate: int,
        on_channel: OnChannelFn,
    ) -> None:
        if serial is None:  # pragma: no cover - runtime guard
            raise RuntimeError("pyserial is required for SparkFun DMX input driver")
        self.port = port
        self.baudrate = baudrate
        self._on_channel = on_channel
        self._serial: serial.Serial | None = None
        self._task: asyncio.Task[None] | None = None
        self._stop = asyncio.Event()

    async def start(self) -> None:
        if self._task:
            return
        self._stop.clear()
        loop = asyncio.get_running_loop()
        self._serial = await loop.run_in_executor(
            None, lambda: serial.Serial(self.port, baudrate=self.baudrate, timeout=1.0)  # type: ignore[arg-type]
        )
        self._task = asyncio.create_task(self._run(), name="sparkfun-dmx-reader")

    async def stop(self) -> None:
        self._stop.set()
        if self._task is not None:
            self._task.cancel()
            await asyncio.gather(self._task, return_exceptions=True)
            self._task = None
        if self._serial is not None:
            try:
                self._serial.close()
            except Exception:
                pass
            self._serial = None

    async def _run(self) -> None:
        assert self._serial is not None
        loop = asyncio.get_running_loop()
        try:
            while not self._stop.is_set():
                line_bytes = await loop.run_in_executor(None, self._serial.readline)
                if not line_bytes:
                    continue
                try:
                    line = line_bytes.decode("utf-8", errors="ignore").strip()
                except Exception:
                    continue
                parsed = parse_sparkfun_line(line)
                if parsed is None:
                    continue
                ch, val = parsed
                try:
                    await self._on_channel(ch, val)
                except Exception:
                    logger.exception("dmx_input_on_channel_failed")
        except asyncio.CancelledError:  # pragma: no cover - cooperative cancellation
            raise
        except Exception:
            logger.exception("dmx_input_crashed")
        finally:
            await self.stop()


__all__ = ["SparkFunDMXInput", "parse_sparkfun_line"]
