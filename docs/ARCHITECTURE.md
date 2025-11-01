# Architektura DMX 512 Kontrolér

Tento dokument popisuje architekturu aplikace DMX 512 Kontrolér včetně design rozhodnutí, komponentové struktury a datových toků.

## 📋 Obsah

- [Přehled](#přehled)
- [Technologický stack](#technologický-stack)
- [Komponentová architektura](#komponentová-architektura)
- [State management](#state-management)
- [Datové modely](#datové-modely)
- [PWA architektura](#pwa-architektura)
- [Performance optimalizace](#performance-optimalizace)

## 🏗️ Přehled

DMX 512 Kontrolér je Single Page Application (SPA) postavená na moderních web technologiích s mobile-first přístupem. Aplikace běží kompletně na klientovi bez nutnosti backendu, všechna data jsou uložená lokálně pomocí IndexedDB.

### Klíčové design principy

1. **Mobile-first** - Primárně navrženo pro dotykové zařízení
2. **Offline-first** - Plně funkční bez internetového připojení
3. **Progressive Enhancement** - Postupné zlepšování funkcí podle možností zařízení
4. **Performance** - Optimalizováno pro 60fps animace a okamžitou odezvu
5. **Accessibility** - WCAG AA compliant

### Architektonický vzor

Aplikace používá **komponentově orientovanou architekturu** s následující strukturou:

```
┌─────────────────────────────────────┐
│         React Application           │
├─────────────────────────────────────┤
│  View Components (Pages/Views)      │
│  ├─ FixturesView                    │
│  ├─ ScenesView                      │
│  ├─ EffectsView                     │
│  └─ ...                             │
├─────────────────────────────────────┤
│  Reusable UI Blocks                 │
│  ├─ ChannelSliderBlock              │
│  ├─ ColorPickerBlock                │
│  └─ ...                             │
├─────────────────────────────────────┤
│  Base UI Components (shadcn/ui)     │
├─────────────────────────────────────┤
│  State Management (React + KV)      │
├─────────────────────────────────────┤
│  Data Layer (IndexedDB)             │
└─────────────────────────────────────┘
```

## 🛠️ Technologický stack

### Core technologies

| Technologie | Verze | Účel |
|------------|--------|------|
| React | 19.0 | UI framework |
| TypeScript | 5.7 | Type safety |
| Vite | 6.3 | Build tool & dev server |
| Tailwind CSS | 4.1 | Styling |
| @github/spark | 0.39 | State management & KV store |

### UI libraries

| Knihovna | Účel |
|----------|------|
| Radix UI | Accessibility primitives |
| shadcn/ui | Pre-built styled components |
| Phosphor Icons | Icon system |
| Framer Motion | Animations |

### Utilities

| Knihovna | Účel |
|----------|------|
| React Hook Form | Form management |
| Zod | Schema validation |
| date-fns | Date manipulation |
| clsx + tailwind-merge | Conditional styling |

## 🧩 Komponentová architektura

### Hierarchie komponent

```
App.tsx (root)
├── PWAInstallPrompt
├── Tabs Navigation
│   ├── CustomPageBuilder (Vlastní stránka)
│   ├── ControlBlocksDemo (UI Bloky demo)
│   ├── LiveControlView (Živá kontrola)
│   │   ├── JoystickControl
│   │   └── Effect controls
│   ├── FixturesView (Světla)
│   │   ├── Fixture cards
│   │   └── Channel controls
│   ├── MotorsView (Motory)
│   │   ├── StepperMotor cards
│   │   └── Servo cards
│   ├── EffectsView (Efekty)
│   │   ├── Effect cards
│   │   └── BlockProgramming
│   ├── ScenesView (Scény)
│   │   └── Scene cards
│   ├── ConnectionView (Připojení)
│   │   └── Network config
│   └── SetupView (Nastavení)
│       └── Universe/Fixture setup
└── Toaster (notifications)
```

### View komponenty

View komponenty reprezentují celé stránky/taby v aplikaci:

- **App.tsx** - Root komponenta, routing pomocí Tabs
- **FixturesView** - Správa a ovládání světelných zařízení
- **ScenesView** - Ukládání a vyvolávání scén
- **EffectsView** - Vytváření a spouštění efektů
- **MotorsView** - Ovládání stepper motorů a servomotorů
- **ConnectionView** - Konfigurace síťového připojení
- **SetupView** - Nastavení univerzí a přidávání zařízení
- **LiveControlView** - Živé ovládání pomocí joysticku
- **CustomPageBuilder** - Vytváření vlastních ovládacích panelů

### Reusable Control Blocks

Znovupoužitelné ovládací komponenty v `src/components/controls/`:

```typescript
// Channel slider pro DMX hodnoty
<ChannelSliderBlock 
  label="Dimmer"
  value={255}
  onChange={setValue}
/>

// RGB color picker
<ColorPickerBlock
  red={255} green={0} blue={0}
  onColorChange={handleColor}
/>

// Toggle pro funkce on/off
<ToggleButtonBlock
  label="Strobe"
  active={isActive}
  onToggle={toggle}
/>

// Button pad pro efekty/scény
<ButtonPadBlock
  items={scenes}
  onItemClick={handleClick}
/>

// Pan/Tilt kontrola
<PositionControlBlock
  panValue={127} tiltValue={127}
  onPanChange={setPan}
/>

// Vertikální fader
<IntensityFaderBlock
  value={255}
  onChange={setValue}
/>
```

Každý block je:
- **Standalone** - Funguje samostatně
- **Configurable** - Props pro customizaci
- **Accessible** - Keyboard & screen reader support
- **Responsive** - Mobile optimalizováno

### Base UI Components

Používáme shadcn/ui komponenty z `src/components/ui/`:

- Button, Card, Input, Label
- Dialog, Sheet, Popover
- Tabs, Select, Slider
- Badge, Separator, Switch
- A další...

Tyto komponenty jsou:
- Plně customizovatelné
- TypeScript typed
- Accessibility compliant
- Theme-aware

## 🔄 State management

### Přehled state architektury

```
┌────────────────────────────────────┐
│     Component Local State          │
│  (useState, useReducer)             │
├────────────────────────────────────┤
│     Persistent State (KV Store)     │
│  - Fixtures                         │
│  - Scenes                           │
│  - Effects                          │
│  - Motors & Servos                  │
│  - Connection profiles              │
└────────────────────────────────────┘
         ↓ persisted to ↓
┌────────────────────────────────────┐
│        IndexedDB                    │
│    (offline persistence)            │
└────────────────────────────────────┘
```

### Persistent state s useKV

Používáme `@github/spark` KV store pro perzistentní data:

```typescript
import { useKV } from '@github/spark/hooks'

function App() {
  // Data jsou automaticky uložená do IndexedDB
  const [fixtures, setFixtures] = useKV<Fixture[]>('dmx-fixtures', [])
  const [scenes, setScenes] = useKV<Scene[]>('dmx-scenes', [])
  const [effects, setEffects] = useKV<Effect[]>('dmx-effects', [])
  
  // Změny jsou okamžitě persistovány
  const addFixture = (fixture: Fixture) => {
    setFixtures([...fixtures, fixture])
  }
}
```

### State keys

Všechna persistovaná data v KV store:

| Key | Type | Popis |
|-----|------|-------|
| `dmx-universes` | Universe[] | DMX universa |
| `dmx-fixtures` | Fixture[] | Světelná zařízení |
| `dmx-scenes` | Scene[] | Uložené scény |
| `dmx-stepper-motors` | StepperMotor[] | Stepper motory |
| `dmx-servos` | Servo[] | Servomotory |
| `dmx-effects` | Effect[] | Efekty |
| `dmx-connection-profiles` | ConnectionProfile[] | Profily připojení |
| `dmx-custom-pages` | CustomPage[] | Vlastní stránky |

### Props drilling vs Context

- **Props drilling** - Pro většinu komponent (preferováno pro jednoduchost)
- **Context** - Zatím nepoužíváno, zvážit pro budoucí scaling

## 📊 Datové modely

### Core typy

Definováno v `src/lib/types.ts`:

#### Fixture (Světelné zařízení)

```typescript
interface Fixture {
  id: string                // UUID
  name: string              // Uživatelské jméno
  dmxAddress: number        // Start adresa (1-512)
  channelCount: number      // Počet kanálů (1-512)
  universeId: string        // Reference na Universe
  channels: DMXChannel[]    // Jednotlivé kanály
  fixtureType: FixtureType  // Typ zařízení
}

type FixtureType = 
  | 'generic'      // Obecné světlo
  | 'rgb'          // RGB světlo
  | 'rgbw'         // RGBW světlo
  | 'moving-head'  // Moving head
  | 'stepper-motor'// Stepper motor
  | 'servo'        // Servomotor
```

#### DMXChannel

```typescript
interface DMXChannel {
  id: string          // Jedinečný identifikátor
  number: number      // Číslo kanálu v zařízení (1-based)
  name: string        // Název kanálu (např. "Dimmer", "Red")
  value: number       // Aktuální hodnota (0-255)
}
```

#### Scene

```typescript
interface Scene {
  id: string                          // UUID
  name: string                        // Jméno scény
  channelValues: Record<string, number>  // channelId -> value
  motorPositions?: Record<string, number> // motorId -> position
  servoAngles?: Record<string, number>    // servoId -> angle
  timestamp: number                   // Čas vytvoření
}
```

#### Effect

```typescript
interface Effect {
  id: string              // UUID
  name: string            // Jméno efektu
  type: EffectType        // Typ efektu
  fixtureIds: string[]    // Které fixtures ovlivňuje
  speed: number           // Rychlost (0-100)
  intensity: number       // Intenzita (0-100)
  isActive: boolean       // Běží nebo ne
  parameters: Record<string, number>  // Extra parametry
  blocks?: EffectBlock[]  // Pro block-program efekty
}

type EffectType = 
  | 'chase' | 'strobe' | 'rainbow' | 'fade' 
  | 'sweep' | 'sparkle' | 'wipe' | 'bounce'
  | 'theater-chase' | 'fire' | 'wave' | 'pulse'
  | 'color-fade' | 'block-program'
```

#### Effect Blocks (Blokové programování)

```typescript
interface EffectBlock {
  id: string
  type: BlockType
  parameters: BlockParameters
  order: number  // Pořadí v sekvenci
}

type BlockType = 
  | 'set-color'      // Nastavit barvu
  | 'fade'           // Fade přechod
  | 'wait'           // Čekání
  | 'chase-step'     // Krok chase efektu
  | 'strobe-pulse'   // Strobe puls
  | 'loop-start'     // Začátek smyčky
  | 'loop-end'       // Konec smyčky
  | 'set-intensity'  // Nastavit intenzitu
  | 'rainbow-shift'  // Rainbow posun
  | 'random-color'   // Náhodná barva
  | 'pan-tilt'       // Pan/Tilt pozice
```

#### StepperMotor

```typescript
interface StepperMotor {
  id: string
  name: string
  dmxAddress: number      // Start adresa (obvykle 2 kanály)
  universeId: string
  channelCount: number    // Obvykle 4 (high, low, speed, accel)
  channels: DMXChannel[]
  currentPosition: number // Aktuální pozice (0-65535)
  targetPosition: number  // Cílová pozice (0-65535)
  speed: number          // Rychlost (0-255)
  acceleration: number   // Zrychlení (0-255)
  maxSteps: number       // Max počet kroků
}
```

#### Servo

```typescript
interface Servo {
  id: string
  name: string
  dmxAddress: number
  universeId: string
  channelId: string      // DMX kanál ID
  currentAngle: number   // Aktuální úhel (0-180)
  targetAngle: number    // Cílový úhel (0-180)
  minAngle: number       // Min úhel (default 0)
  maxAngle: number       // Max úhel (default 180)
  speed: number          // Rychlost pohybu (0-255)
}
```

## 📱 PWA architektura

### Service Worker

Service Worker (`public/sw.js`) poskytuje:

1. **Offline caching** - Statické soubory jsou cachovány
2. **Update notifications** - Notifikace o nové verzi
3. **Background sync** - Možnost budoucího background syncu

```javascript
// Cache strategy: Cache-first s network fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  )
})
```

### Manifest

PWA manifest (`manifest.json`):

```json
{
  "name": "DMX 512 Kontrolér",
  "short_name": "DMX Control",
  "icons": [...],
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#262626",
  "background_color": "#0a0a0a"
}
```

### Offline storage

- **IndexedDB** - Pro user data (fixtures, scenes, effects)
- **Cache API** - Pro static assets (JS, CSS, images)
- **LocalStorage** - Pro drobné preference (zatím nepoužíváno)

### Installation flow

```
User visits app
       ↓
Service Worker registers
       ↓
Assets cached
       ↓
Install prompt shows (PWAInstallPrompt)
       ↓
User installs
       ↓
Icon added to home screen
       ↓
App opens in standalone mode
```

## ⚡ Performance optimalizace

### Code splitting

```typescript
// Lazy loading view komponent
const EffectsView = lazy(() => import('./components/EffectsView'))
const ScenesView = lazy(() => import('./components/ScenesView'))

// Vite automaticky rozděluje bundle
```

### Rendering optimizations

1. **React.memo** - Pro expensive komponenty
2. **useCallback** - Pro callback props
3. **useMemo** - Pro expensive computations
4. **Virtual scrolling** - Pro dlouhé seznamy (zvážit)

```typescript
// Příklad optimalizace
const FixtureCard = React.memo(({ fixture, onChange }) => {
  const handleChange = useCallback(
    (value) => onChange(fixture.id, value),
    [fixture.id, onChange]
  )
  
  return <Card>...</Card>
})
```

### Asset optimization

- **Image lazy loading** - Pro ikony a obrázky
- **Tree shaking** - Vite automaticky odstraňuje nepoužitý kód
- **Minification** - Produkční build je minifikovaný
- **Gzip compression** - Server-side komprese

### Animation performance

```typescript
// Použití CSS transforms místo top/left
// GPU accelerated animace
<motion.div
  animate={{ x: 100, opacity: 1 }}
  transition={{ duration: 0.3 }}
/>

// Preferování will-change pro smooth animace
className="will-change-transform"
```

### Lighthouse targets

| Metrika | Target | Aktuální |
|---------|--------|----------|
| Performance | 90+ | TBD |
| Accessibility | 100 | TBD |
| Best Practices | 100 | TBD |
| SEO | 90+ | TBD |
| PWA | 100 | ✅ |

## 🔐 Security considerations

### Data security

- **No backend** - Všechna data jsou lokální
- **No authentication** - Není potřeba (lokální app)
- **XSS prevention** - React escapuje výstupy
- **CSP headers** - Content Security Policy (doporučeno nastavit)

### DMX protocol security

- **Network isolation** - DMX síť by měla být izolovaná
- **Input validation** - Všechny DMX hodnoty jsou validovány (0-255)
- **Rate limiting** - Omezení počtu DMX packets/sec

## 🔮 Budoucí vylepšení

### Plánované architektonické změny

1. **State management** - Zvážit Zustand pro globální state
2. **Testing** - Přidat Vitest + React Testing Library
3. **Monitoring** - Error tracking (Sentry?)
4. **Analytics** - Usage analytics (privacy-friendly)
5. **i18n** - Internationalization podpora
6. **WebRTC** - Pro remote control možnosti
7. **MIDI support** - Ovládání pomocí MIDI kontrolérů

### Škálovatelnost

Aktuální architektura by měla zvládnout:
- 50+ fixtures
- 100+ scenes
- 50+ effects
- 10+ univerzí

Pro větší instalace zvážit:
- Virtual scrolling
- Pagination
- Lazy loading dat
- Worker threads pro effect computations

## 📚 Další čtení

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)

---

**Vytvořeno pro DMX 512 Kontrolér**  
Poslední aktualizace: 2024
