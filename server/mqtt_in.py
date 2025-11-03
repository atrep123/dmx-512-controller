"""MQTT consumer for RGB commands."""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any, Callable

from asyncio_mqtt import Client, MqttError

from .config import Settings
from .engine import Engine
from .models import CMD_SCHEMA, RGBCommand

CMD_TOPIC = "v1/demo/rgb/cmd"

logger = logging.getLogger("mqtt_in")


async def run_mqtt_in(
    engine: Engine,
    settings: Settings,
    *,
    on_connect: Callable[[], None] | None = None,
    on_disconnect: Callable[[], None] | None = None,
) -> None:
    """Subscribe to MQTT commands and feed them into the engine."""

    reconnect_interval = 3
    while True:
        try:
            async with Client(
                settings.mqtt_host,
                settings.mqtt_port,
                client_id=f"{settings.mqtt_client_id_prefix}-sub",
                username=settings.mqtt_username,
                password=settings.mqtt_password,
                keepalive=settings.mqtt_keepalive,
            ) as client:
                if on_connect is not None:
                    on_connect()
                await client.subscribe((CMD_TOPIC, 1))
                async with client.unfiltered_messages() as messages:
                    async for message in messages:
                        if message.topic != CMD_TOPIC:
                            continue
                        await _handle_message(engine, message.payload)
        except asyncio.CancelledError:
            if on_disconnect is not None:
                on_disconnect()
            raise
        except MqttError as exc:
            logger.warning("mqtt_reconnect", extra={"error": str(exc)})
            if on_disconnect is not None:
                on_disconnect()
            await asyncio.sleep(reconnect_interval)
        else:
            if on_disconnect is not None:
                on_disconnect()
            await asyncio.sleep(reconnect_interval)


async def _handle_message(engine: Engine, payload: bytes) -> None:
    try:
        data: dict[str, Any] = json.loads(payload.decode())
    except json.JSONDecodeError:
        logger.warning("bad_cmd", extra={"reason": "invalid_json"})
        return
    data.setdefault("schema", CMD_SCHEMA)
    try:
        cmd = RGBCommand.model_validate(data)
    except Exception as exc:  # noqa: BLE001
        logger.warning("bad_cmd", extra={"reason": str(exc)})
        return
    await engine.submit(cmd)


__all__ = ["run_mqtt_in", "CMD_TOPIC"]
