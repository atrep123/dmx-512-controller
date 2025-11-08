# Desktop Shell (Tauri)

This folder hosts the experiments for the native desktop wrapper. The shell
embeds the existing PWA build and manages the packaged backend sidecar
(`dmx-backend.exe`).

> ⚠️ Early prototype – you need a working Rust + Node toolchain and the backend
> executable generated via `scripts\build-server-exe.bat`.

## Prerequisites

1. Build the frontend:
   ```bash
   npm install
   npm run build
   ```
2. Build the backend executable (also syncs it into `src-tauri/resources/bin/`):
   ```powershell
   scripts\build-server-exe.bat
   ```
   Output: `server/dist/dmx-backend.exe` + `desktop/src-tauri/resources/bin/dmx-backend.exe`
3. Install Tauri CLI deps:
   ```bash
   cd desktop
   npm install
   ```

## Development

```bash
cd desktop
npm run dev
```

- Copies `../dist` into `src-tauri/resources/app`.
- Starts Tauri dev server pointing to `http://localhost:5173` (run `npm run dev`
  in repo root for hot reloads).
- Attempts to launch the backend sidecar (`dmx-backend.exe`). Logs appear in the
  terminal and in the DevTools console (`dmx-backend://log` events).

## Production build

```bash
cd desktop
npm run build
```

- Rebuilds resources and runs `tauri build`, producing installers under
  `desktop/src-tauri/target/release/bundle/`.
- Ensure `desktop/src-tauri/resources/bin/dmx-backend.exe` exists _before_ building so
  the bundler can embed the sidecar (run `scripts\build-server-exe.bat` if unsure).

## Next steps

- Wire auto-update + code signing.
- Improve sidecar lifecycle (status tray, crash recovery).
- Onboarding wizard (USB/Art-Net detection, DMX test, update-channel picker) ships with the main SPA –
  make sure to keep CI coverage in sync when editing `src/components/DesktopOnboarding.tsx`.
