# Architecture

Hybridni model: PWA funguje offline, ale pro live DMX je backend zdroj pravdy (serverauthoritative). Klient ma lokalni cache a frontuje zmeny, ktere po pripojeni odesle se zachovanim idempotence.

## Rezimy

| Funkce              | Offline            | Online bez serveru | Online se serverem |
|---------------------|--------------------|--------------------|--------------------|
| Lokalni sceny       | [x] (cache)         | [x]                  | [x] + sync           |
| Live DMX            |  simulace        | X                  | [x] serverauthoritative |
| Motory              |  simulace        | X                  | [x]                  |
| Efekty              |  klient           | X                  | [x] backend preferovany |

Legenda: [x] plna podpora,  omezene/simulace, X nepodporovano

## Datove toky (zjednodusene)

```
UI akce  commands.enqueue()
     online: WS send(Command)
               Ack | StateUpdate
     offline: ulozit do IndexedDB (pending queue)

Server (single-writer engine):
  Command  apply(LWW)  publish StateUpdate (WS, MQTT, persistence)
```

Stavy pripojeni: `Idle  Connecting  Syncing  Online  Degraded  Offline`

Backpressure: engine ma frontu s limitem, klient coalescuje zmeny (rAF 1633 ms) a posila `dmx.patch` misto zaplavy jednotlivych `dmx.set`.

## Sjednocene schema (REST/WS/MQTT)

- `Command`: `dmx.set` | `dmx.patch` | `scene.save` | `scene.recall` | `effect.apply` | `motor.move`
- `Ack`: `{ ack, accepted, reason? }`
- `StateUpdate`: `{ ts, universes, motors?, effects? }`

Kanaly:
- WebSocket: clientserver `Command`, serverclient `Ack | StateUpdate`
- REST: `POST /command`  `Ack`, `GET /state`  `StateUpdate`
- MQTT: `dmx/command`, `dmx/state`, `dmx/ack` (stejna JSON payloady)

Sdilene typy (frontend): `src/shared/types.ts`
JSON Schema (kontrakt): `shared/schema/*.json`

## Frontend synchronizace

- `useKV` pro cache zustava, prida se `serverStore` (Zustand/Rx) napojeny na WS.
- Optimistic UI s revert na NACK.
- Coalescing slideru (rAF, 3060 fps), posilani `dmx.patch`.
- Sceny: `scene.save` ukladat lokalne i na server; `scene.recall` je serverova operace.

## Backend

- Single-writer engine (LWW), idempotence pres ULID.
- WS hub pro snapshoty, MQTT publish pro retained state.
- Validace payloadu proti JSON Schema (TODO: napojit na `shared/schema`).

### Unified WS State

Vedle legacy `{"type":"state"}` se publikuje i `{"type":"state.update"}` s rev (seq), timestampem a deltou pro universe 0 (kanaly 1..3). UI muze preferovat `state.update` a periodicky si vyzadat plny snapshot pres `GET /state`.

## Bezpecnost

- API key validovat na serveru (WS `?token=`, REST `x-api-key`).
- CORS a WS origin check, limitace prikazu, role (viewer/operator/admin)  v roadmape.

## Roadmap

- v1.1: sjednocene schema, WS klient, Scenes/Effects/LiveControl  server commands, CI + E2E.
- v1.2: fixture templaty, validace adres, import/export, efekty na backendu.
### OLA Output Pipeline

- Peruniverse frame store (512 kanalu) s mapovanim universeOLA universe (`config/patch.yaml`).
- Guard 44fps na universe a debounce identickych framu (stejny 512array neposilat).
- Failopen: chyby HTTP do OLA se jen loguji, engine/WS bezi dal.
- Zapnuti pres `OUTPUT_MODE=ola` (default `null`).
- Metriky:
  - `dmx_core_ola_frames_total{universe}`
  - `dmx_core_ola_frames_skipped_total{universe,reason="identical|rate"}`
  - `dmx_core_ola_last_fps{universe}`
  - `dmx_core_ola_http_errors_total{universe}` + `..._by_code{universe,code}`
  - `dmx_core_ola_queue_depth{universe}` (potlacene sendy behem rateguard okna)

Reliability:
- HTTP klient je `httpx.AsyncClient` s pool limity (48), timeout ~0.5 s, failopen.
- Pri shutdownu ASGI se pokusi o `maybe_send()` a uzavreni HTTP klienta (graceful close).

### sACN Input Pipeline

- Parser: minimalisticka E1.31 implementace (UDP) parsuje Root/Framing/DMP vrstvy, cte `universe`, `priority`, `seq`, `cid`, `source_name`, `dmx` (start code 0x00).
- Aggregator: peruniverse udrzuje zdroje `(cid)` s TTL; vybere nejvyssi `priority` a v ramci ni provede HTP (perkanal `max`).
- Vrstveni: DMX engine vrstvi `local_frame` a `sacn_frame` do `output_frame` jako perkanal `max(local, sacn)`; lokalni vrstva ma efektivne prioritu 255.
- TTL/HLKL: po vyprseni zdroje se kompozit prepocita a vystup se aktualizuje.
- Metriky:
  - `dmx_core_sacn_packets_total{universe}`  pocet paketu
  - `dmx_core_sacn_sources{universe}`  aktivni zdroje
  - `dmx_core_sacn_ooo_total{universe}`  outoforder zahozene
  - `dmx_core_sacn_priority_current{universe}`  aktualni vybrana priorita
### DMX Engine

- Kanonicky stav: mapovani `universe -> 512 bytearray`.
- `apply_patch(universe, items)` provede LWW v ramci patche a vrati `delta`, `rev`, `ts`.
- `/command` a WS `dmx.patch` volaji DMX engine; po aplikaci se vysila `state.update` s `full:false` pro dany universe.
- Pri pripojeni WS klienta jdou `state.update` s `full:true` pro vsechny dostupne universy.
- Legacy `/rgb` a WS `{type:'set'}` zustavaji  stav RGB je mirror universe 0 (ch1..3).

#### LTP behavior (jen pri `FADES_ENABLED=true`)

- Prichozi `dmx.patch` ma LTP prioritu nad bezicimi fades: dotcene kanaly jsou v planovaci fade okamzite zruseny a `patch` se aplikuje jako zdroj pravdy.
- Metriky (perkanal):
  - `dmx_core_fade_active{universe}`  pocet aktivnich kanalu ve fades (gauge)
  - `dmx_core_fade_jobs_active{universe}`  pocet aktivnich fade uloh (gauge)
  - `dmx_core_fades_started_total{universe}`  starty (inkrement o pocet kanalu v prikazu)
  - `dmx_core_fades_cancelled_total{universe,reason="ltp|done"}`  zrusene/dokoncene kanaly
  - `dmx_core_fade_tick_ms_bucket{universe,le=...}`  doba zpracovani ticku
  - `dmx_core_fade_queue_delay_ms_bucket{universe,le=...}`  zpozdeni od zarazeni po prvni tick kanalu
