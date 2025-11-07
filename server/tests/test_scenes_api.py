from __future__ import annotations

from fastapi.testclient import TestClient


def test_get_scenes_returns_context_data(test_app: tuple) -> None:
    app, context, _ = test_app
    context.scenes = [
        {
            "id": "scene-1",
            "name": "Intro",
            "channelValues": {"a": 1},
            "timestamp": 1234,
            "description": "Desc",
            "tags": ["intro"],
            "favorite": True,
        }
    ]
    with TestClient(app) as client:
        response = client.get("/scenes")
        assert response.status_code == 200
        body = response.json()
        assert isinstance(body, list)
        assert body[0]["id"] == "scene-1"


def test_put_scenes_persists_to_store(test_app: tuple) -> None:
    app, context, _ = test_app
    payload = [
        {
            "id": "scene-new",
            "name": "New",
            "channelValues": {"ch-1": 255},
            "timestamp": 1700000000000,
            "description": None,
            "tags": ["test"],
            "favorite": False,
        }
    ]
    with TestClient(app) as client:
        response = client.put("/scenes", json=payload)
        assert response.status_code == 200
        body = response.json()
        assert body[0]["name"] == "New"
        assert context.scenes[0]["id"] == "scene-new"
        store = context.scenes_store
        assert store is not None
        data = store.path.read_text("utf-8")
        assert "scene-new" in data
