"""MQTT publisher for retained state."""

from __future__ import annotations

import json
from typing import Any

from asyncio_mqtt import Client, Will

from .config import Settings

STATE_TOPIC = "v1/demo/rgb/state"
LWT_TOPIC = "v1/devices/server/state"


async def build_publisher(settings: Settings) -> Client:
    """Create and connect an MQTT client for publishing state."""

    will_payload = json.dumps({"online": False}).encode()
    client = Client(
        settings.mqtt_host,
        settings.mqtt_port,
        client_id=f"{settings.mqtt_client_id_prefix}-pub",
        username=settings.mqtt_username,
        password=settings.mqtt_password,
        keepalive=settings.mqtt_keepalive,
        will=Will(topic=LWT_TOPIC, payload=will_payload, qos=1, retain=True),
    )
    await client.connect()
    await client.publish(LWT_TOPIC, json.dumps({"online": True}).encode(), qos=1, retain=True)
    return client


async def publish_state(client: Client, state: dict[str, Any]) -> None:
    payload = json.dumps(state).encode()
    await client.publish(STATE_TOPIC, payload, qos=1, retain=True)


__all__ = ["build_publisher", "publish_state", "STATE_TOPIC", "LWT_TOPIC"]
