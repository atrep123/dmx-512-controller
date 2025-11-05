# Observabilita a PromQL tahak

Tento projekt exportuje metriky na `http://<server>:8080/metrics` (Prometheus text). Nize je prakticky tahak pro PromQL dotazy a volitelny Grafana dashboard.

Predpoklady:
- Prometheus scrapeuje endpoint `:8080/metrics`.
- V Grafane pouzivejte sablonovou promennou `$universe` (multiselect, All = `.*`).

## Prehled DMX prikazu

```
# Pocet prikazu / s podle protokolu
sum by (proto) (rate(dmx_core_cmds_total{type="dmx.patch"}[5m]))
```

## Ack & State latence (p95/p99)

```
# p95 ack latency (ms)
histogram_quantile(0.95, sum by (le) (rate(dmx_core_ack_latency_ms_bucket[5m])))

# p99 ack latency (ms)
histogram_quantile(0.99, sum by (le) (rate(dmx_core_ack_latency_ms_bucket[5m])))
```

## OLA  FPS, skippy, HTTP chyby

```
# OLA FPS (frames/s)
rate(dmx_core_ola_frames_total{universe=~"$universe"}[1m])

# Podil skipu (identical+rate) vuci odeslanym ramcum
sum(rate(dmx_core_ola_frames_skipped_total{universe=~"$universe"}[5m]))
/
(sum(rate(dmx_core_ola_frames_total{universe=~"$universe"}[5m])) + 1e-9)

# HTTP chyby do OLA (podle kodu)
sum by (code) (rate(dmx_core_ola_http_errors_total{universe=~"$universe"}[5m]))
```

## Fade  stav a vykonnost

```
# Aktivni kanaly ve fade (okamzita hodnota)
dmx_core_fade_active{universe=~"$universe"}

# Aktivni fade joby (okamzita hodnota)
dmx_core_fade_jobs_active{universe=~"$universe"}

# Starty fade kanalu / s
rate(dmx_core_fades_started_total{universe=~"$universe"}[5m])

# Dokoncene vs zrusene LTP (kanaly) / s
sum by (reason) (rate(dmx_core_fades_cancelled_total{universe=~"$universe"}[5m]))

# p95 doba zpracovani jednoho ticku (ms)
histogram_quantile(0.95, sum by (le) (rate(dmx_core_fade_tick_ms_bucket{universe=~"$universe"}[5m])))

# p95 "queue delay"  cekani kanalu od zarazeni do prvniho ticku (ms)
histogram_quantile(0.95, sum by (le) (rate(dmx_core_fade_queue_delay_ms_bucket{universe=~"$universe"}[5m])))
```

## Dedupe & engine

```
# Dedupe zasahy / s
rate(dmx_core_dedup_hits_total[5m])

# Hloubka fronty enginu (okamzita hodnota)
dmx_engine_queue_depth
```

## Doporucene panely v Grafane

- Stat/Gauge: `dmx_core_fade_active{...}`, `dmx_core_fade_jobs_active{...}`
- Time series (ms): p95 `dmx_core_ack_latency_ms`, p95 `dmx_core_fade_tick_ms`, p95 `dmx_core_fade_queue_delay_ms`
- Bar stacked: `dmx_core_fades_cancelled_total` podle `reason`
- Time series (/s): `dmx_core_ola_frames_total`, `dmx_core_cmds_total` per `proto`, `dmx_core_ola_frames_skipped_total` per `reason`

## Volitelne: hotovy Grafana dashboard

Importujte JSON z `docs/grafana/dashboard.json` a jako datasource vyberte Prometheus.

## Smoke (rychle overeni metrik)

```
# Fade 0200/600ms, po 200ms LTP na 10
curl -s -X POST :8080/command -H 'content-type: application/json' \
  -d '{"type":"dmx.fade","id":"F1","ts":0,"universe":0,"durationMs":600,"easing":"linear","patch":[{"ch":1,"val":200}]}'
sleep 0.2
curl -s -X POST :8080/command -H 'content-type: application/json' \
  -d '{"type":"dmx.patch","id":"P1","ts":0,"universe":0,"patch":[{"ch":1,"val":10}]}'

# Metriky (mely by rust started/done/ltp a ticks)
curl -s :8080/metrics | grep -E 'dmx_core_fade_(active|jobs_active|fades_(started|cancelled)_total|fade_queue_delay_ms_bucket|fade_tick_ms_bucket)'
```

## Release minichecklist

- Bump verze (napr. 1.3.0) v changelogu a relasu.
- CI zelene (FE/BE/WS/OLA/fades testy).
- Tag + GitHub Release; do README uved `OUTPUT_MODE=null|ola`, `FADES_ENABLED=true|false`.
- Do Deployment Guide pridej kapitolu Observability/Grafana a tento tahak.

