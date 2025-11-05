from __future__ import annotations

import json
from pathlib import Path

import pytest

from server.fixtures.profiles import load_profiles
from server.fixtures.patch import load_patch


def setup_rgb_profile(dirp: Path):
    prof = {
        "id": "Generic.RGB.3ch",
        "channels": [
            {"index": 1, "attr": "r"},
            {"index": 2, "attr": "g"},
            {"index": 3, "attr": "b"},
        ]
    }
    (dirp / "Generic.RGB.3ch.json").write_text(json.dumps(prof), encoding="utf-8")


def test_patch_overlap_and_missing_profile(tmp_path: Path):
    prof_dir = tmp_path / "profiles" ; prof_dir.mkdir()
    setup_rgb_profile(prof_dir)
    profiles = load_profiles(prof_dir)
    # Overlap: two fixtures on same address and range
    patch = {
        "fixtures": [
            {"id": "fx1", "profile": "Generic.RGB.3ch", "universe": 0, "address": 1},
            {"id": "fx2", "profile": "Generic.RGB.3ch", "universe": 0, "address": 2},
        ]
    }
    patch_file = tmp_path / "patch.json"
    patch_file.write_text(json.dumps(patch), encoding="utf-8")
    with pytest.raises(ValueError):
        load_patch(patch_file, profiles)

    # Missing profile
    patch2 = {"fixtures": [{"id": "fx1", "profile": "Unknown", "universe": 0, "address": 1}]}
    patch_file.write_text(json.dumps(patch2), encoding="utf-8")
    with pytest.raises(ValueError):
        load_patch(patch_file, profiles)

