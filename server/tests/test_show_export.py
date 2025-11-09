from __future__ import annotations

from fastapi.testclient import TestClient

MIDI_MAPPING = {
    "id": "m1",
    "command": "controlchange",
    "controller": 12,
    "action": {"type": "channel", "channel": 1},
}


def test_export_returns_snapshot(test_app: tuple) -> None:
    app, context, _ = test_app
    context.show_snapshot = {
        "version": "1.1",
        "exportedAt": 0,
        "universes": [{"id": "u1"}],
        "fixtures": [{"id": "fx1"}],
        "effects": [],
        "stepperMotors": [],
        "servos": [],
        "midiMappings": [MIDI_MAPPING],
        "scenes": [
            {
                "id": "scene-1",
                "name": "Intro",
                "timestamp": 1700,
                "channelValues": {"ch": 1},
            }
        ],
    }
    with TestClient(app) as client:
        response = client.get("/export")
        assert response.status_code == 200
        body = response.json()
        assert body["scenes"][0]["id"] == "scene-1"
        assert body["universes"][0]["id"] == "u1"
        assert body["midiMappings"][0]["id"] == "m1"


def test_import_show_updates_scenes_store(test_app: tuple) -> None:
    app, context, _ = test_app
    payload = {
        "version": "1.1",
        "exportedAt": 1700,
        "universes": [],
        "fixtures": [],
        "effects": [],
        "stepperMotors": [],
        "servos": [],
        "midiMappings": [
            {
                "id": "m-in",
                "command": "controlchange",
                "controller": 10,
                "action": {"type": "channel", "channel": 5},
            }
        ],
        "scenes": [
            {
                "id": "scene-new",
                "name": "Showtime",
                "timestamp": 1700,
                "channelValues": {"ch-1": 255},
            }
        ],
    }
    with TestClient(app) as client:
        resp = client.post("/import", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["scenes"][0]["id"] == "scene-new"
        assert data["midiMappings"][0]["id"] == "m-in"
        assert context.scenes[0]["name"] == "Showtime"
        assert context.show_snapshot["scenes"][0]["id"] == "scene-new"
        assert context.show_snapshot["midiMappings"][0]["id"] == "m-in"
        scenes_file = context.scenes_store.path
        assert scenes_file.exists()
        assert "scene-new" in scenes_file.read_text("utf-8")
