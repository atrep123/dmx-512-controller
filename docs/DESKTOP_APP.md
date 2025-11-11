# Desktop Application Guide

This guide captures the full workflow for building, packaging, and releasing the Tauri desktop shell that ships with the DMX controller.

---

## Overview

- The desktop shell bundles the existing Vite frontend (`npm run build`) and launches the packaged FastAPI backend (`dmx-backend.exe`) as a sidecar.
- The shell lives in `desktop/` (Tauri 2). Resources are copied into `desktop/src-tauri/resources`.
- Scripts are provided to:
  - Build the PyInstaller backend (`node scripts/build-server-exe.mjs`).
  - Sync the web bundle (`desktop/scripts/copy-dist.js`).
  - Produce release manifests for the updater (`desktop/scripts/create-release-json.mjs`).

---

## Quick commands

From the repo root:

```bash
# Build backend exe (PyInstaller) and sync into Tauri resources
npm run desktop:backend

# Dev preview (requires `npm run dev` running in another terminal)
npm run desktop:dev

# Production build (MSI + NSIS under desktop/src-tauri/target/release/bundle)
npm run desktop:build

# Build + generate updater manifest (dist/desktop/<channel>-release.json)
npm run desktop:release
```

> All commands automatically run `npm run build` to refresh the web bundle.

---

## Detailed flow

### 1. Build the web UI

```bash
npm install
npm run build
```

The output (`dist/`) is copied into the desktop resources by `desktop/scripts/copy-dist.js` (run automatically through the commands above).

### 2. Build the backend sidecar

```bash
node scripts/build-server-exe.mjs
# (alternatively on Windows: scripts\build-server-exe.bat)
```

- Installs backend requirements (PyInstaller included).
- Runs the PyInstaller spec (`server/desktop.spec`), producing `server/dist/dmx-backend.exe`.
- Copies the EXE into `desktop/src-tauri/resources/bin/dmx-backend.exe`.

### 3. Run the shell locally

```bash
npm run desktop:dev
```

- Ensures `dist/` is up to date (`npm run build`).
- Runs `npm run dev` inside `desktop/`, which:
  - Copies the bundle into `desktop/src-tauri/resources/app`.
  - Starts `tauri dev` (frontend points to `http://localhost:5173` – keep `npm run dev` running for hot reloads).
  - Spawns `dmx-backend.exe` as a sidecar and polls `http://127.0.0.1:8080/healthz`. The SPA listens to:
    - `desktop://backend/waiting`
    - `desktop://backend/ready`
    - `desktop://backend/error`

### 4. Build installers

```bash
npm run desktop:build
```

Outputs:

- `desktop/src-tauri/target/release/bundle/msi/*.msi`
- `desktop/src-tauri/target/release/bundle/nsis/*.exe`

Make sure `desktop/src-tauri/resources/bin/dmx-backend.exe` exists before running the build; otherwise the sidecar will be missing.

### 5. Create updater manifest (optional)

```bash
npm run desktop:release
# or manually
node desktop/scripts/create-release-json.mjs --channel beta --version 1.2.3
```

Requirements:

- Set signing key environment variables (`TAURI_SIGNING_PRIVATE_KEY` in base64 or `TAURI_SIGNING_PRIVATE_KEY_PATH`).
- Optional `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`.

The script signs the NSIS installer via `npx tauri signer` and writes `dist/desktop/<channel>-release.json`, which the desktop app consumes via `tauri.conf.json > plugins.updater.endpoints`.

---

## File layout

```
desktop/
 ├─ scripts/
 │   ├─ copy-dist.js          # Copies ../dist into resources/app
 │   └─ create-release-json.mjs
 ├─ src-tauri/
 │   ├─ resources/
 │   │   ├─ app/              # Copied web bundle
 │   │   ├─ bin/dmx-backend.exe
 │   │   ├─ license.rtf
 │   │   └─ splash.html
 │   ├─ src/main.rs           # Tauri app (spawns backend, tray, events)
 │   └─ tauri.conf.json
 └─ README.md                 # Desktop-specific instructions
```

---

## Common issues

| Symptom | Fix |
| ------- | --- |
| `dmx-backend.exe` missing | Run `npm run desktop:backend` (or scripts\build-server-exe.bat) to regenerate the PyInstaller bundle. |
| `copy-dist` warning about missing backend | Build the backend sidecar before running `npm run desktop:*`. |
| `tauri build` fails with signing errors | Provide `TAURI_SIGNING_PRIVATE_KEY_PATH` or `TAURI_SIGNING_PRIVATE_KEY` environment variables (see README). |
| Splash never closes | Backend health check failed – check logs from the `dmx-backend` sidecar; ensure FastAPI can bind to `127.0.0.1:8080`. |

For more context, see `desktop/README.md` and the main project README (section "Desktop distribuce").
