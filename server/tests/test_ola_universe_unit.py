from __future__ import annotations

import asyncio
from collections import defaultdict

import pytest

from server.drivers.ola_universe import OLAUniverseManager, OLAMetrics, UniverseFrame


def _metrics() -> OLAMetrics:
    """Helper to build writable metric dicts for unit tests."""
    return OLAMetrics(
        frames_total=defaultdict(int),
        frames_skipped_identical=defaultdict(int),
        frames_skipped_rate=defaultdict(int),
        last_fps=defaultdict(float),
        http_errors_total=defaultdict(int),
        http_errors_by_code=defaultdict(int),
        queue_depth=defaultdict(int),
    )


@pytest.mark.asyncio
async def test_universe_frame_uses_injected_http_post():
    calls: list[tuple[str, dict[str, str]]] = []

    def fake_post(url: str, data: dict[str, str]) -> None:
        calls.append((url, dict(data)))

    frame = UniverseFrame(
        ola_universe=5,
        base_url="http://ola.local",
        fps=120,
        http_post=fake_post,
        metrics=_metrics(),
    )
    assert frame.apply_patch([{"ch": 1, "val": 10}, {"ch": 512, "val": 200}])

    await frame.maybe_send()

    assert len(calls) == 1
    url, data = calls[0]
    assert url.endswith("/set_dmx")
    assert data["u"] == "5"
    dmx = data["d"].split(",")
    assert dmx[0] == "10"
    assert dmx[511] == "200"


@pytest.mark.asyncio
async def test_ola_manager_mapping_and_identical_skip():
    calls: list[tuple[str, dict[str, str]]] = []

    def fake_post(url: str, data: dict[str, str]) -> None:
        calls.append((url, dict(data)))

    metrics = _metrics()
    mgr = OLAUniverseManager(
        base_url="http://ola.local",
        fps=60,
        mapping={0: 7},
        http_post=fake_post,
        metrics=metrics,
    )

    assert mgr.apply_patch(0, [{"ch": 1, "val": 55}])
    await mgr.maybe_send(0)

    assert len(calls) == 1
    assert calls[0][1]["u"] == "7"
    assert metrics.frames_total[7] == 1

    # No new patch; after the rate interval elapses, identical frame should be skipped.
    await asyncio.sleep(1 / mgr.fps + 0.01)
    await mgr.maybe_send(0)

    assert len(calls) == 1  # still only one HTTP call
    assert metrics.frames_skipped_identical[7] == 1
