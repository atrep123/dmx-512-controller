# API Overview

This project exposes a unified control plane used by REST, WebSocket, and MQTT.

- Command: `dmx.set | dmx.patch | scene.save | scene.recall | effect.apply | motor.move`
- Ack: `{ ack, accepted, ts, reason?, errors? }`
- State: REST snapshot (`/state`) and WS broadcast (`state.update`)

## REST

- GET `/state`  snapshot
- POST `/command`  ack

Example:

```
curl -s http://localhost:8080/state | jq

curl -s -X POST http://localhost:8080/command \
  -H 'content-type: application/json' \
  -d '{"type":"dmx.patch","id":"smk-1","ts":0,"universe":0,"patch":[{"ch":1,"val":10},{"ch":2,"val":20},{"ch":3,"val":30}]}'
```

Ack (accepted):

```
{ "ack":"smk-1", "accepted":true, "ts": 1730850000123 }
```

Ack (validation failed):

```
{ "ack":"bad-1", "accepted":false, "reason":"VALIDATION_FAILED",
  "errors":[{"path":"/patch/0/ch","msg":"out of range"}], "ts":1730850000123 }
```

### GET /state  ETag a volitelny sparse rezim

- Server pridava hlavicku `ETag: W/"rev-<rev>"`. Pokud klient posle `If-None-Match` se stejnou hodnotou, vraci `304 Not Modified`.
- Volitelny parametr `sparse=1` prida do odpovedi klice `universesSparse` (jen nenulove kanaly) a `sparse: true`. Vychozi `universes` zustava beze zmeny.

Priklad:

```
GET /state?sparse=1
{
  "ts": 1730850000123,
  "universes": { "0": { "1": 10, "2": 20, "3": 30, ... } },
  "universesSparse": { "0": { "1": 10, "2": 20, "3": 30 } },
  "sparse": true
}
```

## WebSocket

- URL: `/ws?token=...`
- ClientServer: `Command` JSON
- ServerClient: `Ack` and `state.update`

Example session:

```
> {"type":"dmx.patch","id":"ws-1","ts":0,"universe":0,"patch":[{"ch":1,"val":5}]}
< {"ack":"ws-1","accepted":true,"ts":1730850000456}
< {"type":"state.update","rev":42,"ts":1730850000456,
    "universe":0,"delta":[{"ch":1,"val":5}],"full":false}
```

Multiuniverse example:

```
POST /command
{"type":"dmx.patch","id":"u1","ts":0,"universe":1,
  "patch":[{"ch":1,"val":100},{"ch":2,"val":120}]}

WS broadcast:
{"type":"state.update","rev":42,"ts":...,"universe":1,
  "delta":[{"ch":1,"val":100},{"ch":2,"val":120}],"full":false}
```

Note on fades (if enabled): `dmx.patch` has LTP (lasttakesprecedence) priority per channel over running `dmx.fade` commands.

## MQTT

Topics (JSON payloads):

- `dmx/command`  Command
- `dmx/ack`  Ack
- `dmx/state`  StateUpdate

## Schemas

JSON Schemas live in `shared/schema/*.json` and mirror TypeScript types from `src/shared/types.ts`.

- `command.schema.json`
- `ack.schema.json`
- `state.schema.json` (REST snapshot)

A dedicated schema for WS `state.update` may be added in v1.2.

## Ack semantics and error codes

- Ack means the command was accepted into the processing queue (single-writer engine). Final state is confirmed via `state.update` or snapshot `/state`.
- Error codes are stable for automation/tests:
  - `VALIDATION_FAILED`  schema/semantic validation failed (range, empty patch, etc.)
  - `PATCH_TOO_LARGE`  canonicalized patch exceeds the server limit (default 64)
  - `RATE_LIMITED`  per-source rate exceeded (default 60 cmds/sec per proto/ip/universe)
  - `NOT_SUPPORTED`  command type not implemented by the server
  - `INTERNAL`  unexpected server error

## Dedupe window

The server deduplicates commands by ULID for 15 minutes (TTL). For legacy `{type:'set'}` it uses `cmdId`; for unified `Command` it uses `id`. Duplicate commands across paths (REST/WS) are ignored.

## Diagnostics

- GET `/universes/:u/frame`  JSON snapshot 512 hodnot pro universe `u` (pouze pokud je `OUTPUT_MODE=ola`).

### Fade metriky

Pokud je zapnute `FADES_ENABLED=true`, backend exportuje metriky planovace fade (perkanal):

- `dmx_core_fade_active{universe}`  aktivni kanaly (gauge)
- `dmx_core_fade_jobs_active{universe}`  aktivni fade joby (gauge)
- `dmx_core_fades_started_total{universe}`  starty (inkrement o pocet kanalu)
- `dmx_core_fades_cancelled_total{universe,reason="ltp|done"}`  zrusene/dokoncene kanaly
- `dmx_core_fade_ticks_total{universe}`  pocet zpracovanych ticku
- `dmx_core_fade_tick_ms_bucket{universe,le=...}`  histogram doby zpracovani ticku v ms
- `dmx_core_fade_queue_delay_ms_bucket{universe,le=...}`  histogram zpozdeni od zarazeni po prvni tick kanalu
