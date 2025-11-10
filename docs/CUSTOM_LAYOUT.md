# Custom Layout & Dashboard Documentation

This document describes how the configurable dashboard works end‑to‑end: data model, backend API, UI builder, and renderer extension points.

---

## Overview

The custom dashboard feature lets operators assemble their own control surface (sliders, scene buttons, notes, etc.) and persist it inside the show snapshot. The system consists of three layers:

1. **Show Snapshot Schema** – `customLayout` embedded in `/export`/`/import`.
2. **Frontend Builder & Renderer** – React components for editing and rendering blocks.
3. **Backend Validation** – FastAPI ensures imports follow the schema before writing `data/show.json`.

The goal is to enable drag‑and‑drop authoring now, while making it trivial to plug in real UI widgets later.

---

## Schema

`customLayout` lives inside the show snapshot:

```jsonc
{
  "version": "1.1",
  "exportedAt": 1731196800000,
  "universes": [],
  "fixtures": [],
  "...": [],
  "customLayout": {
    "id": "layout-default",
    "name": "Dashboard",
    "grid": {
      "columns": 12,
      "rowHeight": 1,
      "gap": 1
    },
    "blocks": [
      {
        "id": "block-master",
        "kind": "master-dimmer",
        "title": "Master",
        "size": "md",
        "position": { "col": 0, "row": 0, "width": 4, "height": 1 },
        "showPercent": true
      },
      {
        "id": "block-warm",
        "kind": "scene-button",
        "sceneId": "scene-warm-wash",
        "behavior": "recall"
      }
    ],
    "updatedAt": 1731196800000
  }
}
```

### Block Kinds

| Kind             | Purpose                                    | Key props                                  |
| ---------------- | ------------------------------------------ | ------------------------------------------ |
| `master-dimmer`  | Global intensity slider                    | `showPercent`                              |
| `scene-button`   | Recall/preview scenes                      | `sceneId`, `behavior`                      |
| `effect-toggle`  | Start/stop effects                         | `effectId`, `behavior`                     |
| `fixture-slider` | Direct channel control                     | `fixtureId`, `channelId`, `min`, `max`     |
| `motor-pad`      | Stepper motor joystick                     | `motorId`, `axis`, `speedScale`            |
| `servo-knob`     | Servo angle control                        | `servoId`, `showTarget`                    |
| `markdown-note`  | Operator notes / markdown content          | `content`                                  |

Every block inherits `id`, `title`, `description`, `size`, and optional `position` (`col`, `row`, `width`, `height`).

---

## Backend Validation

- `server/models.py` defines Pydantic models for all block kinds (`CustomBlockModel`) and layout grid (`CustomLayoutModel`).
- `load_show_snapshot` (`server/services/data.py`) sanitizes persisted JSON via `CustomLayoutModel.model_validate`, dropping invalid layouts instead of crashing.
- `/import` (`server/api.py`) validates `customLayout` on ingress. Invalid payload → `HTTP 400`, preventing corrupted `show.json`.
- `/export` includes the sanitized layout so UI stays in sync even after manual edits.

This means custom dashboards can be edited via API, UI builder, or manual JSON editing without fear of breaking the server.

---

## Frontend Builder (`CustomPageBuilder`)

File: `src/components/CustomPageBuilder.tsx`

Key capabilities:

- **Block catalog** – quick actions to spawn each kind with sensible defaults (fixture/channel IDs auto‑filled when possible).
- **Drag & drop ordering** – implemented via `@dnd-kit`; reordering updates `position.row` and persists.
- **Grid editor** – change column count, row height, and gap, stored under `customLayout.grid`.
- **Canvas preview** – uses the shared renderer (see below) to visualize layout while editing.
- **Inspector** – form fields for block metadata (title, description, size, position) + type‑specific props (scene IDs, effect behaviour, slider ranges, etc.).
- **Duplication & deletion** – clone blocks, remove blocks, auto‑select newly created/duplicated ones.

Every action calls `persistShowSnapshot({ customLayout })` via the state setter in `App.tsx`, so backend immediately receives updated JSON.

---

## Renderer (`CustomLayoutRenderer`)

File: `src/components/CustomLayoutRenderer.tsx`

Responsibilities:

- Render blocks inside a CSS grid using dimensions from `customLayout.grid`.
- Highlight selected block (used by the builder but reusable elsewhere).
- Provide fallback placeholder UI for each block kind.
- Accept a `renderers` map so runtime dashboards can override the visuals.

Usage example:

```tsx
import { CustomLayoutRenderer, defaultBlockRenderers } from '@/components/CustomLayoutRenderer'

<CustomLayoutRenderer
  layout={customLayout}
  renderers={{
    ...defaultBlockRenderers,
    'master-dimmer': (block) => (
      <RealMasterDimmer componentProps derivedFrom={block} />
    ),
  }}
/>
```

You can pass callbacks to `onBlockSelect(blockId, event)` to reuse selection logic (including multi-select via modifier keys) outside the builder.

---

## Extending the Runtime

1. **Create Block Components**  
   Map each `CustomBlockKind` to an actual widget (slider, button, joystick). Use existing setters (`setFixtures`, `setScenes`, `setEffects`, etc.) to hook into DMX logic.

2. **Inject Renderers**  
   Import `CustomLayoutRenderer` into a runtime screen (e.g., a new `CustomDashboard` view) and provide the block renderers map.

3. **Persist Layout**  
   Layout updates already propagate via `App.tsx`. If you edit layout outside the builder (e.g., quick actions on the dashboard), call `setCustomLayout` there as well – it writes to the same snapshot.

4. **Server Integrations**  
   If other systems need to push layouts, call `/export` to retrieve the current structure, modify `customLayout`, then `/import` with the validated payload.

---

## Testing

- Frontend: add Vitest tests that render `CustomLayoutRenderer` with known data and assert that custom renderers receive the right props.
- Backend: `server/tests/test_show_export.py` / `test_show_bootstrap.py` can be expanded with fixtures exercising `customLayout` to ensure validation catches bad payloads.

---

## Roadmap Ideas

- Snap‑to‑grid resizing/dragging on the canvas (currently only sort order changes `position`).
- Multi‑select operations (delete, duplicate, move).
- Undo/redo stack using layout history.
- Sharing layouts across projects via `/projects` endpoints.
- Visual cues for data binding (e.g., show fixture names next to slider blocks when fixture is missing).

With the current foundation, adding these features is mostly UI work—backend safeguards already enforce schema consistency.
