from __future__ import annotations

import json
from pathlib import Path

import pytest

from server.fixtures.profiles import load_profiles


def test_valid_profile_load(tmp_path: Path):
    (tmp_path / "generic").mkdir()
    prof = {
        "id": "Generic.RGB.3ch",
        "manufacturer": "Generic",
        "model": "RGB PAR",
        "mode": "3ch",
        "channels": [
            {"index": 1, "attr": "r"},
            {"index": 2, "attr": "g"},
            {"index": 3, "attr": "b"},
        ],
        "defaults": {"r": 0, "g": 0, "b": 0},
    }
    (tmp_path / "generic" / "Generic.RGB.3ch.json").write_text(json.dumps(prof), encoding="utf-8")
    profiles = load_profiles(tmp_path)
    assert "Generic.RGB.3ch" in profiles


def test_invalid_profile_missing_index(tmp_path: Path):
    bad = {"id": "Bad.Profile", "channels": [{"attr": "r"}]}
    (tmp_path / "Bad.json").write_text(json.dumps(bad), encoding="utf-8")
    with pytest.raises(ValueError):
        load_profiles(tmp_path)

