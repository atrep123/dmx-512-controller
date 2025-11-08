# Desktop Wrapper – Implementation Plan

## 1. Goal

Provide a turnkey `.exe` distribution that bundles the DMX controller PWA + backend so end-users can install and run the system without touching Docker, Node or Python. Target platforms: Windows first, macOS/Linux later.

## 2. Selected stack

| Component   | Option                        | Notes |
|-------------|-------------------------------|-------|
| Shell       | **Tauri**                     | Lightweight WebView (Rust core), smaller installer than Electron, good Windows `.msi/.exe` support. |
| Frontend    | Existing `dist/` build        | Served as static assets within Tauri window. |
| Backend     | Python FastAPI packaged via **PyInstaller** | Produces self-contained `server.exe` with embedded Python runtime. Controlled via Tauri sidecar. |
| Installer   | `tauri-bundler` + optional NSIS | Generates signed `.msi/.exe`; can run scripts pre/post install. |

## 3. Architecture overview

```
┌────────────────────────────────┐
│ Tauri Shell (Rust)             │
│  - window displaying PWA       │
│  - sidecar process manager     │
│  - tray / status icon          │
└────────────┬───────────────────┘
             │ launches / monitors
┌────────────▼────────────┐
│ FastAPI backend (PyInstaller) │
│  - listens on 127.0.0.1:8080  │
│  - DMX drivers, MQTT, etc.    │
└──────────────────────────┘
```

## 4. Work packages

### A. PyInstaller packaging
1. ✅ `server/desktop.spec` (PyInstaller onefile) with entry script `server/run_desktop.py` and bundled schemas/config.
2. ✅ Build helper `scripts/build-server-exe.bat` → `server/dist/dmx-backend.exe`.
3. ✅ `docs/DESKTOP_INSTALL.md` documents the build/run process.
4. Tests: _TODO_ (CI job to exercise the executable).

### B. Tauri shell
1. ✅ `desktop/` workspace scaffolded with Tauri (Rust) + npm scripts.
2. ✅ Build pipeline links Vite `dist/` → Tauri resources via `npm run prepare:resources`.
3. ✅ Sidecar management: Tauri spawns `dmx-backend.exe`, streams logs to window events.
4. ✅ System tray (open/restart/quit) + splash window styling.

### C. Installer + first-run wizard
1. Use `tauri.conf.json > bundle` to generate `.msi/.exe`.
2. First launch wizard (React component inside PWA):
   - check DMX hardware (USB, IP)
   - select quick-start profile (e.g., “Club RGB Rig”, “Stage DMX”)
   - store config in `%APPDATA%\DMXController`.
3. Auto-update story: rely on Tauri updater (later milestone).

### D. Quality gates
1. End-to-end QA checklist (installation, DMX USB detection, firewall prompts).
2. CI job for Windows runner:
   - build PyInstaller exe
   - build Tauri bundle
   - attach artifacts to GitHub Release.
3. Documentation: `docs/DESKTOP_INSTALL.md` covering requirements, troubleshooting, signed binary info.

## 5. Open questions
- Driver signing for USB DMX (Enttec) on Windows? Might need instructions.
- Auto-update vs manual download (GitHub Releases?).
- Whether to keep Docker option in installer (for advanced users).
- macOS notarization & Apple Developer ID (future step).

## 6. Next steps
1. Create GitHub issue “Desktop Wrapper (.exe) – Windows MVP” referencing this plan.
2. Break into subtasks:
   - `#1 PyInstaller backend`
   - `#2 Tauri shell scaffold`
   - `#3 Sidecar + wizard`
   - `#4 Installer packaging`
3. Schedule QA session with DMX hardware to validate USB auto-detect.

## 7. Onboarding wizard status (desktop build)

- ✅ Frontend ships with `DesktopOnboarding` React flow (see `src/components/DesktopOnboarding.tsx`). It launches automatically inside the Tauri wrapper (detected via `window.__TAURI_INTERNALS__`) until completion is persisted under `localStorage.desktop.onboarding`.
- ✅ Wizard steps: Welcome → Licence + telemetry → DMX auto-detect (`GET /dmx/devices`) → DMX test shot (`POST /dmx/test`) → Update channel select → Finish summary.
- ✅ Desktop-only mode: when the wizard is visible the rest of the SPA is hidden so users must finish the checklist before controlling fixtures. Web/PWA users keep the regular landing page.
- 🔁 Follow-up: bind the selected update channel + telemetry opt-in to the Tauri updater config (currently stored locally only) and expose a Settings entry to relaunch the wizard if hardware changes.
