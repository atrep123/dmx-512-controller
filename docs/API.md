# API Reference

Kompletní reference všech TypeScript typů, rozhraní a funkcí v DMX 512 Kontrolér aplikaci.

## 📋 Obsah

- [Core Types](#core-types)
- [Component Props](#component-props)
- [Utility Functions](#utility-functions)
- [Hooks](#hooks)
- [Constants](#constants)

## 🎯 Core Types

### Fixture

Reprezentuje světelné zařízení nebo DMX device.

```typescript
interface Fixture {
  id: string
  name: string
  dmxAddress: number
  channelCount: number
  universeId: string
  channels: DMXChannel[]
  fixtureType: 'generic' | 'rgb' | 'rgbw' | 'moving-head' | 'stepper-motor' | 'servo'
}
```

**Properties:**
- `id` - Jedinečný identifikátor (UUID)
- `name` - Uživatelské jméno fixture
- `dmxAddress` - Start DMX adresa (1-512)
- `channelCount` - Počet DMX kanálů (1-512)
- `universeId` - Reference na parent Universe
- `channels` - Array DMX kanálů
- `fixtureType` - Typ zařízení

**Example:**
```typescript
const fixture: Fixture = {
  id: 'fixture-123',
  name: 'Par LED 1',
  dmxAddress: 1,
  channelCount: 4,
  universeId: 'universe-1',
  channels: [
    { id: 'ch1', number: 1, name: 'Red', value: 255 },
    { id: 'ch2', number: 2, name: 'Green', value: 0 },
    { id: 'ch3', number: 3, name: 'Blue', value: 0 },
    { id: 'ch4', number: 4, name: 'Dimmer', value: 255 }
  ],
  fixtureType: 'rgb'
}
```

### DMXChannel

Reprezentuje jeden DMX kanál.

```typescript
interface DMXChannel {
  id: string
  number: number
  name: string
  value: number
}
```

**Properties:**
- `id` - Jedinečný identifikátor kanálu
- `number` - Číslo kanálu v rámci fixture (1-based)
- `name` - Jméno kanálu (např. "Dimmer", "Red", "Pan")
- `value` - Aktuální DMX hodnota (0-255)

**Validation:**
- `value` musí být mezi 0-255 (inclusive)
- `number` musí být pozitivní integer

### Scene

Uložený snapshot všech kanálů a pozic.

```typescript
interface Scene {
  id: string
  name: string
  channelValues: Record<string, number>
  motorPositions?: Record<string, number>
  servoAngles?: Record<string, number>
  timestamp: number
}
```

**Properties:**
- `id` - Jedinečný identifikátor scény
- `name` - Uživatelské jméno scény
- `channelValues` - Mapa channelId → DMX value
- `motorPositions` - Mapa motorId → position (0-65535)
- `servoAngles` - Mapa servoId → angle (0-180)
- `timestamp` - Unix timestamp vytvoření

**Example:**
```typescript
const scene: Scene = {
  id: 'scene-1',
  name: 'Red Wash',
  channelValues: {
    'ch1': 255,  // Red channel
    'ch2': 0,    // Green channel
    'ch3': 0     // Blue channel
  },
  timestamp: Date.now()
}
```

### Effect

Automatizovaný lighting effect.

```typescript
interface Effect {
  id: string
  name: string
  type: EffectType
  fixtureIds: string[]
  speed: number
  intensity: number
  isActive: boolean
  parameters: Record<string, number>
  blocks?: EffectBlock[]
}

type EffectType = 
  | 'chase' | 'strobe' | 'rainbow' | 'fade' 
  | 'sweep' | 'sparkle' | 'wipe' | 'bounce'
  | 'theater-chase' | 'fire' | 'wave' | 'pulse'
  | 'color-fade' | 'block-program'
```

**Properties:**
- `id` - Jedinečný identifikátor efektu
- `name` - Uživatelské jméno efektu
- `type` - Typ efektu
- `fixtureIds` - Array fixture IDs které efekt ovlivňuje
- `speed` - Rychlost efektu (0-100)
- `intensity` - Intenzita efektu (0-100)
- `isActive` - Zda efekt právě běží
- `parameters` - Extra parametry specifické pro typ
- `blocks` - Pro block-program efekty

**Effect types:**
- `chase` - Postupné zapínání fixtures
- `strobe` - Rychlé blikání
- `rainbow` - Rainbow color cycle
- `fade` - Smooth fade in/out
- `sweep` - Pohyb napříč fixtures
- `sparkle` - Náhodné blikání
- `wipe` - Wipe přechod
- `bounce` - Bounce efekt tam a zpět
- `theater-chase` - Theater chase pattern
- `fire` - Simulace ohně
- `wave` - Wave pattern
- `pulse` - Pulse efekt
- `color-fade` - Fade mezi barvami
- `block-program` - Custom block program

### EffectBlock

Building block pro vizuální programování efektů.

```typescript
interface EffectBlock {
  id: string
  type: BlockType
  parameters: BlockParameters
  order: number
}

type BlockType = 
  | 'set-color'
  | 'fade'
  | 'wait'
  | 'chase-step'
  | 'strobe-pulse'
  | 'loop-start'
  | 'loop-end'
  | 'set-intensity'
  | 'rainbow-shift'
  | 'random-color'
  | 'pan-tilt'

interface BlockParameters {
  color?: string
  red?: number
  green?: number
  blue?: number
  white?: number
  intensity?: number
  duration?: number
  waitTime?: number
  fixtureIndex?: number
  loopCount?: number
  hueShift?: number
  pan?: number
  tilt?: number
}
```

**Block types:**
- `set-color` - Nastavit RGB barvu
- `fade` - Fade přechod k barvě
- `wait` - Čekat zadanou dobu
- `chase-step` - Jeden krok chase
- `strobe-pulse` - Jeden strobe puls
- `loop-start` - Začátek smyčky
- `loop-end` - Konec smyčky
- `set-intensity` - Nastavit intenzitu
- `rainbow-shift` - Posunout hue
- `random-color` - Náhodná barva
- `pan-tilt` - Nastavit Pan/Tilt

### StepperMotor

Stepper motor s 16-bit pozicováním.

```typescript
interface StepperMotor {
  id: string
  name: string
  dmxAddress: number
  universeId: string
  channelCount: number
  channels: DMXChannel[]
  currentPosition: number
  targetPosition: number
  speed: number
  acceleration: number
  maxSteps: number
}
```

**Properties:**
- `id` - Jedinečný identifikátor
- `name` - Jméno motoru
- `dmxAddress` - Start DMX adresa
- `universeId` - Universe reference
- `channelCount` - Počet kanálů (obvykle 4)
- `channels` - DMX kanály [high byte, low byte, speed, accel]
- `currentPosition` - Aktuální pozice (0-65535)
- `targetPosition` - Cílová pozice (0-65535)
- `speed` - Rychlost (0-255)
- `acceleration` - Zrychlení (0-255)
- `maxSteps` - Maximální počet kroků

**Position calculation:**
```typescript
// Konverze 16-bit pozice na high/low bytes
const highByte = Math.floor(position / 256)
const lowByte = position % 256
```

### Servo

Servomotor s úhlovým pozicováním.

```typescript
interface Servo {
  id: string
  name: string
  dmxAddress: number
  universeId: string
  channelId: string
  currentAngle: number
  targetAngle: number
  minAngle: number
  maxAngle: number
  speed: number
}
```

**Properties:**
- `id` - Jedinečný identifikátor
- `name` - Jméno serva
- `dmxAddress` - DMX adresa
- `universeId` - Universe reference
- `channelId` - DMX channel ID
- `currentAngle` - Aktuální úhel (0-180°)
- `targetAngle` - Cílový úhel (0-180°)
- `minAngle` - Minimální úhel (default 0)
- `maxAngle` - Maximální úhel (default 180)
- `speed` - Rychlost pohybu (0-255)

**Angle to DMX conversion:**
```typescript
const dmxValue = Math.round((angle / 180) * 255)
```

### Universe

DMX universe (512 kanálů).

```typescript
interface Universe {
  id: string
  name: string
  number: number
}
```

**Properties:**
- `id` - Jedinečný identifikátor
- `name` - Jméno universa
- `number` - Číslo universa (1-based)

**Constraints:**
- Maximálně 512 DMX kanálů per universe
- DMX adresy 1-512

## 🎨 Component Props

### ChannelSliderBlock

```typescript
interface ChannelSliderBlockProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  showInput?: boolean
  icon?: ReactNode
  variant?: 'default' | 'compact' | 'large'
  color?: 'primary' | 'accent' | 'secondary'
}
```

### ColorPickerBlock

```typescript
interface ColorPickerBlockProps {
  red: number
  green: number
  blue: number
  white?: number
  onColorChange: (color: RGBColor) => void
  hasWhite?: boolean
  variant?: 'default' | 'compact'
}

interface RGBColor {
  red: number
  green: number
  blue: number
  white?: number
}
```

### ToggleButtonBlock

```typescript
interface ToggleButtonBlockProps {
  label: string
  active: boolean
  onToggle: () => void
  icon?: ReactNode
  activeIcon?: ReactNode
  variant?: 'default' | 'large' | 'minimal'
  disabled?: boolean
  showStatus?: boolean
}
```

### ButtonPadBlock

```typescript
interface ButtonPadBlockProps {
  title?: string
  items: ButtonPadItem[]
  activeId?: string | null
  onItemClick: (id: string) => void
  columns?: 2 | 3 | 4 | 6
  variant?: 'default' | 'compact'
}

interface ButtonPadItem {
  id: string
  label: string
  icon?: ReactNode
  color?: 'default' | 'accent' | 'secondary' | 'destructive'
  badge?: string
}
```

### PositionControlBlock

```typescript
interface PositionControlBlockProps {
  panValue: number
  tiltValue: number
  onPanChange: (value: number) => void
  onTiltChange: (value: number) => void
  title?: string
  showReset?: boolean
  variant?: 'default' | 'compact'
}
```

### IntensityFaderBlock

```typescript
interface IntensityFaderBlockProps {
  value: number
  onChange: (value: number) => void
  label?: string
  variant?: 'default' | 'vertical' | 'compact'
  showPresets?: boolean
}
```

## 🛠️ Utility Functions

### cn (className utility)

Sloučí conditional class names s Tailwind merge.

```typescript
function cn(...inputs: ClassValue[]): string

// Usage:
const className = cn(
  "base-class",
  isActive && "active-class",
  "another-class"
)
```

### DMX value utilities

```typescript
// Validace DMX hodnoty (0-255)
function isValidDMXValue(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 255
}

// Clamp hodnoty do DMX rozsahu
function clampDMX(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)))
}

// 16-bit pozice na DMX bytes
function positionToBytes(position: number): [number, number] {
  const clamped = Math.max(0, Math.min(65535, position))
  return [
    Math.floor(clamped / 256),  // High byte
    clamped % 256                // Low byte
  ]
}

// DMX bytes na 16-bit pozici
function bytesToPosition(high: number, low: number): number {
  return high * 256 + low
}

// Úhel na DMX hodnotu
function angleToDMX(angle: number): number {
  return Math.round((angle / 180) * 255)
}

// DMX hodnota na úhel
function dmxToAngle(dmx: number): number {
  return (dmx / 255) * 180
}
```

### Color utilities

```typescript
// RGB na hex string
function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`
}

// Hex string na RGB
function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}
```

## 🪝 Hooks

### useKV

Persistent key-value storage hook z @github/spark.

```typescript
function useKV<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void]

// Usage:
const [fixtures, setFixtures] = useKV<Fixture[]>('dmx-fixtures', [])

// Data jsou automaticky persistována do IndexedDB
setFixtures([...fixtures, newFixture])
```

## 🔢 Constants

### DMX Constants

```typescript
const DMX_MIN_VALUE = 0
const DMX_MAX_VALUE = 255
const DMX_CHANNELS_PER_UNIVERSE = 512
const DMX_MIN_ADDRESS = 1
const DMX_MAX_ADDRESS = 512
```

### Effect Constants

```typescript
const MIN_EFFECT_SPEED = 0
const MAX_EFFECT_SPEED = 100
const MIN_EFFECT_INTENSITY = 0
const MAX_EFFECT_INTENSITY = 100
const DEFAULT_EFFECT_SPEED = 50
const DEFAULT_EFFECT_INTENSITY = 100
```

### Motor Constants

```typescript
const STEPPER_MIN_POSITION = 0
const STEPPER_MAX_POSITION = 65535
const SERVO_MIN_ANGLE = 0
const SERVO_MAX_ANGLE = 180
const DEFAULT_MOTOR_SPEED = 128
```

## 📊 Type Guards

```typescript
// Type guard pro fixture type
function isRGBFixture(fixture: Fixture): boolean {
  return fixture.fixtureType === 'rgb' || fixture.fixtureType === 'rgbw'
}

function isMovingHead(fixture: Fixture): boolean {
  return fixture.fixtureType === 'moving-head'
}

// Type guard pro effect type
function isBlockProgramEffect(effect: Effect): effect is Effect & { blocks: EffectBlock[] } {
  return effect.type === 'block-program' && Array.isArray(effect.blocks)
}
```

## 🔄 Event Types

### Channel change event

```typescript
type ChannelChangeHandler = (channelId: string, value: number) => void

// Usage:
const handleChannelChange: ChannelChangeHandler = (channelId, value) => {
  // Update channel value
}
```

### Scene activation event

```typescript
type SceneActivationHandler = (sceneId: string) => void

// Usage:
const handleSceneActivate: SceneActivationHandler = (sceneId) => {
  // Apply scene
}
```

### Effect toggle event

```typescript
type EffectToggleHandler = (effectId: string, isActive: boolean) => void

// Usage:
const handleEffectToggle: EffectToggleHandler = (effectId, isActive) => {
  // Start/stop effect
}
```

## 📚 Further Reading

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Architecture Documentation](./ARCHITECTURE.md)

---

**API Reference pro DMX 512 Kontrolér**  
Poslední aktualizace: 2024
