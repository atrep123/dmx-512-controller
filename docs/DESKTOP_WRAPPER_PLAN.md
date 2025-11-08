# Desktop Wrapper â€“ Implementation Plan

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
â”Śâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Tauri Shell (Rust)             â”‚
â”‚  - window displaying PWA       â”‚
â”‚  - sidecar process manager     â”‚
â”‚  - tray / status icon          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
             â”‚ launches / monitors
â”Śâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–Ľâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ FastAPI backend (PyInstaller) â”‚
â”‚  - listens on 127.0.0.1:8080  â”‚
â”‚  - DMX drivers, MQTT, etc.    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
```

## 4. Work packages

### A. PyInstaller packaging
1. âś… `server/desktop.spec` (PyInstaller onefile) with entry script `server/run_desktop.py` and bundled schemas/config.
2. âś… Build helper `scripts/build-server-exe.bat` â†’ `server/dist/dmx-backend.exe`.
3. âś… `docs/DESKTOP_INSTALL.md` documents the build/run process.
4. Tests: _TODO_ (CI job to exercise the executable).

### B. Tauri shell
1. âś… `desktop/` workspace scaffolded with Tauri (Rust) + npm scripts.
2. âś… Build pipeline links Vite `dist/` â†’ Tauri resources via `npm run prepare:resources`.
3. âś… Sidecar management: Tauri spawns `dmx-backend.exe`, streams logs to window events.
4. âś… System tray (open/restart/quit) + splash window styling.

### C. Installer + first-run wizard
1. Use `tauri.conf.json > bundle` to generate `.msi/.exe`.
2. First launch wizard (React component inside PWA):
   - check DMX hardware (USB, IP)
   - select quick-start profile (e.g., â€śClub RGB Rigâ€ť, â€śStage DMXâ€ť)
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
1. Create GitHub issue â€śDesktop Wrapper (.exe) â€“ Windows MVPâ€ť referencing this plan.
2. Break into subtasks:
   - `#1 PyInstaller backend`
   - `#2 Tauri shell scaffold`
   - `#3 Sidecar + wizard`
   - `#4 Installer packaging`
3. Schedule QA session with DMX hardware to validate USB auto-detect.

## 7. Onboarding wizard status (desktop build)

- Frontend ships with DesktopOnboarding React flow (see src/components/DesktopOnboarding.tsx). It launches automatically inside the Tauri wrapper (detected via window.__TAURI_INTERNALS__) until completion is persisted under localStorage.desktop.onboarding.
- Wizard steps: Welcome -> Licence + telemetry -> DMX auto-detect (GET /dmx/devices) -> DMX test shot (POST /dmx/test) -> Update channel select -> Finish summary.
- Desktop-only mode: when the wizard is visible the rest of the SPA is hidden so users must finish the checklist before controlling fixtures. Web/PWA users keep the regular landing page.
- Preferences persist via /desktop/preferences; onboarding lze znovu spustit ze sekce Nastavení (karta "Desktop onboarding") nebo z Tauri tray menu (*Run Onboarding*). Dalším krokem je napojení volby kanálu/telemetrie na updater feed a CI release proces.
