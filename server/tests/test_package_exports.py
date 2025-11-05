"""Ensure critical backend packages expose expected interfaces."""

import importlib

import pytest


@pytest.mark.parametrize(
    "module_name", [
        "server.drivers",
        "server.dmx",
        "server.inputs",
        "server.fixtures",
        "server.persistence",
        "server.util",
    ],
)
def test_package_import(module_name: str) -> None:
    module = importlib.import_module(module_name)
    assert hasattr(module, "__all__"), f"{module_name} is missing __all__"
    exports = getattr(module, "__all__")
    assert isinstance(exports, list), f"{module_name}.__all__ must be a list"
    for name in exports:
        assert hasattr(module, name), f"{module_name} does not export {name}"


@pytest.mark.parametrize(
    "module_name, expected_symbols",
    [
        ("server.drivers", ["OLAClient", "OLAUniverseManager", "UniverseFrame"]),
        ("server.dmx", ["DMXEngine", "FadeEngine"]),
        ("server.inputs", ["SACNReceiver", "parse_sacn_packet"]),
        (
            "server.fixtures",
            ["load_profiles", "load_patch", "resolve_attrs", "FixtureInstance"],
        ),
        (
            "server.persistence",
            ["CommandDeduplicator", "StateStore", "RGBState"],
        ),
        (
            "server.util",
            ["configure_logging", "CoreMetrics", "new_ulid"],
        ),
    ],
)
def test_expected_exports(module_name: str, expected_symbols: list[str]) -> None:
    module = importlib.import_module(module_name)
    for symbol in expected_symbols:
        assert hasattr(module, symbol), f"{module_name} missing {symbol}"
