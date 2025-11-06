"""MQTT publisher for retained state."""

from __future__ import annotations

import json
from typing import Any

from asyncio_mqtt import Client, Will
import logging

from .config import Settings

STATE_TOPIC = "v1/demo/rgb/state"
LWT_TOPIC = "v1/devices/server/state"


class _NoopPublisher:
    async def publish(self, *_args, **_kwargs) -> None:  # pragma: no cover - trivial
        return None

    async def disconnect(self) -> None:  # pragma: no cover - trivial
        return None


async def build_publisher(settings: Settings) -> Client | _NoopPublisher:
    """Create and connect an MQTT client for publishing state.

    Fail-open if the broker is unavailable to avoid aborting app startup.
    """

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
    try:
        await client.connect()
        await client.publish(LWT_TOPIC, json.dumps({"online": True}).encode(), qos=1, retain=True)
        return client
    except Exception as exc:  # pragma: no cover - depends on env
        logging.getLogger("mqtt").warning(
            "mqtt_connect_failed_fail_open", extra={"err": str(exc)}
        )
        return _NoopPublisher()


async def publish_state(client: Client, state: dict[str, Any]) -> None:
    payload = json.dumps(state).encode()
    await client.publish(STATE_TOPIC, payload, qos=1, retain=True)


__all__ = ["build_publisher", "publish_state", "STATE_TOPIC", "LWT_TOPIC"]
