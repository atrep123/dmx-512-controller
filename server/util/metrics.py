from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Tuple


@dataclass
class Histogram:
    buckets: Tuple[int, ...] = (1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500)
    counts: Dict[int, int] = field(default_factory=dict)
    sum: int = 0
    total: int = 0

    def observe(self, value_ms: int) -> None:
        self.sum += value_ms
        self.total += 1
        for b in self.buckets:
            if value_ms <= b:
                self.counts[b] = self.counts.get(b, 0) + 1
        # +Inf bucket
        self.counts[float('inf')] = self.counts.get(float('inf'), 0) + 1

    def lines(self, name: str, labels: Dict[str, str] | None = None) -> list[str]:
        base_labels = dict(labels or {})

        def fmt(extra: Dict[str, str] | None = None) -> str:
            merged = dict(base_labels)
            if extra:
                merged.update(extra)
            if not merged:
                return ""
            pairs = ",".join(f'{k}="{v}"' for k, v in merged.items())
            return f"{{{pairs}}}"

        out: list[str] = []
        for bucket in self.buckets:
            out.append(f"{name}_bucket{fmt({'le': str(bucket)})} {self.counts.get(bucket, 0)}")
        out.append(f"{name}_bucket{fmt({'le': '+Inf'})} {self.counts.get(float('inf'), 0)}")
        out.append(f"{name}_sum{fmt()} {self.sum}")
        out.append(f"{name}_count{fmt()} {self.total}")
        return out



@dataclass
class CoreMetrics:
    cmds_total: Dict[Tuple[str, str, bool], int] = field(default_factory=dict)
    ack_latency: Histogram = field(default_factory=Histogram)
    patch_size_last: int = 0
    # OLA metrics
    ola_frames_total: Dict[int, int] = field(default_factory=dict)
    ola_frames_skipped_identical: Dict[int, int] = field(default_factory=dict)
    ola_frames_skipped_rate: Dict[int, int] = field(default_factory=dict)
    ola_last_fps: Dict[int, float] = field(default_factory=dict)
    ola_http_errors_total: Dict[int, int] = field(default_factory=dict)
    ola_http_errors_by_code: Dict[Tuple[int, str], int] = field(default_factory=dict)
    ola_queue_depth: Dict[int, int] = field(default_factory=dict)
    # Fade metrics (per-universe)
    # active channels gauge
    fade_active: Dict[int, int] = field(default_factory=dict)
    # active jobs gauge
    fade_jobs_active: Dict[int, int] = field(default_factory=dict)
    # tick count and tick duration histogram
    fade_ticks_total: Dict[int, int] = field(default_factory=dict)
    fade_tick_ms_hist: Histogram = field(default_factory=Histogram)
    # queue delay histogram (per-universe)
    fade_queue_delay_ms: Dict[int, Histogram] = field(default_factory=dict)
    fades_started_total: Dict[int, int] = field(default_factory=dict)
    fades_cancelled_total: Dict[Tuple[int, str], int] = field(default_factory=dict)

    def set_fade_active(self, universe: int, n: int) -> None:
        self.fade_active[universe] = max(0, int(n))
    def set_fade_jobs_active(self, universe: int, n: int) -> None:
        self.fade_jobs_active[universe] = max(0, int(n))
    def inc_fade_tick(self, universe: int, ms: int) -> None:
        self.fade_ticks_total[universe] = self.fade_ticks_total.get(universe, 0) + 1
        self.fade_tick_ms_hist.observe(max(0, int(ms)))
    def inc_fades_started(self, universe: int, count: int = 1) -> None:
        self.fades_started_total[universe] = self.fades_started_total.get(universe, 0) + max(0, int(count))
    def inc_fades_cancelled(self, universe: int, reason: str, count: int = 1) -> None:
        key = (universe, reason)
        self.fades_cancelled_total[key] = self.fades_cancelled_total.get(key, 0) + max(0, int(count))
    def observe_queue_delay(self, universe: int, ms: int) -> None:
        h = self.fade_queue_delay_ms.get(universe)
        if h is None:
            h = Histogram()
            self.fade_queue_delay_ms[universe] = h
        h.observe(max(0, int(ms)))

    def inc_cmd(self, proto: str, typ: str, accepted: bool) -> None:
        key = (proto, typ, accepted)
        self.cmds_total[key] = self.cmds_total.get(key, 0) + 1

    def observe_ack(self, latency_ms: int) -> None:
        self.ack_latency.observe(max(0, int(latency_ms)))

    def set_patch_size(self, size: int) -> None:
        self.patch_size_last = max(0, int(size))

    # OLA metrics API used by OLAUniverseManager/UniverseFrame
    def ola_inc_total(self, universe: int) -> None:
        self.ola_frames_total[universe] = self.ola_frames_total.get(universe, 0) + 1

    def ola_inc_skipped_identical(self, universe: int) -> None:
        self.ola_frames_skipped_identical[universe] = self.ola_frames_skipped_identical.get(universe, 0) + 1

    def ola_inc_skipped_rate(self, universe: int) -> None:
        self.ola_frames_skipped_rate[universe] = self.ola_frames_skipped_rate.get(universe, 0) + 1

    def ola_set_fps(self, universe: int, fps: float) -> None:
        self.ola_last_fps[universe] = float(fps)
    def ola_inc_http_error(self, universe: int) -> None:
        self.ola_http_errors_total[universe] = self.ola_http_errors_total.get(universe, 0) + 1
    def ola_inc_http_error_code(self, universe: int, code: str) -> None:
        key = (universe, code)
        self.ola_http_errors_by_code[key] = self.ola_http_errors_by_code.get(key, 0) + 1
    def ola_set_queue_depth(self, universe: int, depth: int) -> None:
        self.ola_queue_depth[universe] = max(0, int(depth))

    def prometheus_lines(self) -> list[str]:
        lines: list[str] = []
        # Counters with labels
        lines.append("# HELP dmx_core_cmds_total Commands received (by proto/type/accepted)")
        lines.append("# TYPE dmx_core_cmds_total counter")
        for (proto, typ, accepted), val in self.cmds_total.items():
            labels = f'{{proto="{proto}",type="{typ}",accepted="{str(accepted).lower()}"}}'
            lines.append(f"dmx_core_cmds_total{labels} {val}")
        # Histogram
        lines.append("# HELP dmx_core_ack_latency_ms Ack latency histogram in ms")
        lines.append("# TYPE dmx_core_ack_latency_ms histogram")
        lines.extend(self.ack_latency.lines("dmx_core_ack_latency_ms"))
        # Gauge
        lines.append("# HELP dmx_core_patch_size Last processed patch size")
        lines.append("# TYPE dmx_core_patch_size gauge")
        lines.append(f"dmx_core_patch_size {self.patch_size_last}")
        # OLA counters and gauges
        lines.append("# HELP dmx_core_ola_frames_total OLA frames sent per universe")
        lines.append("# TYPE dmx_core_ola_frames_total counter")
        for u, val in self.ola_frames_total.items():
            lines.append(f"dmx_core_ola_frames_total{{universe=\"{u}\"}} {val}")
        lines.append("# HELP dmx_core_ola_frames_skipped_total OLA frames skipped per reason")
        lines.append("# TYPE dmx_core_ola_frames_skipped_total counter")
        for u, val in self.ola_frames_skipped_identical.items():
            lines.append(f"dmx_core_ola_frames_skipped_total{{universe=\"{u}\",reason=\"identical\"}} {val}")
        for u, val in self.ola_frames_skipped_rate.items():
            lines.append(f"dmx_core_ola_frames_skipped_total{{universe=\"{u}\",reason=\"rate\"}} {val}")
        lines.append("# HELP dmx_core_ola_last_fps Last observed OLA FPS per universe")
        lines.append("# TYPE dmx_core_ola_last_fps gauge")
        for u, val in self.ola_last_fps.items():
            lines.append(f"dmx_core_ola_last_fps{{universe=\"{u}\"}} {val}")
        lines.append("# HELP dmx_core_ola_http_errors_total OLA HTTP errors per universe")
        lines.append("# TYPE dmx_core_ola_http_errors_total counter")
        for u, val in self.ola_http_errors_total.items():
            lines.append(f"dmx_core_ola_http_errors_total{{universe=\"{u}\"}} {val}")
        lines.append("# HELP dmx_core_ola_http_errors_total_by_code OLA HTTP errors per universe and code")
        lines.append("# TYPE dmx_core_ola_http_errors_total_by_code counter")
        for (u, code), val in self.ola_http_errors_by_code.items():
            lines.append(f"dmx_core_ola_http_errors_total_by_code{{universe=\"{u}\",code=\"{code}\"}} {val}")
        lines.append("# HELP dmx_core_ola_queue_depth OLA suppressed sends due to rate guard (current window)")
        lines.append("# TYPE dmx_core_ola_queue_depth gauge")
        for u, val in self.ola_queue_depth.items():
            lines.append(f"dmx_core_ola_queue_depth{{universe=\"{u}\"}} {val}")
        # Fade metrics
        lines.append("# HELP dmx_core_fade_active Active fades per universe")
        lines.append("# TYPE dmx_core_fade_active gauge")
        for u, val in self.fade_active.items():
            lines.append(f"dmx_core_fade_active{{universe=\"{u}\"}} {val}")
        lines.append("# HELP dmx_core_fade_jobs_active Active fade jobs per universe")
        lines.append("# TYPE dmx_core_fade_jobs_active gauge")
        for u, val in self.fade_jobs_active.items():
            lines.append(f"dmx_core_fade_jobs_active{{universe=\"{u}\"}} {val}")
        lines.append("# HELP dmx_core_fade_ticks_total Fade engine ticks per universe")
        lines.append("# TYPE dmx_core_fade_ticks_total counter")
        for u, val in self.fade_ticks_total.items():
            lines.append(f"dmx_core_fade_ticks_total{{universe=\"{u}\"}} {val}")
        lines.append("# HELP dmx_core_fade_tick_ms Fade tick duration histogram (ms)")
        lines.append("# TYPE dmx_core_fade_tick_ms histogram")
        lines.extend(self.fade_tick_ms_hist.lines("dmx_core_fade_tick_ms"))
        lines.append("# HELP dmx_core_fade_queue_delay_ms Fade queue delay histogram per universe (ms)")
        lines.append("# TYPE dmx_core_fade_queue_delay_ms histogram")
        for u, hist in self.fade_queue_delay_ms.items():
            lines.extend(hist.lines("dmx_core_fade_queue_delay_ms", labels={"universe": str(u)}))
        lines.append("# HELP dmx_core_fades_started_total Fades started")
        lines.append("# TYPE dmx_core_fades_started_total counter")
        for u, val in self.fades_started_total.items():
            lines.append(f"dmx_core_fades_started_total{{universe=\"{u}\"}} {val}")
        lines.append("# HELP dmx_core_fades_cancelled_total Fades cancelled")
        lines.append("# TYPE dmx_core_fades_cancelled_total counter")
        for (u, reason), val in self.fades_cancelled_total.items():
            lines.append(f"dmx_core_fades_cancelled_total{{universe=\"{u}\",reason=\"{reason}\"}} {val}")
        # sACN metrics
        lines.append("# HELP dmx_core_sacn_packets_total sACN packets received per universe")
        lines.append("# TYPE dmx_core_sacn_packets_total counter")
        for u, val in getattr(self, "sacn_packets_total", {}).items():
            lines.append(f"dmx_core_sacn_packets_total{{universe=\"{u}\"}} {val}")
        lines.append("# HELP dmx_core_sacn_sources Active sACN sources per universe")
        lines.append("# TYPE dmx_core_sacn_sources gauge")
        for u, val in getattr(self, "sacn_sources", {}).items():
            lines.append(f"dmx_core_sacn_sources{{universe=\"{u}\"}} {val}")
        lines.append("# HELP dmx_core_sacn_ooo_total Out-of-order sACN packets dropped per universe")
        lines.append("# TYPE dmx_core_sacn_ooo_total counter")
        for u, val in getattr(self, "sacn_ooo_total", {}).items():
            lines.append(f"dmx_core_sacn_ooo_total{{universe=\"{u}\"}} {val}")
        lines.append("# HELP dmx_core_sacn_priority_current Current sACN selected priority per universe")
        lines.append("# TYPE dmx_core_sacn_priority_current gauge")
        for u, val in getattr(self, "sacn_priority_current", {}).items():
            lines.append(f"dmx_core_sacn_priority_current{{universe=\"{u}\"}} {val}")
        # Fixtures metrics
        lines.append("# HELP dmx_core_fixture_apply_total Fixture set requests (ok/error) by reason")
        lines.append("# TYPE dmx_core_fixture_apply_total counter")
        for (result, reason), val in getattr(self, "fixture_apply_total", {}).items():
            lines.append(f"dmx_core_fixture_apply_total{{result=\"{result}\",reason=\"{reason}\"}} {val}")
        lines.append("# HELP dmx_core_fixture_attrs_total Fixture attribute applications")
        lines.append("# TYPE dmx_core_fixture_attrs_total counter")
        for attr, val in getattr(self, "fixture_attrs_total", {}).items():
            lines.append(f"dmx_core_fixture_attrs_total{{attr=\"{attr}\"}} {val}")
        lines.append("# HELP dmx_core_fixture_reload_total Fixture reload results")
        lines.append("# TYPE dmx_core_fixture_reload_total counter")
        for result, val in getattr(self, "fixture_reload_total", {}).items():
            lines.append(f"dmx_core_fixture_reload_total{{result=\"{result}\"}} {val}")
        lines.append("# HELP dmx_core_fixture_overlaps_total Fixture patch overlaps detected")
        lines.append("# TYPE dmx_core_fixture_overlaps_total counter")
        lines.append(f"dmx_core_fixture_overlaps_total {getattr(self, 'fixture_overlaps_total', 0)}")
        return lines


__all__ = ["CoreMetrics"]
