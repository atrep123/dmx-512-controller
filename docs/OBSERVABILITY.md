# Observabilita a PromQL tahák

Tento projekt exportuje metriky na `http://<server>:8080/metrics` (Prometheus text). Níže je praktický tahák pro PromQL dotazy a volitelný Grafana dashboard.

Předpoklady:
- Prometheus scrapeuje endpoint `:8080/metrics`.
- V Grafaně používejte šablonovou proměnnou `$universe` (multi‑select, All = `.*`).

## Přehled DMX příkazů

```
# Počet příkazů / s podle protokolu
sum by (proto) (rate(dmx_core_cmds_total{type="dmx.patch"}[5m]))
```

## Ack & State latence (p95/p99)

```
# p95 ack latency (ms)
histogram_quantile(0.95, sum by (le) (rate(dmx_core_ack_latency_ms_bucket[5m])))

# p99 ack latency (ms)
histogram_quantile(0.99, sum by (le) (rate(dmx_core_ack_latency_ms_bucket[5m])))
```

## OLA – FPS, skippy, HTTP chyby

```
# OLA FPS (frames/s)
rate(dmx_core_ola_frames_total{universe=~"$universe"}[1m])

# Podíl skipů (identical+rate) vůči odeslaným rámcům
sum(rate(dmx_core_ola_frames_skipped_total{universe=~"$universe"}[5m]))
/
(sum(rate(dmx_core_ola_frames_total{universe=~"$universe"}[5m])) + 1e-9)

# HTTP chyby do OLA (podle kódu)
sum by (code) (rate(dmx_core_ola_http_errors_total{universe=~"$universe"}[5m]))
```

## Fade – stav a výkonnost

```
# Aktivní kanály ve fade (okamžitá hodnota)
dmx_core_fade_active{universe=~"$universe"}

# Aktivní fade joby (okamžitá hodnota)
dmx_core_fade_jobs_active{universe=~"$universe"}

# Starty fade kanálů / s
rate(dmx_core_fades_started_total{universe=~"$universe"}[5m])

# Dokončené vs zrušené LTP (kanály) / s
sum by (reason) (rate(dmx_core_fades_cancelled_total{universe=~"$universe"}[5m]))

# p95 doba zpracování jednoho ticku (ms)
histogram_quantile(0.95, sum by (le) (rate(dmx_core_fade_tick_ms_bucket{universe=~"$universe"}[5m])))

# p95 "queue delay" – čekání kanálu od zařazení do prvního ticku (ms)
histogram_quantile(0.95, sum by (le) (rate(dmx_core_fade_queue_delay_ms_bucket{universe=~"$universe"}[5m])))
```

## Dedupe & engine

```
# Dedupe zásahy / s
rate(dmx_core_dedup_hits_total[5m])

# Hloubka fronty enginu (okamžitá hodnota)
dmx_engine_queue_depth
```

## Doporučené panely v Grafaně

- Stat/Gauge: `dmx_core_fade_active{...}`, `dmx_core_fade_jobs_active{...}`
- Time series (ms): p95 `dmx_core_ack_latency_ms`, p95 `dmx_core_fade_tick_ms`, p95 `dmx_core_fade_queue_delay_ms`
- Bar stacked: `dmx_core_fades_cancelled_total` podle `reason`
- Time series (/s): `dmx_core_ola_frames_total`, `dmx_core_cmds_total` per `proto`, `dmx_core_ola_frames_skipped_total` per `reason`

## Volitelně: hotový Grafana dashboard

Importujte JSON z `docs/grafana/dashboard.json` a jako data‑source vyberte Prometheus.

## Smoke (rychlé ověření metrik)

```
# Fade 0→200/600ms, po 200ms LTP na 10
curl -s -X POST :8080/command -H 'content-type: application/json' \
  -d '{"type":"dmx.fade","id":"F1","ts":0,"universe":0,"durationMs":600,"easing":"linear","patch":[{"ch":1,"val":200}]}'
sleep 0.2
curl -s -X POST :8080/command -H 'content-type: application/json' \
  -d '{"type":"dmx.patch","id":"P1","ts":0,"universe":0,"patch":[{"ch":1,"val":10}]}'

# Metriky (měly by růst started/done/ltp a ticks)
curl -s :8080/metrics | grep -E 'dmx_core_fade_(active|jobs_active|fades_(started|cancelled)_total|fade_queue_delay_ms_bucket|fade_tick_ms_bucket)'
```

## Release mini‑checklist

- Bump verze (např. 1.3.0) v changelogu a relasu.
- CI zelené (FE/BE/WS/OLA/fades testy).
- Tag + GitHub Release; do README uveď `OUTPUT_MODE=null|ola`, `FADES_ENABLED=true|false`.
- Do „Deployment Guide“ přidej kapitolu Observability/Grafana a tento tahák.

