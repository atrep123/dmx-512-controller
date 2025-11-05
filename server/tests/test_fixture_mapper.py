from __future__ import annotations

import json
from pathlib import Path

from server.fixtures.profiles import load_profiles
from server.fixtures.patch import load_patch
from server.fixtures.mapper import resolve_attrs


def test_mapper_8bit_and_16bit(tmp_path: Path):
    # Profiles
    pdir = tmp_path / 'p' ; pdir.mkdir()
    rgb = {"id":"Generic.RGB.3ch","channels":[{"index":1,"attr":"r"},{"index":2,"attr":"g"},{"index":3,"attr":"b"}]}
    mh = {"id":"Generic.MH.PT16.RGB.7ch","channels":[
      {"index":1,"attr":"intensity","merge":"HTP"},
      {"index":2,"attr":"pan","resolution":"16bit","coarse_index":2,"fine_index":3},
      {"index":6,"attr":"r"},{"index":7,"attr":"g"},{"index":8,"attr":"b"}
    ]}
    (pdir/"rgb.json").write_text(json.dumps(rgb),encoding='utf-8')
    (pdir/"mh.json").write_text(json.dumps(mh),encoding='utf-8')
    profiles = load_profiles(pdir)
    # Patch
    patch = {"fixtures":[
      {"id":"fx1","profile":"Generic.RGB.3ch","universe":0,"address":1},
      {"id":"fx2","profile":"Generic.MH.PT16.RGB.7ch","universe":0,"address":10,"invert":{"pan": True}}
    ]}
    patch_file = tmp_path / 'patch.json'
    patch_file.write_text(json.dumps(patch), encoding='utf-8')
    inst = load_patch(patch_file, profiles)
    fx1 = inst['fx1'] ; fx2 = inst['fx2']
    # Map RGB
    items = resolve_attrs(fx1, {"r":128,"g":64,"b":32})
    # abs ch: 1,2,3
    assert {tuple(sorted((i['ch'],i['val']) for i in items))}
    # Map 16-bit pan with value16
    items2 = resolve_attrs(fx2, {"pan": {"value16": 32768}})
    # coarse fine are at address 10+ (2-> index) => 11 and 12
    chs = {i['ch'] for i in items2}
    assert 11 in chs and 12 in chs
