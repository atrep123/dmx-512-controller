# Desktop Wrapper – Implementation Plan

## 1. Goal

Provide a turnkey `.exe` distribution that bundles the DMX controller PWA + backend so end-users can install and run the system without touching Docker, Node or Python. Target platforms: Windows first, macOS/Linux later.

## 2. Selected stack

| Component   | Option                        | Notes |
|-------------|-------------------------------|-------|
| Shell       | **Tauri 2.x**                     | Lightweight WebView (Rust core), smaller installer than Electron, good Windows `.msi/.exe` support. |
| Frontend    | Existing `dist/` build        | Served as static assets within Tauri window. |
| Backend     | Python FastAPI packaged via **PyInstaller** | Produces self-contained `server.exe` with embedded Python runtime. Controlled via Tauri sidecar. |
| Installer   | `tauri-bundler` + optional NSIS | Generates signed `.msi/.exe`; can run scripts pre/post install. |

## 3. Architecture overview

```
+------------------------------+
| Tauri Shell (Rust)           |
| - window displaying the PWA  |
| - sidecar process manager    |
| - tray / status icon         |
+------------------------------+
             |
   launches & monitors
             v
+------------------------------+
| FastAPI backend (PyInstaller)|
| - listens on 127.0.0.1:8080  |
| - DMX drivers, MQTT, etc.    |
+------------------------------+
```

## 4. Work packages

### A. PyInstaller packaging
1. Define `server/desktop.spec` (PyInstaller onefile) with entry script `server/run_desktop.py` and bundled schemas/config.
2. Build helper `scripts/build-server-exe.bat` that produces `server/dist/dmx-backend.exe`.
3. Document the build/run process in `docs/DESKTOP_INSTALL.md`.
4. Tests: _TODO_ (CI job to exercise the executable).

### B. Tauri shell
1. Scaffold the `desktop/` workspace with Tauri (Rust) + npm scripts.
2. Link the Vite `dist/` output into Tauri resources via `npm run prepare:resources`.
3. Implement sidecar management so Tauri spawns `dmx-backend.exe` and streams logs to window events.
4. Add a system tray (open/restart/quit) and splash window styling.

### C. Installer + first-run wizard
1. Use the `tauri.conf.json` bundle section to generate `.msi/.exe` installers.
2. First launch wizard (React component inside the PWA):
   - check DMX hardware (USB, IP)
   - select a quick-start profile (e.g., "Club RGB Rig", "Stage DMX")
   - store config in `%APPDATA%/DMXController`.
3. Auto-update feed & signing:
   - Generate Tauri signing keys (`npx tauri signer generate`) and place the public key in `tauri.conf.json`.
   - After each desktop build run `node desktop/scripts/create-release-json.mjs --channel <name> --version <semver>` with `TAURI_SIGNING_PRIVATE_KEY(_PATH)` so the script can invoke `tauri signer sign` internally.
   - Publish installers and the matching `dist/desktop/<channel>-release.json`; the backend endpoint `/desktop/update-feed` proxies to the chosen channel.

### D. Quality gates
1. End-to-end QA checklist (installation, DMX USB detection, firewall prompts).
2. CI job for Windows runner:
   - build the PyInstaller executable
   - build the Tauri bundle
   - attach artifacts to the GitHub Release
   - ✅ `Desktop QA` workflow (`.github/workflows/desktop-qa.yml`) runs on PRs/pushes touching desktop/back-end code, compiles the frontend + backend + Tauri shell on `windows-latest`, and uploads MSI/NSIS artifacts for manual testing.
3. Documentation: `docs/DESKTOP_INSTALL.md` covering requirements, troubleshooting, signed binary info.

## 5. Open questions
- Driver signing for USB DMX (Enttec) on Windows? Might need instructions.
- Auto-update vs manual download (GitHub Releases?).
- Whether to keep Docker option in installer (for advanced users).
- macOS notarization & Apple Developer ID (future step).

## 6. Next steps
1. Create GitHub issue "Desktop Wrapper (.exe) – Windows MVP" referencing this plan.
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
- Preferences persist via /desktop/preferences; onboarding lze znovu spustit ze sekce Nastavení (karta "Desktop onboarding") nebo z Tauri tray menu (*Run Onboarding*). GitHub workflow `desktop-release.yml` už buildí MSI/NSIS + release manifesty a publikuje release `desktop-vX.Y.Z` (beta = prerelease).
- Workflow volitelně uploaduje `<channel>-release.json` na updates bucket (viz secrets `UPDATES_BUCKET` + `AWS_*`), aby backend proxy `/desktop/update-feed` měl vždy aktuální feed.

