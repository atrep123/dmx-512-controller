from __future__ import annotations

import pytest

from server.app import _load_scenes_from_store, _load_show_snapshot
from server.persistence.scenes import ScenesStore
from server.persistence.show import ShowStore


@pytest.mark.asyncio
async def test_load_scenes_from_store_validates_payload(tmp_path) -> None:
    store = ScenesStore(tmp_path / "scenes.json")
    await store.save(
        [
            {
                "id": "scene-ok",
                "name": "Intro",
                "timestamp": 1700,
                "channelValues": {"ch-1": 255},
            },
            {"id": "invalid", "channelValues": {}},  # missing required fields
        ]
    )

    scenes = await _load_scenes_from_store(store)

    assert len(scenes) == 1
    assert scenes[0]["id"] == "scene-ok"


@pytest.mark.asyncio
async def test_load_show_snapshot_sanitizes_lists(tmp_path) -> None:
    store = ShowStore(tmp_path / "show.json")
    payload = {
        "version": "1.1",
        "exportedAt": 1700,
        "universes": [{"id": "u1"}],
        "fixtures": [{"id": "fx1"}],
        "effects": "nope",
        "stepperMotors": [{"id": "m1"}],
        "servos": [{"id": "s1"}],
        "scenes": [
            {
                "id": "scene-ok",
                "name": "Intro",
                "timestamp": 1700,
                "channelValues": {"ch-1": 255},
            }
        ],
    }
    await store.save(payload)

    snapshot = await _load_show_snapshot(store)

    assert snapshot["universes"] == [{"id": "u1"}]
    assert snapshot["fixtures"] == [{"id": "fx1"}]
    assert snapshot["effects"] == []  # coerced to list
    assert snapshot["stepperMotors"] == [{"id": "m1"}]
    assert snapshot["servos"] == [{"id": "s1"}]
    assert snapshot["scenes"][0]["id"] == "scene-ok"
