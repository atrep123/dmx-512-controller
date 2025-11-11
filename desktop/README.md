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
3. Install Tauri CLI deps (requires @tauri-apps/cli v2):
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
- Keeps a splash window visible until the packaged backend responds on `http://127.0.0.1:8080/healthz`. During startup the shell emits:
  - `desktop://backend/waiting` → still polling (payload = attempt count)
  - `desktop://backend/ready` → backend is up, splash closes and the main window is shown
  - `desktop://backend/error` → backend failed to boot (a native dialog is also shown)

## Production build

```bash
cd desktop
npm run build
```

- Rebuilds resources and runs `tauri build`, producing installers under
  `desktop/src-tauri/target/release/bundle/`.
- Ensure `desktop/src-tauri/resources/bin/dmx-backend.exe` exists _before_ building so
  the bundler can embed the sidecar (run `scripts\build-server-exe.bat` if unsure).

## Auto-update & signing

Tauri's updater verifies installer signatures before applying an update:

1. **Generate keys (one-time)**
   ```bash
   npx tauri signer generate
   ```
   Copy the public key into `tauri.conf.json > tauri.updater.pubkey`. Keep the private key secret.
2. **Expose the private key to CI/local builds**
   - Set `TAURI_SIGNING_PRIVATE_KEY_PATH` to the generated `.key` file **or**
   - Set `TAURI_SIGNING_PRIVATE_KEY` to the base64 contents of the private key (the release script writes a temp file),
   and optionally `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` if you chose one.
3. **Create the release manifest**
   After `npm run build` finishes (MSI/NSIS under `desktop/src-tauri/target/release/bundle`), run:
   ```bash
   node desktop/scripts/create-release-json.mjs --channel stable --version 1.2.3
   ```
   The script now calls `npx tauri signer sign` under the hood to produce a signature for the NSIS installer and writes `dist/desktop/<channel>-release.json`.
4. **Publish**
   Upload both installers and the matching release JSON to your CDN/GitHub Releases. The desktop app polls `/desktop/update-feed` (proxying to the published JSON) and validates updates with the configured public key.

### GitHub workflow

- `.github/workflows/desktop-release.yml` automates the process above:
  - trigger it via **Actions → Desktop Release → Run workflow** with `version` and `channel`.
  - supply secrets `TAURI_SIGNING_PRIVATE_KEY` (base64), optional `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`, or `TAURI_SIGNING_PRIVATE_KEY_PATH`.
  - the job builds the web bundle, PyInstaller backend, Tauri shell, runs `node desktop/scripts/create-release-json.mjs`, uploads artifacts, tags the commit (`desktop-v<version>`) and publishes a GitHub Release with the MSI/NSIS binaries + `<channel>-release.json`.
- If you prefer S3/custom CDN, replace the final `softprops/action-gh-release` step with your upload command; the manifest lives in `dist/desktop/<channel>-release.json`.

## Next steps

- Automate release publication + Windows Authenticode signing for MSI/NSIS.
- Extend sidecar lifecycle (tray badges, crash recovery UI hooks, expose backend status to the SPA).
- Onboarding wizard (USB/Art-Net detection, DMX test, update-channel picker) ships with the main SPA — make sure to keep CI coverage in sync when editing `src/components/DesktopOnboarding.tsx`.
