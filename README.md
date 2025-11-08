# Atmosfil DMX 512 Controller

Pro-grade DMX 512 lighting and motion control that runs as a Progressive Web App, a Python FastAPI backend, and an optional desktop wrapper (Tauri + PyInstaller). The project targets touring rigs where operators want a modern UI, remote automation, and hardware integrations (USB, Art-Net, SparkFun DMX input).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-ready-success.svg)](manifest.json)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688.svg)](https://fastapi.tiangolo.com/)

---

## Highlights

- **Lighting + motion** – Universes with RGB fixtures, chases and fades, stepper/servo control blocks, joystick UI, visual block programming.
- **DMX I/O** – Art-Net, sACN (E1.31), Enttec DMX USB Pro, SparkFun DMX input (ESP32 shield), auto-discovery endpoints, one-tap DMX test frames.
- **Projects & backups** – Multi-show storage, cloud-ready backups with optional encryption, diff-friendly JSON snapshots.
- **Automation** – AI/Codex workflows documented in `docs/AI_AUTOMATION.md`, ready for cron, CI, or VS Code agent mode.
- **Desktop distribution** – PyInstaller backend (`scripts/build-server-exe.bat`) + Tauri wrapper with onboarding wizard, updater, MSI/NSIS installers.

---

## Tech stack

| Layer         | Details                                                                 |
| ------------- | ----------------------------------------------------------------------- |
| Frontend      | React 19 + TypeScript, Vite 6, Radix UI, Tailwind utilities             |
| Backend       | FastAPI, Uvicorn, asyncio MQTT, SACN receiver, Enttec USB driver        |
| Firmware      | `firmware/esp32-dmx-gateway` Arduino sketch (SparkFun DMX shield)       |
| Desktop       | Tauri 2.x wrapper (Rust) + PyInstaller sidecar (`dmx-backend.exe`)      |
| Automation    | Codex / GPT workflows (`scripts/ai/*`, `docs/AI_AUTOMATION.md`)         |

---

## Quick start (web + backend)

Prerequisites: Node 20+, npm, Python 3.11/3.12, Git, (optional) pnpm.

1. **Install dependencies**
   ```bash
   npm install
   python -m pip install -r server/requirements.txt
   ```
2. **Start backend**
   ```bash
   uvicorn server.app:app --host 0.0.0.0 --port 8080 --reload
   ```
   Environment overrides live under `DMX_*` variables (see `server/config.py`).
3. **Start frontend**
   ```bash
   npm run dev
   ```
   Vite serves the PWA at `http://localhost:5173` and proxies API calls to the backend.
4. **Optional: run tests**
   ```bash
   npm run test      # Vitest
   python -m pytest server/tests
   ```

---

## DMX integrations

| Mode           | How to enable                                                                    |
| -------------- | -------------------------------------------------------------------------------- |
| **USB (Enttec/DMXKing)** | `DMX_OUTPUT_MODE=enttec`, optional `DMX_USB_PORT=COM3`. Autodiscovery uses FTDI VID/PID. Diagnostic endpoints: `GET /usb/devices`, `POST /usb/refresh`, `POST /usb/reconnect`. |
| **Art-Net & sACN** | `DMX_SACN_ENABLED=true` (E1.31 input) and Art-Net broadcast via `/dmx/test`. |
| **SparkFun DMX input** | Hook the ESP32 + shield sketch in `firmware/esp32-dmx-gateway/`; backend consumes DMX -> RGB commands. |
| **DMX autodetect API** | `GET /dmx/devices` merges USB + Art-Net discovery; `POST /dmx/test` emits a single DMX frame (serial or Art-Net) for quick sanity checks (used by the desktop onboarding wizard). |

---

## Projects, backups, and automation

- Multi-project mode: set `DMX_PROJECTS_ENABLED=true` and use `GET/POST /projects` plus the Data Management panel to switch shows.
- Cloud backups: configure provider/env in `docs/DEPLOYMENT_GUIDE.md`. REST endpoints `GET/POST /projects/{id}/backups`, `POST /projects/{id}/restore`.
- Automation: `docs/AI_AUTOMATION.md` covers Codex CLI, VS Code agent mode, LangChain flows, CI cron jobs, and safety guardrails. Use `.vscode/tasks.json` for repeatable runs (Generate via OpenAI / Codex full-auto).

---

## Desktop distribution

1. Build backend sidecar (PyInstaller) — copies `dmx-backend.exe` into the Tauri bundle:
   ```powershell
   scripts\build-server-exe.bat
   ```
2. Build the Tauri shell:
   ```powershell
   cd desktop
   npm install
   npm run build
   ```
   Outputs signed-ready installers under `desktop/src-tauri/target/release/bundle/{msi,nsis}`.
3. First-run wizard (`src/components/DesktopOnboarding.tsx`) guides users through licence, DMX detection/tests, update channel, and telemetry toggles.
4. Updater: configured in `desktop/src-tauri/tauri.conf.json` (`https://updates.atmosfil.cz/desktop/release.json`). Replace the public key via CI secrets and publish signed `release.json` manifests alongside releases.

---

## Repository structure

```
.
|-- server/             # FastAPI backend, drivers, persistence layers
|-- src/                # React app (Vite)
|-- desktop/            # Tauri wrapper (Rust + npm workspace)
|-- firmware/           # ESP32 SparkFun DMX gateway sketch
|-- docs/               # Deployment, AI automation, desktop install guides
|-- scripts/            # Build helpers (PyInstaller, AI generation)
`-- data/, config/, public/, infra/ ...
```

---

## Useful docs

- `docs/AI_AUTOMATION.md` – autonomous Codex / GPT workflows, CI tasks, cron examples.
- `docs/DESKTOP_INSTALL.md` – PyInstaller + Tauri build/run guides and updater notes.
- `docs/DESKTOP_WRAPPER_PLAN.md` – detailed roadmap for the desktop release (signing, CI, QA).
- `docs/DEPLOYMENT_GUIDE.md` – backend/server deployment instructions (Docker, infra/Caddy).
- `docs/TROUBLESHOOTING.md` – DMX hardware tips, firewall, and driver guidance.

---

## Contributing

1. Fork the repository and create a branch (`git checkout -b feature/my-change`).
2. Keep TypeScript, ESLint, and pytest suites green.
3. Document new behaviour (README + docs) and add tests when possible.
4. Open a Pull Request targeting `main`.

Bug reports, feature ideas, and hardware test notes are welcome via [GitHub Issues](https://github.com/atrep123/dmx-512-controller/issues).

---

## License

MIT License – see [LICENSE](LICENSE).
