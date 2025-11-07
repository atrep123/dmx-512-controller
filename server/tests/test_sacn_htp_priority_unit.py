from __future__ import annotations

import time

from server.inputs.sacn_receiver import SACNReceiver, SACNSource


def test_htp_and_priority_merge(monkeypatch):
    class Ctx:
        class Core:
            pass
        core = Core()
        class Settings:
            sacn_source_timeout_ms = 3000
        settings = Settings()
        class DMX:
            def __init__(self):
                self.last = None
            def apply_sacn_composite(self, u, comp):
                self.last = (u, bytes(comp))
            def recompute_output(self, u):
                pass
        dmx = DMX()

    r = SACNReceiver(Ctx())
    u = 0
    cid_a = b"A" * 16
    cid_b = b"B" * 16
    now_ms = int(time.time() * 1000)
    r.sources[(u, cid_a)] = SACNSource(priority=100, last_seq=1, last_seen_ms=now_ms)
    r.sources[(u, cid_b)] = SACNSource(priority=100, last_seq=1, last_seen_ms=now_ms)
    # Set frames
    r.sources[(u, cid_a)].frame[0] = 10
    r.sources[(u, cid_b)].frame[0] = 20
    # priority equal -> HTP (20)
    comp = r._recompute_composite(u)
    assert comp[0] == 20
    # Change B to 5 -> composite becomes 10
    r.sources[(u, cid_b)].frame[0] = 5
    comp = r._recompute_composite(u)
    assert comp[0] == 10
    # Higher priority C sets 7 -> composite becomes 7
    cid_c = b"C" * 16
    r.sources[(u, cid_c)] = SACNSource(priority=120, last_seq=1, last_seen_ms=now_ms)
    r.sources[(u, cid_c)].frame[0] = 7
    comp = r._recompute_composite(u)
    assert comp[0] == 7
