# DMX Demo Server

This service provides the authoritative RGB state for the DMX demo.  It fan-outs updates between
ESP devices over MQTT, the PWA over WebSocket, and exposes a REST control plane.  The service is
built for deterministic demos: no fancy hacks, just reliable state management with clear
operational guardrails.

## Quick start

1. Build and start the broker and server:

   ```bash
   cd infra
   docker-compose up --build
   ```

   * MQTT broker: `mqtt://localhost:1883`
   * REST + WS server: `http://localhost:8080`

2. Test the API:

   ```bash
   curl http://localhost:8080/rgb
   curl -X POST http://localhost:8080/rgb \
     -H 'content-type: application/json' \
     -d '{"cmdId":"01HZX3YJ9YJ3M5QAZ3GZ8K3QFF","src":"ui","r":64,"g":32,"b":128}'
   ```

3. WebSocket UI clients connect to `ws://localhost:8080/ws` and immediately receive the retained
   state.

4. ESP devices publish commands to `v1/demo/rgb/cmd` (QoS 1, non-retained) and subscribe to
   `v1/demo/rgb/state` (QoS 1, retained).

## Configuration

Environment variables are prefixed with `DMX_`.  A starter file lives in `infra/.env.example`.

| Variable | Default | Description |
| --- | --- | --- |
| `DMX_MQTT_HOST` | `localhost` | MQTT broker host |
| `DMX_MQTT_PORT` | `1883` | MQTT port |
| `DMX_QUEUE_SIZE` | `10000` | Max buffered mutation commands |
| `DMX_CMD_DEDUPE_TTL_SECONDS` | `900` | TTL for command dedupe cache |
| `DMX_CMD_DEDUPE_CAPACITY` | `4096` | Max cached command IDs |
| `DMX_ALLOW_ORIGINS` | `*` | CORS/WebSocket allowed origins (comma separated) |
| `DMX_OLA_ENABLED` | `false` | Enable OLA DMX output |
| `DMX_OLA_URL` | `http://localhost:9090/set_dmx` | OLA HTTP endpoint |
| `DMX_OLA_UNIVERSE` | `1` | DMX universe |
| `DMX_OLA_FPS` | `44` | Max frame rate for OLA |
| `DMX_USB_ENABLED` | `false` | Enable Enttec DMX USB PRO output |
| `DMX_USB_PORT` | _auto_ | Serial port for Enttec device (e.g. `/dev/ttyUSB0`, `COM5`) |
| `DMX_USB_VENDOR_IDS` | `0x0403` | CSV of vendor IDs used for auto-detect |
| `DMX_USB_PRODUCT_IDS` | `0x6001,0x6010,0x0400` | CSV of product IDs used for auto-detect |
| `DMX_USB_BAUDRATE` | `57600` | Serial baudrate |
| `DMX_USB_FPS` | `40` | Max frames per second sent to the USB interface |
| `DMX_USB_SCAN_INTERVAL` | `5` | Auto-detect polling interval (seconds) |
| `DMX_INPUT_ENABLED` | `false` | Enable SparkFun DMX serial input |
| `DMX_INPUT_PORT` | _unset_ | Serial port name for DMX input |
| `DMX_INPUT_BAUDRATE` | `115200` | DMX input baudrate |
| `DMX_INPUT_CHANNELS` | `3` | Number of channels mapped (1→R, 2→G, 3→B) |
| `DMX_INPUT_UNIVERSE` | `0` | Universe index for DMX input |
| `DMX_INPUT_SRC` | `dmx-input` | Source label for DMX input commands |
| `DMX_PROJECTS_ENABLED` | `false` | Enable multi-project mode |
| `DMX_PROJECTS_ROOT` | `data/projects` | Root directory for project data |
| `DMX_CLOUD_BACKUP_ENABLED` | `false` | Enable project backup client |
| `DMX_CLOUD_BACKUP_PROVIDER` | `local` | Backup provider (`local` or `s3`) |
| `DMX_CLOUD_BACKUP_LOCAL_PATH` | `data/backups` | Directory for local backups |
| `DMX_CLOUD_BACKUP_ENCRYPTION_KEY` | _unset_ | Optional Fernet key for encrypted backups |
| `DMX_CLOUD_BACKUP_AUTO_INTERVAL` | `0` | Auto-backup interval in minutes (0 disables) |
| `DMX_CLOUD_BACKUP_S3_BUCKET` | _unset_ | S3 bucket for backups |
| `DMX_CLOUD_BACKUP_S3_PREFIX` | `dmx-controller/backups` | S3 key prefix |
| `DMX_CLOUD_BACKUP_S3_REGION` | _unset_ | AWS region |
| `DMX_CLOUD_BACKUP_S3_ACCESS_KEY` | _unset_ | AWS access key |
| `DMX_CLOUD_BACKUP_S3_SECRET_KEY` | _unset_ | AWS secret key |
| `DMX_CLOUD_BACKUP_S3_SESSION_TOKEN` | _unset_ | AWS session token (optional) |

Persistent files land in `server/data/` inside the container: last known state and dedupe cache.
Mount `server_state` volume if you need durability between runs.

## Topology

```
        +--------------------+
        |  PWA / WebSocket   |
        +---------+----------+
                  |
                  | ws://localhost:8080/ws
                  v
+---------+  REST / WS  +-------------------+
|  ESP    |<------------|   DMX Demo Server |
| sender  |  MQTT cmd   |   (single writer) |
+----+----+------------->|                   |
     ^                    +-----+-----+------+
     |                          |     |
     | MQTT state               |     | optional
     | (retained)               |     | OLA DMX
+----+----+                     |     v
|  ESP    |<--------------------+  OLA Gateway
| receiver|  MQTT state
+---------+
```

## API

* **REST**
  * `GET /rgb` → canonical state (`demo.rgb.state.v1`)
  * `POST /rgb` → accepts command payloads (schema is defaulted)
* **WebSocket** `ws://<host>/ws`
  * Client → `{ "type": "set", "cmdId": "ULID", "src": "ui", "r": 0, "g": 0, "b": 0 }`
  * Server → `{ "type": "state", "r": 0, "g": 0, "b": 0, "seq": 1, "ts": 123456 }`
* **MQTT topics**
  * `v1/demo/rgb/cmd` – incoming commands, QoS 1, non-retained
  * `v1/demo/rgb/state` – retained canonical state, QoS 1
  * `v1/devices/<id>/state` – device LWT online/offline (server publishes its own LWT)

PWA klient přidává `?token=<VITE_API_KEY>` do WebSocket URL a k REST požadavkům přikládá hlavičku `x-api-key`. Backend v1.1.0 token nevaliduje, ale hodnotu logujeme pro audit a budoucí rozšíření autentizace.

All command payloads must contain a ULID `cmdId`.  Duplicates within 15 minutes are ignored.
JSON Schemas for the command and state payloads live in `server/schemas/`.

## Internals

### Single-writer engine

* Only the engine task mutates state.  Producers push commands into an `asyncio.Queue`.
* When the queue is full the oldest UI drag event is dropped to preserve infrastructure traffic.
* Idempotence is enforced by a persistent TTL+LRU dedupe cache.
* Each accepted command increments `seq`, clamps RGB values to `[0, 255]`, updates `ts` with the
  server clock, and publishes to MQTT + WebSocket + persistence.

### MQTT

* `asyncio-mqtt` drives both inbound subscriptions and retained publishing.
* Clean sessions are disabled so reconnects resume subscriptions immediately.
* The publisher sets a retained LWT on `v1/devices/server/state`.
* The service republishes the latest state at startup for instant bootstrap.

### WebSocket hub

* Broadcasts are fan-out via `asyncio.create_task`; slow clients are dropped after 200 ms.
* Each new connection receives the current state immediately before entering the receive loop.

### Optional OLA driver

* Disabled by default.
* When enabled, RGB values map to channels 1–3 of the configured universe.
* Rate limited to 44 fps with duplicate frame suppression.  Fail-open (logs only).

### USB DMX (Enttec DMX USB PRO)

* Enable with `OUTPUT_MODE=enttec` (or `DMX_USB_ENABLED=true`).  The server tries to auto-detect an
  Enttec-compatible interface unless `DMX_USB_PORT` is set explicitly.
* Auto-detection watches VID/PID (defaults to FTDI 0x0403 / 0x6001, 0x6010, 0x0400) and exposes the
  current snapshot via `GET /usb/devices`.
* Health & control endpoints:
  * `POST /usb/refresh` – re-scan USB devices without restarting the service.
  * `POST /usb/reconnect` – close the active driver and reopen with the latest detected port.
* Driver is rate-limited (`DMX_USB_FPS`, default 40 fps) and reconnects automatically if writes fail.

### SparkFun DMX Input (Serial)

* Enable with `DMX_INPUT_ENABLED=true` and point `DMX_INPUT_PORT` to the serial device exposed by a
  SparkFun DMX shield (e.g. `COM5`, `/dev/ttyUSB0`). Default baudrate is 115200 (configurable via
  `DMX_INPUT_BAUDRATE`).
* Expected firmware: SparkFun Arduino example printing lines such as
  `DMX: read value from channel 1: 123`. The driver parses these logs, tracks the first three
  channels, and submits RGB commands to the engine with source `DMX_INPUT_SRC` (default `dmx-input`).
* Works great when the shield is connected directly to the server over USB (no ESP/Wi-Fi needed).

### Projects & Cloud Backups

* Turn on `DMX_PROJECTS_ENABLED=true` to keep multiple independent shows. The active project controls which
  `state.json`, `scenes.json`, `show.json` and dedupe cache are mounted.
* Manage projects via REST:
  * `GET /projects` – list all projects + active ID.
  * `POST /projects` – create new project (optionally cloning current data using `templateId`).
  * `PUT /projects/{id}` – update metadata (name, venue, date, notes).
  * `POST /projects/{id}/select` – persist selection and rebroadcast the new state.
* Backups:
  * Enable `DMX_CLOUD_BACKUP_ENABLED=true` and choose a provider (`local` directory or `s3` bucket).
  * `POST /projects/{id}/backups` creates a snapshot (state + scenes + show snapshot). `GET` lists versions.
  * `POST /projects/{id}/restore` downloads the snapshot, rewrites project files and replaces engine state.
  * Optional encryption via `DMX_CLOUD_BACKUP_ENCRYPTION_KEY` (Fernet key). Auto-backup interval configured by `DMX_CLOUD_BACKUP_AUTO_INTERVAL`.
* Frontend Data Management panel surfaces project selector, metadata fields, backup log and restore actions.

## Observability & Operations

* **SLOs**
  * 99.9% of `apply()` executions < 100 ms
  * 99% of WebSocket broadcasts < 50 ms
* **Health**
  * `/healthz` – liveness (process + event loop)
  * `/readyz` – readiness (MQTT connected and queue drained)
* **Metrics** – Prometheus text at `/metrics`
  * `dmx_engine_processed_total`, `dmx_engine_deduped_total`
  * `dmx_engine_queue_depth`, `dmx_engine_last_latency_ms`
  * `dmx_ws_clients`, `dmx_mqtt_connected`
* **Logging** – JSON to stdout with `seq`, `cmdId`, `src`, and latency hints.

## Testing

All tests live under `server/tests/`.

```bash
pip install -r server/requirements.txt
pytest server/tests -k "not mqtt"  # skip MQTT integration if broker unavailable
```

* `test_engine.py` – unit + property tests for the single-writer engine.
* `test_api.py` – REST + WebSocket behaviour using ASGI test clients.
* `test_mqtt.py` – requires a Mosquitto broker on `localhost:1883`; publishes a command and asserts
  retained state is updated.

## Runbook

| Symptom | Checks | Resolution |
| --- | --- | --- |
| WS client never receives updates | Inspect `/readyz` (queue depth + MQTT status).  Review logs for `mqtt_reconnect` warnings. | Restart broker or server.  If queue is large, ensure UI clients are not flooding commands. |
| ESP ignores commands after restart | Verify retained state on `v1/demo/rgb/state` (use `mosquitto_sub -R`).  Confirm server bootstrap logged `publish_state`. | If retained message missing, ensure broker persistence volume mounted and server started after broker. |
| Rapid colour flicker | Confirm dedupe TTL (default 15 min) and ensure unique ULIDs per command.  Check if queue dropping UI drag events—slow down UI emission. |
| OLA output silent | Ensure `DMX_OLA_ENABLED=true` and endpoint reachable.  Logs with `ws_error`/`ola` indicate connectivity issues.  Service fails open, so state updates continue even when OLA is offline. |
| Demo feedback loop | Verify clients send only commands (never state).  The server never accepts state from clients and rebroadcasts canonical state only. |

For production hardening turn off anonymous MQTT access, configure ACL/TLS, restrict CORS origins,
and require REST authentication.  The engine already supports credentialed MQTT via
`DMX_MQTT_USERNAME`/`DMX_MQTT_PASSWORD`.
