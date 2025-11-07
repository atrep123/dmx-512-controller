from __future__ import annotations

import asyncio
import contextlib
from typing import Any

import pytest
from hypothesis import given, strategies as st

from server.engine import Engine
from server.models import CMD_SCHEMA, RGBCommand
from server.util.ulid import new_ulid


class DedupeStub:
    def __init__(self) -> None:
        self.seen: set[str] = set()

    async def accept(self, cmd_id: str | None) -> bool:
        if cmd_id is None:
            return True
        if cmd_id in self.seen:
            return False
        self.seen.add(cmd_id)
        return True


async def build_engine() -> tuple[Engine, list[dict[str, Any]], asyncio.Task[None]]:
    published: list[dict[str, Any]] = []

    async def publish(state: dict[str, Any]) -> None:
        published.append(dict(state))

    async def broadcast(state: dict[str, Any]) -> None:
        published.append({"broadcast": dict(state)})

    async def persist(state: dict[str, Any]) -> None:
        published.append({"persist": dict(state)})

    engine = Engine(
        publish_state_cb=publish,
        broadcast_state_cb=broadcast,
        persist_state_cb=persist,
        dedupe_accept=DedupeStub().accept,
        queue_limit=32,
    )
    task = asyncio.create_task(engine.run())
    return engine, published, task


@pytest.mark.asyncio
async def test_engine_idempotence() -> None:
    engine, published, task = await build_engine()
    cmd = RGBCommand(
        schema=CMD_SCHEMA,
        cmdId=new_ulid(),
        src="ui",
        r=10,
        g=20,
        b=30,
        ts=None,
    )
    await engine.submit(cmd)
    await engine.submit(cmd)
    await asyncio.sleep(0.1)
    assert engine.state["seq"] == 1
    assert engine.metrics.processed == 1
    task.cancel()
    with contextlib.suppress(asyncio.CancelledError):
        await task


@pytest.mark.asyncio
async def test_engine_last_write_wins() -> None:
    engine, _, task = await build_engine()
    cmds = [
        RGBCommand(schema=CMD_SCHEMA, cmdId=new_ulid(), src="ui", r=1, g=2, b=3, ts=None),
        RGBCommand(schema=CMD_SCHEMA, cmdId=new_ulid(), src="ui", r=5, g=6, b=7, ts=None),
        RGBCommand(schema=CMD_SCHEMA, cmdId=new_ulid(), src="ui", r=8, g=9, b=10, ts=None),
    ]
    for cmd in cmds:
        await engine.submit(cmd)
    await asyncio.sleep(0.1)
    assert engine.state["seq"] == 3
    assert (engine.state["r"], engine.state["g"], engine.state["b"]) == (8, 9, 10)
    task.cancel()
    with contextlib.suppress(asyncio.CancelledError):
        await task


@pytest.mark.asyncio
async def test_engine_bounds() -> None:
    engine, _, task = await build_engine()
    cmd = RGBCommand.model_construct(
        schema_=CMD_SCHEMA,
        cmdId=new_ulid(),
        src="ui",
        r=999,
        g=-10,
        b=256,
        ts=None,
    )
    await engine.submit(cmd)
    await asyncio.sleep(0.1)
    assert (engine.state["r"], engine.state["g"], engine.state["b"]) == (255, 0, 255)
    task.cancel()
    with contextlib.suppress(asyncio.CancelledError):
        await task


def build_commands(values: list[tuple[int, int, int]]) -> list[RGBCommand]:
    commands: list[RGBCommand] = []
    for idx, (r, g, b) in enumerate(values):
        commands.append(
            RGBCommand(
                schema=CMD_SCHEMA,
                cmdId=new_ulid(),
                src="test",
                r=r,
                g=g,
                b=b,
                ts=None,
            )
        )
    return commands


@given(st.lists(st.tuples(st.integers(0, 255), st.integers(0, 255), st.integers(0, 255)), min_size=1, max_size=20))
def test_engine_property_last_value(values: list[tuple[int, int, int]]) -> None:
    async def scenario() -> None:
        engine, _, task = await build_engine()
        try:
            for cmd in build_commands(values):
                await engine.submit(cmd)
            await asyncio.sleep(0.1)
            last = values[-1]
            assert (engine.state["r"], engine.state["g"], engine.state["b"]) == last
        finally:
            task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await task

    asyncio.run(scenario())
