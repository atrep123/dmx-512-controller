from __future__ import annotations

import types

from fastapi.testclient import TestClient


def test_state_endpoint_returns_schema_compliant_payload(test_app: tuple) -> None:
    app, _context, _ = test_app
    with TestClient(app) as client:
        resp = client.get("/state", params={"sparse": 1})
        assert resp.status_code == 200
        body = resp.json()
        assert "ts" in body and "universes" in body
        assert body.get("sparse") is True
        assert isinstance(body.get("universesSparse"), dict)


def test_state_endpoint_rejects_invalid_payload(monkeypatch, test_app: tuple) -> None:
    app, context, _ = test_app

    def bad_snapshot(self):
        return {0: {1: 999}}  # value outside 0-255 violates schema

    monkeypatch.setattr(context.dmx, "snapshot", types.MethodType(bad_snapshot, context.dmx))

    with TestClient(app) as client:
        resp = client.get("/state")
        assert resp.status_code == 500
        assert resp.json()["detail"] == "state schema invalid"
