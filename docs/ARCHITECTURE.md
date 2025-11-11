# Architecture

Hybridní model: PWA funguje offline, ale pro live DMX je backend zdroj pravdy (server‑authoritative). Klient má lokální cache a frontuje změny, které po připojení odešle se zachováním idempotence.

## Režimy

| Funkce              | Offline            | Online bez serveru | Online se serverem |
|---------------------|--------------------|--------------------|--------------------|
| Lokální scény       | ✅ (cache)         | ✅                  | ✅ + sync           |
| Live DMX            | ⚠️ simulace        | ❌                  | ✅ server‑authoritative |
| Motory              | ⚠️ simulace        | ❌                  | ✅                  |
| Efekty              | ⚠️ klient           | ❌                  | ✅ backend preferovaný |

Legenda: ✅ plná podpora, ⚠️ omezeně/simulace, ❌ nepodporováno

## Datové toky (zjednodušeně)

```
UI akce → commands.enqueue()
    ├─ online: WS send(Command)
    │          ← Ack | StateUpdate
    └─ offline: uložit do IndexedDB (pending queue)

Server (single-writer engine):
  Command → apply(LWW) → publish StateUpdate (WS, MQTT, persistence)
```

Stavy připojení: `Idle → Connecting → Syncing → Online → Degraded → Offline`

Backpressure: engine má frontu s limitem, klient coalescuje změny (rAF 16–33 ms) a posílá `dmx.patch` místo záplavy jednotlivých `dmx.set`.

## Sjednocené schéma (REST/WS/MQTT)

- `Command`: `dmx.set` | `dmx.patch` | `scene.save` | `scene.recall` | `effect.apply` | `motor.move`
- `Ack`: `{ ack, accepted, reason? }`
- `StateUpdate`: `{ ts, universes, motors?, effects? }`

Kanály:
- WebSocket: client→server `Command`, server→client `Ack | StateUpdate`
- REST: `POST /command` → `Ack`, `GET /state` → `StateUpdate`
- MQTT: `dmx/command`, `dmx/state`, `dmx/ack` (stejná JSON payloady)

Sdílené typy (frontend): `src/shared/types.ts`
JSON Schema (kontrakt): `shared/schema/*.json`

## Frontend synchronizace

- `useKV` pro cache zůstává, přidá se `serverStore` (Zustand/Rx) napojený na WS.
- Optimistic UI s revert na NACK.
- Coalescing sliderů (rAF, 30–60 fps), posílání `dmx.patch`.
- Scény: `scene.save` ukládat lokálně i na server; `scene.recall` je serverová operace.

## Backend

- Single-writer engine (LWW), idempotence přes ULID.
- WS hub pro snapshoty, MQTT publish pro retained state.
- Validace payloadů proti JSON Schema (TODO: napojit na `shared/schema`).

### Unified WS State

Vedle legacy `{"type":"state"}` se publikuje i `{"type":"state.update"}` s rev (seq), timestampem a deltou pro universe 0 (kanály 1..3). UI může preferovat `state.update` a periodicky si vyžádat plný snapshot přes `GET /state`.

## Bezpečnost

- API key validovat na serveru (WS `?token=`, REST `x-api-key`).
- CORS a WS origin check, limitace příkazů, role (viewer/operator/admin) – v roadmapě.

## Roadmap

- v1.1: sjednocené schéma, WS klient, Scenes/Effects/LiveControl → server commands, CI + E2E.
- v1.2: fixture templaty, validace adres, import/export, efekty na backendu.
### OLA Output Pipeline

- Per‑universe frame store (512 kanálů) s mapováním universe→OLA universe (`config/patch.yaml`).
- Guard 44 fps na universe a debounce identických framů (stejný 512‑array neposílat).
- Fail‑open: chyby HTTP do OLA se jen logují, engine/WS běží dál.
- Zapnutí přes `OUTPUT_MODE=ola` (default `null`).
- Metriky:
  - `dmx_core_ola_frames_total{universe}`
  - `dmx_core_ola_frames_skipped_total{universe,reason="identical|rate"}`
  - `dmx_core_ola_last_fps{universe}`
  - `dmx_core_ola_http_errors_total{universe}` + `..._by_code{universe,code}`
  - `dmx_core_ola_queue_depth{universe}` (potlačené sendy během rate‑guard okna)

Reliability:
- HTTP klient je `httpx.AsyncClient` s pool limity (4–8), timeout ~0.5 s, fail‑open.
- Při shutdownu ASGI se pokusí o `maybe_send()` a uzavření HTTP klienta (graceful close).

### sACN Input Pipeline

- Parser: minimalistická E1.31 implementace (UDP) parsuje Root/Framing/DMP vrstvy, čte `universe`, `priority`, `seq`, `cid`, `source_name`, `dmx` (start code 0x00).
- Aggregator: per‑universe udržuje zdroje `(cid)` s TTL; vybere nejvyšší `priority` a v rámci ní provede HTP (per‑kanál `max`).
- Vrstvení: DMX engine vrství `local_frame` a `sacn_frame` do `output_frame` jako per‑kanál `max(local, sacn)`; lokální vrstva má efektivně prioritu 255.
- TTL/HLKL: po vypršení zdroje se kompozit přepočítá a výstup se aktualizuje.
- Metriky:
  - `dmx_core_sacn_packets_total{universe}` – počet paketů
  - `dmx_core_sacn_sources{universe}` – aktivní zdroje
  - `dmx_core_sacn_ooo_total{universe}` – out‑of‑order zahozené
  - `dmx_core_sacn_priority_current{universe}` – aktuální vybraná priorita
### DMX Engine

- Kanonický stav: mapování `universe -> 512 bytearray`.
- `apply_patch(universe, items)` provede LWW v rámci patche a vrátí `delta`, `rev`, `ts`.
- `/command` a WS `dmx.patch` volají DMX engine; po aplikaci se vysílá `state.update` s `full:false` pro daný universe.
- Při připojení WS klienta jdou `state.update` s `full:true` pro všechny dostupné universy.
- Legacy `/rgb` a WS `{type:'set'}` zůstávají – stav RGB je mirror universe 0 (ch1..3).

#### LTP behavior (jen při `FADES_ENABLED=true`)

- Příchozí `dmx.patch` má LTP prioritu nad běžícími fades: dotčené kanály jsou v plánovači fade okamžitě zrušeny a `patch` se aplikuje jako zdroj pravdy.
- Metriky (per‑kanál):
  - `dmx_core_fade_active{universe}` – počet aktivních kanálů ve fades (gauge)
  - `dmx_core_fade_jobs_active{universe}` – počet aktivních fade úloh (gauge)
  - `dmx_core_fades_started_total{universe}` – starty (inkrement o počet kanálů v příkazu)
  - `dmx_core_fades_cancelled_total{universe,reason="ltp|done"}` – zrušené/dokončené kanály
  - `dmx_core_fade_tick_ms_bucket{universe,le=...}` – doba zpracování ticku
  - `dmx_core_fade_queue_delay_ms_bucket{universe,le=...}` – zpoždění od zařazení po první tick kanálu
