# Atmosfil DMX 512 Controller

Profesionální DMX 512 řízení osvětlení a motion prvků, které běží jako Progressive Web App, Python FastAPI backend a volitelný desktopový wrapper (Tauri + PyInstaller). Cílíme na mobilní stage instalace, kde je potřeba moderní UI, vzdálená automatizace a flexibilní DMX integrace (USB, Art-Net, SparkFun DMX vstup).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-ready-success.svg)](manifest.json)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688.svg)](https://fastapi.tiangolo.com/)

---

## Co všechno umíme

- **Osvětlení + motion** – více DMX universů s RGB fixtures, chase/fade scény, bloky pro stepper/servo motory, joystick UI a vizuální editor efektů.
- **DMX I/O** – Art-Net, sACN (E1.31), Enttec DMX USB Pro, SparkFun DMX vstup (ESP32 shield), auto-discovery endpointy a jednorázové DMX testy.
- **Projekty & zálohy** – více show v jednom repu, cloud-ready zálohy s volitelným šifrováním a diff-friendly JSON snapshoty.
- **Automatizace** – AI/Codex workflowy (viz `docs/AI_AUTOMATION.md`) připravené pro cron, CI i VS Code agent režim.
- **Desktop distribuce** – PyInstaller backend (`scripts/build-server-exe.bat`) + Tauri wrapper s onboarding wizardem, updaterem a MSI/NSIS instalátory.

Detailní přehled funkcí: [`docs/FEATURES.md`](docs/FEATURES.md).

---

## Technologický stack

| Layer      | Details                                                                 |
| ---------- | ----------------------------------------------------------------------- |
| Frontend   | React 19 + TypeScript, Vite 6, Radix UI, Tailwind utilities             |
| Backend    | FastAPI, Uvicorn, asyncio MQTT, sACN receiver, Enttec USB driver        |
| Firmware   | `firmware/esp32-dmx-gateway` Arduino sketch (SparkFun DMX shield)       |
| Desktop    | Tauri 2.x wrapper (Rust) + PyInstaller sidecar (`dmx-backend.exe`)      |
| Automation | Codex / GPT workflows (`scripts/ai/*`, `docs/AI_AUTOMATION.md`)         |

---

## Rychlý start (web + backend)

Předpoklady: Node 20+, npm, Python 3.11/3.12, Git (pnpm volitelně).

1. **Instalace závislostí**
   ```bash
   npm install
   python -m pip install -r server/requirements.txt
   ```
2. **Start backendu**
   ```bash
   uvicorn server.app:app --host 0.0.0.0 --port 8080 --reload
   ```
   Konfigurace běží přes proměnné `DMX_*` (viz `server/config.py`).
3. **Start frontendu**
   ```bash
   npm run dev
   ```
   Vite běží na `http://localhost:5173` a proxuje API na backend.
4. **Volitelné: testy**
   ```bash
   npm run test        # Vitest
   python -m pytest server/tests
   ```

---

## DMX integrace

| Mód | Jak zapnout |
| ---- | ------------- |
| **USB (Enttec/DMXKing)** | `DMX_OUTPUT_MODE=enttec`, případně `DMX_USB_PORT=COM3`. Autodetekce používá FTDI VID/PID. Diagnostika: `GET /usb/devices`, `POST /usb/refresh`, `POST /usb/reconnect`. |
| **Art-Net & sACN** | `DMX_SACN_ENABLED=true` (E1.31 vstup). `/dmx/test` pošle Art-Net rámec pro rychlé ověření. |
| **SparkFun DMX input** | Nahraj ESP32 + SparkFun shield sketch z `firmware/esp32-dmx-gateway/`; backend konzumuje DMX -> RGB příkazy. |
| **DMX autodetect API** | `GET /dmx/devices` spojuje USB + Art-Net discovery, `POST /dmx/test` vyšle jednorázový frame (serial/Art-Net). Využívá ho i desktopový onboarding. |

---

## Projekty, zálohy, automatizace

- Multi-projektový režim zapneš přes `DMX_PROJECTS_ENABLED=true` a REST API `GET/POST /projects` (v UI Data Management panel).
- Cloud backup nakonfiguruješ dle `docs/DEPLOYMENT_GUIDE.md`. K dispozici jsou endpointy `GET/POST /projects/{id}/backups`, `POST /projects/{id}/restore`, případně šifrování (Fernet).
- Automatizace: `docs/AI_AUTOMATION.md` popisuje Codex CLI, VS Code agent mód, LangChain flows, cron/CI scénáře a bezpečnostní zásady. `.vscode/tasks.json` obsahuje hotové tasky pro OpenAI/Codex běhy.

---

## Desktop distribuce

1. Backend sidecar (PyInstaller) – zkopíruje `dmx-backend.exe` do Tauri bundle:
   ```powershell
   scripts\build-server-exe.bat
   ```
2. Slož `desktop` shell:
   ```powershell
   cd desktop
   npm install
   npm run build
   ```
   Výstup: `desktop/src-tauri/target/release/bundle/{msi,nsis}`.
3. První spuštění řeší wizard (`src/components/DesktopOnboarding.tsx`) – licence, DMX detekce/test, kanál updatů, telemetrie.
4. Updater je nastavený v `desktop/src-tauri/tauri.conf.json` (`https://updates.atmosfil.cz/desktop/release.json`). V CI nahraj skutečný public key a publikuj podepsané `release.json`.

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

## Užitečné dokumenty

- `docs/FEATURES.md` – kompletní seznam funkcí (osvětlení, motion, automaty, limity).
- `docs/AI_AUTOMATION.md` – autonomní Codex / GPT workflowy, CI/cron příklady.
- `docs/DESKTOP_INSTALL.md` – PyInstaller + Tauri build guide a poznámky k updateru.
- `docs/DESKTOP_WRAPPER_PLAN.md` – roadmapa desktop verze (signing, CI, QA).
- `docs/DEPLOYMENT_GUIDE.md` – deployment backendu (Docker, infra/Caddy).
- `docs/TROUBLESHOOTING.md` – rady pro DMX hardware, firewall a ovladače.

---

## Přispívání

1. Forkni repozitář a vytvoř branch (`git checkout -b feature/moje-zmena`).
2. Drž TypeScript/Vitest/pytest v zelených číslech.
3. Každou větší funkci popiš v README/dokumentaci + doplň testy.
4. Otevři Pull Request proti `main`.

Bugreporty, nápady a poznámky z hardware testování posílej přes [GitHub Issues](https://github.com/atrep123/dmx-512-controller/issues).

---

## Licence

MIT License – viz [LICENSE](LICENSE).
