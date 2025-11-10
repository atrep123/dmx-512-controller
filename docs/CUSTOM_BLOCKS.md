# Custom UI Blocks

Tento soubor popisuje koncept bloků, které půjdou skládat v editoru „Custom Page Builder“. Typy už existují v `src/lib/types.ts`, takže UI i backend mohou layout bezpečně validovat.

## Struktura layoutu

```ts
export interface CustomLayout {
  id: string
  name: string
  grid?: { columns: number; rowHeight: number; gap: number }
  blocks: CustomBlock[]
  updatedAt: number
}
```

- `id`, `name` – identifikace layoutu (např. „mobilní ovládání“).
- `grid` – volitelná metadata pro renderer (může je ignorovat).
- `blocks` – seznam bloků (viz níže). Každý blok nese i `position` (`col`, `row`, `width`, `height`) pro grid snap.
- `updatedAt` – timestamp pro undo/redo nebo synchronizaci.

## Dostupné bloky

| Kind | Popis | Důležité props |
| ---- | ----- | --------------- |
| `master-dimmer` | Slider/kolečko pro globální intenzitu. | `showPercent` (bool) |
| `scene-button` | Tlačítko, které spustí/preview scénu. | `sceneId`, `behavior` (`recall`/`toggle`/`preview`) |
| `effect-toggle` | Přepínač efektu (chase, rainbow…). | `effectId`, `behavior` (`toggle`/`on`/`off`) |
| `fixture-slider` | Přímé řízení konkrétního kanálu. | `fixtureId`, `channelId`, `min`, `max`, `showValue` |
| `motor-pad` | 2D pad nebo joystick pro motory. | `motorId`, `axis`, `speedScale` |
| `servo-knob` | Kruhový ovladač pro servo. | `servoId`, `showTarget` |
| `markdown-note` | Statický text/markdown. | `content` |

Všechny bloky dědí ze `CustomBlockBase`:

```ts
interface CustomBlockBase {
  id: string
  kind: CustomBlockKind
  title?: string
  description?: string
  size?: CustomBlockSize  // xs/sm/md/lg
  position?: CustomBlockPosition
}
```

### Position

`CustomBlockPosition` používá integer grid (`col`, `row`, `width`, `height`). Editor si může definovat libovolnou velikost gridu, ale doporučujeme 12 sloupců podobně jako Tailwind (`col` = 0..11).

## Uložení do show snapshotu

- `ShowSnapshot` obsahuje volitelné pole `customLayout?: CustomLayout`.
- Frontend by měl při úpravě layoutu volat `persistShowSnapshot({ customLayout })`, aby byl JSON uložen přes `/import`.
- Backend (FastAPI) bude později validovat `customLayout` pomocí zrcadlených Pydantic modelů.

## Runtime renderer

- `src/components/CustomLayoutRenderer.tsx` je základní grid renderer, který z `CustomLayout` vyrobí plátno.
- Přijímá `renderers?: BlockRendererMap`, takže můžeš override jednotlivé bloky vlastní komponentou (např. skutečný slider).
- Obsahuje `selectedBlockId`, `selectedBlockIds` a `onBlockSelect(blockId, event)`, takže builder může sdílet výběr (včetně multi-selectu) s konfigurátorem.
- Šablona v `CustomPageBuilder` používá renderer pouze pro náhled – v ostrém UI stačí komponentu vložit kamkoli a doplnit vlastní `renderers`.

## Jak přidat nový blok

1. V `src/lib/types.ts` rozšiř `CustomBlockKind` a přidej nový interface.
2. Aktualizuj registry (např. `CustomPageBuilder` nebo budoucí `blockRegistry.ts`) – zadej výchozí props, ikonku, text.
3. V rendereru přidej komponentu, která zpracuje nový typ.
4. (volitelné) Přidej seed do `data/show.json`, aby tester viděl nový blok hned po startu.

Layout můžeš editovat přímo v `CustomPageBuilder` – bloky přidáš tlačítkem a následně je přetáhneš (DnD kit) v sekci „Aktuální layout“. Každý drag/drop nebo odebrání okamžitě persistuje `customLayout` do show snapshotu (a seed souborů). Builder navíc podporuje:

- Multi výběr (tlačítko „Multi výběr“ nebo Ctrl/Cmd + klik), bulk duplikaci/smazání a zobrazení počtu vybraných bloků.
- Historii (Undo/Redo + zkratky Ctrl/Cmd + Z / Shift + Z).
- Klávesové zkratky: Delete (smazání), Ctrl/Cmd + D (klon), šipky pro posun, Alt + šipky pro změnu šířky/výšky, Shift pro větší krok.
- Modifikátory „Duplicita“ / „Mazání“ pro rychlé klikací operace na plátně.

Pokud potřebuješ hromadné úpravy, lze layout pořád editovat i ručně v JSONu – struktura zůstává validovaná TypeScriptem i backendem.
