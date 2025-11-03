from __future__ import annotations

import asyncio
import contextlib
import json
from typing import Any, cast

import pytest
from asyncio_mqtt import Client, MqttError

from server.config import Settings
from server.engine import Engine
from server.mqtt_in import CMD_TOPIC, run_mqtt_in
from server.mqtt_out import STATE_TOPIC, build_publisher, publish_state
from server.persistence.dedupe import CommandDeduplicator
from server.persistence.store import RGBState, StateStore
from server.ws_hub import WSHub


@pytest.mark.asyncio
async def test_mqtt_command_to_state(tmp_path) -> None:
    settings = Settings(
        mqtt_host="localhost",
        mqtt_port=1883,
        persistence_path=tmp_path / "state.json",
        dedupe_path=tmp_path / "dedupe.json",
    )
    try:
        async with Client(settings.mqtt_host, settings.mqtt_port, client_id="dmx-test-probe"):
            pass
    except MqttError:
        pytest.skip("MQTT broker unavailable")

    hub = WSHub()
    store = StateStore(settings.persistence_path)
    dedupe = CommandDeduplicator(
        ttl_seconds=settings.cmd_dedupe_ttl_seconds,
        capacity=settings.cmd_dedupe_capacity,
        path=settings.dedupe_path,
    )

    publisher = await build_publisher(settings)

    async def persist_state(state: dict[str, Any]) -> None:
        await store.save(cast(RGBState, state))

    engine = Engine(
        publish_state_cb=lambda state: publish_state(publisher, state),
        broadcast_state_cb=hub.send_state,
        persist_state_cb=persist_state,
        dedupe_accept=dedupe.accept,
        queue_limit=settings.queue_size,
    )

    await publish_state(publisher, engine.state)

    engine_task = asyncio.create_task(engine.run())
    mqtt_task = asyncio.create_task(run_mqtt_in(engine, settings))

    async with Client(settings.mqtt_host, settings.mqtt_port, client_id="dmx-state-listener") as state_client:
        await state_client.subscribe((STATE_TOPIC, 1))
        async with state_client.messages() as messages:
            initial = json.loads((await messages.__anext__()).payload.decode())
            payload = {
                "schema": "demo.rgb.cmd.v1",
                "cmdId": "01HZX3YJ9YJ3M5QAZ3GZ8K3QAB",
                "src": "esp-1",
                "r": 25,
                "g": 26,
                "b": 27,
            }
            async with Client(settings.mqtt_host, settings.mqtt_port, client_id="dmx-cmd-publisher") as cmd_client:
                await cmd_client.publish(CMD_TOPIC, json.dumps(payload).encode(), qos=1)
            next_state = json.loads((await messages.__anext__()).payload.decode())
            assert next_state["seq"] == initial["seq"] + 1
            assert (next_state["r"], next_state["g"], next_state["b"]) == (25, 26, 27)

    mqtt_task.cancel()
    engine_task.cancel()
    with contextlib.suppress(asyncio.CancelledError):
        await mqtt_task
    with contextlib.suppress(asyncio.CancelledError):
        await engine_task
    await publisher.disconnect()

