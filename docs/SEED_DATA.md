## Seed data for local testing

The repository ships with a ready‑made DMX show so you can develop the UI against realistic data without having hardware connected.

### Files

| File | Purpose |
| ---- | ------- |
| `data/show.json` | Canonical snapshot used by the FastAPI `/export` & `/import` endpoints. Contains universes, fixtures, effects, motors, servos, scenes and MIDI map definitions. |
| `data/scenes.json` | Materialised list consumed by `ScenesStore`. It mirrors the scenes from `show.json` so REST updates remain consistent even if the show snapshot fails to load. |

Both files are UTF‑8 JSON and can be edited manually. The backend rewrites them whenever the UI performs “Synchronizovat” or any change that calls `uploadShow`.

### What’s inside

The default dataset represents a small two‑universe rig:

- `Main Stage` (universe `0`) – two RGBW front washes, one moving head spot, one servo (“Laser Iris”).
- `Rig Truss` (universe `1`) – pixel strip (3× RGB segments) and a two‑channel stepper motor (“Pan Rail”).
- Two sample scenes (“Warm Wash”, “Solo Spot”), including motor/servo positions.
- Example effects (`Warm Chase`, `Rainbow Pixels`) and MIDI mappings that hook master dimmer / scenes / effects.
- `customLayout` s několika bloky (master dimmer, tlačítka scén, efekt toggle, slider kanálu, poznámka), aby Custom Page Builder hned ukazoval reálné UI.

Feel free to rename fixtures, add more channels, or extend the snapshot with your own values – just keep channel IDs unique because scenes reference them directly.

### Recommended workflow

1. **Start the backend with the bundled seed**
   ```bash
   cd server
   uvicorn app:app --host 0.0.0.0 --port 3001 --reload
   ```
   The FastAPI app automatically loads `data/show.json` and `data/scenes.json` from the repo root.

2. **Point the frontend at the backend**  
   Edit `.env.development` if needed:
   ```
   VITE_BACKEND_URL=http://localhost:3001
   VITE_WS_URL=ws://localhost:3001/ws   # optional, inferred from BACKEND_URL
   ```
   Then run `npm run dev` to work against real data instead of mock responses.

3. **Iterate on the dataset**  
   - Change fixture definitions or add universes directly in `data/show.json`.
   - Reload the backend (or hit “Synchronizovat” in the UI) to pull new values.
   - Commit the JSON files if the seed should be shared with teammates/CI.

4. **Reset to a clean state**  
   Delete `data/show.json` / `data/scenes.json` or replace them with another snapshot. The backend will recreate them as soon as the UI performs the next export/import cycle.

### Tips

- Keep timestamps (`timestamp`, `exportedAt`) in milliseconds to avoid FastAPI validation errors.
- Channel IDs referenced from scenes must exist in `fixtures[].channels` (or motor/servo IDs for position maps).
- When adding MIDI mappings, stick to the schema defined in `src/lib/midiMappings.ts`.

This seed makes it much easier to validate UI changes, run integration tests, or demo the app without physical DMX gear.
