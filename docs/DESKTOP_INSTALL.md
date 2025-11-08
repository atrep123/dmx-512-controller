# Desktop Build & Installation

This guide explains how to build the standalone backend executable (`dmx-backend.exe`)
and how to run it on Windows as part of the desktop wrapper effort.

## 1. Prerequisites

| Requirement | Notes |
|-------------|-------|
| Windows 10/11 (x64) | Dev box for building / testing. |
| Python 3.12 + pip   | Same version we use for the server. |
| Visual C++ Build Tools | PyInstaller needs the MSVC runtime (already present on most dev boxes). |

Optional but recommended: create a virtual environment before installing build
dependencies.

```powershell
python -m venv .venv
.venv\Scripts\activate
```

## 2. Build the backend executable

1. Install dependencies and run PyInstaller:

   ```powershell
   scripts\build-server-exe.bat
   ```

   The script installs `server/requirements.txt` (which now contains PyInstaller),
   generates `server\dist\dmx-backend.exe`, **and copies it to**
   `desktop\src-tauri\resources\bin\dmx-backend.exe` so the Tauri sidecar can pick it up automatically.

2. Výstup je jediný soubor `server\dist\dmx-backend.exe`. PyInstaller onefile obsahuje všechny potřebné zdroje; při startu se rozbalí do `%TEMP%`.

## 3. Running the packaged backend

```powershell
server\dist\dmx-backend.exe --host 127.0.0.1 --port 8080
```

Environment variables (`DMX_HOST`, `DMX_PORT`, `DMX_*`) work the same way as in
the Docker/dev setup. The executable starts uvicorn with the embedded FastAPI
app, so the UI (Tauri/Electron) can talk to `http://127.0.0.1:8080`.

## 4. Troubleshooting

- **Missing DLLs / VC runtime** – install the “Microsoft Visual C++ Redistributable”
  or Visual Studio Build Tools.
- **Config/data files** – `config/patch.yaml` and JSON schemas are bundled automatically,
  but if you add new data files remember to update `server/desktop.spec`.
- **Antivirus false positives** – sign the executable before distributing or add the
  build directory to Defender exclusions during development.

## 5. Tauri desktop shell build

With the backend binary synced into `desktop/src-tauri/resources/bin/`, you can produce the Windows installers via:

```powershell
cd desktop
npm install
npm run build
```

`npm run build` performs:

1. `npm run prepare:resources` – copies the root Vite `dist/` bundle into `src-tauri/resources/app`.
2. `tauri build` – bundles the React UI, wires the PyInstaller sidecar (`resources/bin/dmx-backend.exe`), and emits
   `.msi` + `.exe` installers under `desktop\src-tauri\target\release\bundle\{msi,nsis}`.

### Auto-update and release channels

- `src-tauri/tauri.conf.json` enables the Tauri updater with the endpoint `https://updates.atmosfil.cz/desktop/release.json`.
- Replace the `REPLACE_WITH_TAURI_UPDATER_PUBLIC_KEY_BASE64` placeholder with your real updater public key (CI secret).
- The onboarding wizard asks users for their preferred channel (stable/beta). Persisted preferences will later inform the updater service which `release.json` to return.

## 6. Next steps

- Wire the updater channel + telemetry toggles from the wizard into the backend/Tauri settings file.
- Automate the backend + Tauri builds (including signing) in GitHub Actions on `windows-latest` with WiX + NSIS installed.
- Extend `docs/TROUBLESHOOTING.md` with desktop-specific advice (SmartScreen prompts, firewall rules, USB driver setup).
