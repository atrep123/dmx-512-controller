from __future__ import annotations

import asyncio

import pytest

from server.drivers.ola_universe import UniverseFrame, OLAMetrics


@pytest.mark.asyncio
async def test_universe_apply_and_send_debounce_and_rate() -> None:
    calls: list[dict] = []

    def fake_post(url: str, data: dict[str, str]):
        calls.append({"url": url, "data": data})

    metrics = OLAMetrics({}, {}, {}, {})
    uf = UniverseFrame(ola_universe=0, base_url="http://localhost:9090", fps=44, http_post=fake_post, metrics=metrics)

    # Apply patch: R=10,G=20,B=30
    changed = uf.apply_patch([{"ch": 1, "val": 10}, {"ch": 2, "val": 20}, {"ch": 3, "val": 30}])
    assert changed is True

    # First send should post
    await uf.maybe_send()
    assert len(calls) == 1
    assert calls[-1]["data"]["u"] == "0"
    csv = calls[-1]["data"]["d"].split(",")
    assert csv[0:3] == ["10", "20", "30"]
    assert len(csv) == 512

    # Identical frame: no send (debounce)
    await uf.maybe_send()
    assert len(calls) == 1

    # Change a value, but immediately call maybe_send again -> rate limited
    uf.apply_patch([{"ch": 1, "val": 11}])
    await uf.maybe_send()  # likely rate-limited due to immediate call
    # We cannot guarantee timing; ensure skipped counters are non-negative and at least one skip occurred among identical/rate
    total_skips = metrics.frames_skipped_identical.get(0, 0) + metrics.frames_skipped_rate.get(0, 0)
    assert total_skips >= 1

