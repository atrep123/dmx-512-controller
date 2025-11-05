from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Dict, Tuple


@dataclass
class RateLimiter:
    limit_per_sec: int = 60
    _buckets: Dict[Tuple[str, str, int], Tuple[int, int]] = field(default_factory=dict)

    def allow(self, proto: str, ip: str, universe: int) -> bool:
        now = int(time.time())
        key = (proto, ip, universe)
        window, count = self._buckets.get(key, (now, 0))
        if window != now:
            window, count = now, 0
        if count >= self.limit_per_sec:
            self._buckets[key] = (window, count)
            return False
        self._buckets[key] = (window, count + 1)
        return True

__all__ = ["RateLimiter"]

