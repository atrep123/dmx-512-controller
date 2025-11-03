from __future__ import annotations

import time
from typing import Any, Callable

from fastapi.testclient import TestClient


def wait_for_condition(condition: Callable[[], bool], timeout: float = 1.0) -> None:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if condition():
            return
        time.sleep(0.01)
    raise TimeoutError("condition not met")


def test_get_rgb_returns_initial_state(test_app: tuple) -> None:
    app, context, _ = test_app
    with TestClient(app) as client:
        response = client.get("/rgb")
        assert response.status_code == 200
        body = response.json()
        assert body["seq"] == context.engine.state["seq"]


def test_post_rgb_triggers_state_change(test_app: tuple) -> None:
    app, context, published = test_app
    with TestClient(app) as client:
        payload: dict[str, Any] = {
            "cmdId": "01HZX3YJ9YJ3M5QAZ3GZ8K3Q9Z",
            "src": "ui",
            "r": 12,
            "g": 34,
            "b": 56,
        }
        response = client.post("/rgb", json=payload)
        assert response.status_code == 202
        wait_for_condition(lambda: context.engine.metrics.processed >= 1)
        assert (context.engine.state["r"], context.engine.state["g"], context.engine.state["b"]) == (12, 34, 56)
        assert published


def test_websocket_receives_updates(test_app: tuple) -> None:
    app, context, _ = test_app
    with TestClient(app) as client:
        with client.websocket_connect("/ws") as ws:
            initial = ws.receive_json()
            assert initial["seq"] == context.engine.state["seq"]
            payload = {
                "cmdId": "01HZX3YJ9YJ3M5QAZ3GZ8K3QAA",
                "src": "ui",
                "type": "set",
                "r": 90,
                "g": 91,
                "b": 92,
            }
            ws.send_json(payload)
            message = ws.receive_json()
            assert message["type"] == "state"
            assert (message["r"], message["g"], message["b"]) == (90, 91, 92)
