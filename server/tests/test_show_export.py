from __future__ import annotations

from fastapi.testclient import TestClient


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
        assert context.scenes[0]["name"] == "Showtime"
        assert context.show_snapshot["scenes"][0]["id"] == "scene-new"
        scenes_file = context.scenes_store.path
        assert scenes_file.exists()
        assert "scene-new" in scenes_file.read_text("utf-8")
