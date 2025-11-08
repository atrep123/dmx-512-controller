from __future__ import annotations

import time
from typing import Any, Callable

from fastapi.testclient import TestClient

from server.drivers.enttec import USBDeviceInfo
from server import api as api_module
from server.persistence.projects import ProjectMetadata, ProjectsIndex

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
            initial = None
            for _ in range(5):
                candidate = ws.receive_json()
                if candidate.get("type") == "state":
                    initial = candidate
                    break
            assert initial is not None, "Initial state message not received"
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
            message = None
            for _ in range(5):
                candidate = ws.receive_json()
                if candidate.get("type") == "state":
                    message = candidate
                    break
            assert message is not None, "State update after command not received"
            assert message["type"] == "state"
            assert (message["r"], message["g"], message["b"]) == (90, 91, 92)


def test_usb_devices_endpoint_returns_snapshot(test_app: tuple) -> None:
    app, context, _ = test_app
    context.usb_devices = [
        USBDeviceInfo(
            port="COM9",
            vid=0x0403,
            pid=0x6001,
            manufacturer="Enttec",
            product="DMX USB PRO",
            serial_number="ABC",
        )
    ]
    with TestClient(app) as client:
        response = client.get("/usb/devices")
        assert response.status_code == 200
        devices = response.json()["devices"]
        assert devices[0]["port"] == "COM9"


def test_usb_refresh_endpoint_calls_monitor(test_app: tuple) -> None:
    app, context, _ = test_app

    class DummyMonitor:
        async def refresh_now(self):
            return [
                USBDeviceInfo(
                    port="COM10",
                    vid=0x0403,
                    pid=0x6001,
                    manufacturer="Enttec",
                    product="DMX",
                    serial_number="XYZ",
                )
            ]

    context.usb_monitor = DummyMonitor()  # type: ignore[assignment]
    with TestClient(app) as client:
        response = client.post("/usb/refresh")
        assert response.status_code == 200
        devices = response.json()["devices"]
        assert devices[0]["port"] == "COM10"
        assert context.usb_devices and context.usb_devices[0].port == "COM10"


def test_usb_reconnect_endpoint_swaps_driver(monkeypatch, test_app: tuple) -> None:
    app, context, _ = test_app

    def fake_find(*args, **kwargs):
        return USBDeviceInfo(
            port="COM11",
            vid=0x0403,
            pid=0x6001,
            manufacturer="Enttec",
            product="DMX",
            serial_number="123",
        )

    class DummyDriver:
        def __init__(self, port, baudrate, fps):
            self.port = port
            self.opened = False

        async def open(self):
            self.opened = True

        async def close(self):
            self.opened = False

    monkeypatch.setattr(api_module, "find_enttec_device", fake_find)
    monkeypatch.setattr(api_module, "EnttecDMXUSBPro", DummyDriver)

    with TestClient(app) as client:
        response = client.post("/usb/reconnect")
        assert response.status_code == 200
        assert context.usb_driver is not None
        assert context.engine.ola_cb is context.usb_driver


def test_projects_endpoints_handle_disabled_feature(test_app: tuple) -> None:
    app, _, _ = test_app
    with TestClient(app) as client:
        response = client.get("/projects")
        assert response.status_code == 404


def test_projects_endpoint_returns_data(test_app: tuple) -> None:
    app, context, _ = test_app
    meta = ProjectMetadata(id="p1", name="Show A", createdAt=1, updatedAt=1)
    context.projects_enabled = True
    context.projects_store = object()  # sentinel
    context.projects_index = ProjectsIndex(activeId="p1", projects=[meta])
    with TestClient(app) as client:
        response = client.get("/projects")
        assert response.status_code == 200
        body = response.json()
        assert body["activeId"] == "p1"
        assert body["projects"][0]["name"] == "Show A"


def test_dmx_devices_endpoint_merges_sources(monkeypatch, test_app: tuple) -> None:
    app, _, _ = test_app
    monkeypatch.setattr(api_module, "enumerate_serial_devices", lambda: [{"path": "COM5"}])
    monkeypatch.setattr(api_module, "enumerate_artnet_nodes", lambda: [{"ip": "192.168.1.10"}])
    with TestClient(app) as client:
        response = client.get("/dmx/devices")
        assert response.status_code == 200
        body = response.json()
        assert body["serial"][0]["path"] == "COM5"
        assert body["artnet"][0]["ip"] == "192.168.1.10"


def test_dmx_test_endpoint_serial(monkeypatch, test_app: tuple) -> None:
    app, _, _ = test_app
    captured: dict[str, Any] = {}

    def fake_send(path: str, channel: int, value: int) -> None:
        captured["path"] = path
        captured["channel"] = channel
        captured["value"] = value

    monkeypatch.setattr(api_module, "_send_dmx_serial_frame", fake_send)
    with TestClient(app) as client:
        response = client.post(
            "/dmx/test",
            json={"type": "serial", "path": "COM7", "channel": 5, "value": 200},
        )
        assert response.status_code == 200
        assert captured == {"path": "COM7", "channel": 5, "value": 200}
        body = response.json()
        assert body["target"] == "COM7"


def test_dmx_test_endpoint_artnet(monkeypatch, test_app: tuple) -> None:
    app, _, _ = test_app
    captured: dict[str, Any] = {}

    def fake_send(ip: str, channel: int, value: int) -> None:
        captured["ip"] = ip
        captured["channel"] = channel
        captured["value"] = value

    monkeypatch.setattr(api_module, "_send_artnet_frame", fake_send)
    with TestClient(app) as client:
        response = client.post(
            "/dmx/test",
            json={"type": "artnet", "ip": "10.0.0.5", "channel": 1, "value": 123},
        )
        assert response.status_code == 200
        assert captured == {"ip": "10.0.0.5", "channel": 1, "value": 123}
