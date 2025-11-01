# Data Structures - Datové Struktury

Definice všech společných datových struktur používaných napříč systémem.

## Core Entities

### Universe

DMX universe s 512 kanály.

```typescript
interface Universe {
  id: string;                    // Unique ID "universe-1"
  name: string;                  // "Main Stage"
  number: number;                // 1-32767 (Art-Net), 1-63999 (sACN)
  channels: number[];            // Array[512] hodnot 0-255
  enabled: boolean;              // Je aktivní?
  outputMode: 'artnet' | 'sacn' | 'usb';
  ipAddress?: string;            // Pro unicast
  refreshRate: number;           // Hz (default 40)
}
```

**C++ Equivalent:**
```cpp
struct DMXUniverse {
  char id[32];
  char name[64];
  uint16_t number;
  uint8_t channels[512];
  bool enabled;
  uint8_t outputMode;
  char ipAddress[16];
  uint8_t refreshRate;
};
```

### Fixture

Světelné svítidlo nebo device.

```typescript
interface Fixture {
  id: string;                    // "fixture-001"
  name: string;                  // "PAR LED 1"
  universeId: string;            // "universe-1"
  address: number;               // 1-512 (DMX start address)
  channels: number;              // Počet kanálů (3=RGB, 7=RGBW+dimmer, atd.)
  type: FixtureType;
  personality?: string;          // "7-channel mode"
  manufacturer?: string;         // "Chauvet"
  model?: string;                // "SlimPAR 64"
}

type FixtureType = 
  | 'rgb'
  | 'rgbw'
  | 'rgba'
  | 'dimmer'
  | 'moving-head'
  | 'par'
  | 'wash'
  | 'spot'
  | 'strobe'
  | 'laser'
  | 'custom';
```

**C++ Equivalent:**
```cpp
enum FixtureType {
  FIX_RGB = 0,
  FIX_RGBW = 1,
  FIX_DIMMER = 2,
  FIX_MOVING_HEAD = 3,
  FIX_CUSTOM = 99
};

struct Fixture {
  char id[32];
  char name[64];
  char universeId[32];
  uint16_t address;
  uint8_t channels;
  uint8_t type;
};
```

### Scene

Uložený stav všech kanálů.

```typescript
interface Scene {
  id: string;                    // "scene-001"
  name: string;                  // "Opening Look"
  description?: string;          // Popis scény
  state: SceneState;             // Hodnoty kanálů
  fadeTime?: number;             // ms (default 0)
  created: number;               // Unix timestamp
  modified: number;              // Unix timestamp
  tags?: string[];               // ["show1", "act1"]
}

interface SceneState {
  [universeId: string]: number[];  // {"universe-1": [255, 128, 0, ...]}
}
```

**C++ Equivalent:**
```cpp
struct Scene {
  char id[32];
  char name[64];
  uint16_t fadeTime;
  uint32_t created;
  uint32_t modified;
  // Note: State stored separately in memory
};

struct SceneState {
  uint8_t universeData[4][512];  // Max 4 universes
  uint8_t activeUniverses;
};
```

### Effect

Automatizovaný efekt.

```typescript
interface Effect {
  id: string;                    // "effect-001"
  name: string;                  // "Rainbow Chase"
  type: EffectType;
  speed: number;                 // 0-100 (%)
  intensity: number;             // 0-100 (%)
  fixtures: string[];            // IDs svítidel
  running: boolean;
  parameters?: EffectParameters; // Specifické parametry
}

type EffectType = 
  | 'chase'
  | 'strobe'
  | 'rainbow'
  | 'fade'
  | 'sweep'
  | 'pulse'
  | 'sparkle'
  | 'custom';

interface EffectParameters {
  [key: string]: number | string | boolean;
  // Např: { "direction": "forward", "size": 5 }
}
```

**C++ Equivalent:**
```cpp
enum EffectType {
  EFF_CHASE = 0,
  EFF_STROBE = 1,
  EFF_RAINBOW = 2,
  EFF_FADE = 3,
  EFF_SWEEP = 4
};

struct Effect {
  char id[32];
  char name[64];
  uint8_t type;
  uint8_t speed;           // 0-100
  uint8_t intensity;       // 0-100
  bool running;
  uint8_t fixtureCount;
  uint16_t fixtures[32];   // Max 32 fixtures
};
```

### StepperMotor

Krokový motor s pozicí.

```typescript
interface StepperMotor {
  id: string;                    // "motor-001"
  name: string;                  // "Pan Motor"
  universeId: string;
  address: number;               // DMX start (needs 3-4 channels)
  position: number;              // 0-65535 (16-bit)
  targetPosition: number;        // Cílová pozice
  speed: number;                 // 0-255
  maxSteps: number;              // Max pozice (např. 10000)
  stepsPerRevolution: number;    // 200, 400, atd.
  acceleration: number;          // Steps/s²
  homed: boolean;                // Je v home pozici?
}
```

**C++ Equivalent:**
```cpp
struct StepperMotor {
  char id[32];
  char name[64];
  uint16_t address;
  uint16_t position;
  uint16_t targetPosition;
  uint8_t speed;
  uint16_t maxSteps;
  uint16_t stepsPerRev;
  uint16_t acceleration;
  bool homed;
};
```

### Servo

Servo motor s úhlem.

```typescript
interface Servo {
  id: string;                    // "servo-001"
  name: string;                  // "Tilt Servo"
  universeId: string;
  address: number;               // DMX channel (1 channel)
  angle: number;                 // 0-180 degrees
  minPulse: number;              // μs (default 544)
  maxPulse: number;              // μs (default 2400)
  trim: number;                  // -20 to +20 degrees offset
}
```

**C++ Equivalent:**
```cpp
struct Servo {
  char id[32];
  char name[64];
  uint16_t address;
  uint8_t angle;           // 0-180
  uint16_t minPulse;
  uint16_t maxPulse;
  int8_t trim;             // -20 to +20
};
```

## Network Entities

### Node

Hardware node (ESP32, Portenta, atd.).

```typescript
interface Node {
  id: string;                    // "esp32-001"
  name: string;                  // "Main DMX Node"
  type: NodeType;
  ipAddress: string;             // "192.168.1.100"
  macAddress?: string;           // "AA:BB:CC:DD:EE:FF"
  universes: number[];           // [1, 2] - které universes obsluhuje
  online: boolean;
  lastSeen: number;              // Unix timestamp
  firmwareVersion: string;       // "1.2.3"
  capabilities: NodeCapabilities;
}

type NodeType = 
  | 'esp32'
  | 'portenta'
  | 'receiver'
  | 'server'
  | 'app'
  | 'unknown';

interface NodeCapabilities {
  maxUniverses: number;          // Max počet universes
  hasMotorControl: boolean;
  hasWebInterface: boolean;
  supportsOTA: boolean;
  supportedProtocols: ('artnet' | 'sacn' | 'dmx')[];
}
```

**C++ Equivalent:**
```cpp
enum NodeType {
  NODE_ESP32 = 0,
  NODE_PORTENTA = 1,
  NODE_RECEIVER = 2
};

struct Node {
  char id[32];
  char name[64];
  uint8_t type;
  uint8_t ipAddress[4];
  uint8_t macAddress[6];
  uint8_t universes[4];
  uint8_t universeCount;
  bool online;
  uint32_t lastSeen;
  char firmwareVersion[16];
};
```

### Connection Profile

Profil připojení pro rychlé přepnutí.

```typescript
interface ConnectionProfile {
  id: string;                    // "profile-001"
  name: string;                  // "Home Studio"
  protocol: 'artnet' | 'sacn' | 'usb';
  ipAddress?: string;            // Pro unicast
  port?: number;                 // Custom port
  universe: number;              // Default universe
  autoConnect: boolean;
  sendRate: number;              // Hz (40-44)
}
```

## Configuration

### AppSettings

Nastavení aplikace.

```typescript
interface AppSettings {
  defaultUniverse: number;
  defaultProtocol: 'artnet' | 'sacn';
  defaultSendRate: number;       // Hz
  autoConnect: boolean;
  showAdvancedOptions: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'cs';
  hapticFeedback: boolean;
  dmxTimeout: number;            // ms
}
```

### NodeConfig

Konfigurace hardware node.

```typescript
interface NodeConfig {
  nodeId: string;
  nodeName: string;
  wifiSSID: string;
  wifiPassword: string;          // Encrypted
  universe: number;
  protocol: 'artnet' | 'sacn';
  ipMode: 'dhcp' | 'static';
  staticIP?: string;
  staticMask?: string;
  staticGateway?: string;
  dmxBreakTime: number;          // μs (default 100)
  dmxMABTime: number;            // μs (default 12)
}
```

**C++ Equivalent:**
```cpp
struct NodeConfig {
  char nodeId[32];
  char nodeName[64];
  char wifiSSID[32];
  char wifiPassword[64];
  uint16_t universe;
  uint8_t protocol;
  uint8_t ipMode;
  uint8_t staticIP[4];
  uint16_t dmxBreakTime;
  uint16_t dmxMABTime;
};
```

## Validation Rules

### Value Ranges

```typescript
const VALIDATION = {
  universe: { min: 1, max: 32767 },      // Art-Net
  universeE131: { min: 1, max: 63999 },  // sACN
  channel: { min: 1, max: 512 },
  dmxValue: { min: 0, max: 255 },
  motorPosition: { min: 0, max: 65535 },
  servoAngle: { min: 0, max: 180 },
  percentage: { min: 0, max: 100 },
  fadeTime: { min: 0, max: 60000 },      // ms
  refreshRate: { min: 1, max: 44 },      // Hz
};
```

### String Lengths

```typescript
const STRING_LIMITS = {
  id: { min: 1, max: 32 },
  name: { min: 1, max: 64 },
  description: { max: 256 },
  ipAddress: { exact: 15 },              // "xxx.xxx.xxx.xxx"
  macAddress: { exact: 17 },             // "XX:XX:XX:XX:XX:XX"
};
```

## Type Conversion Helpers

### DMX Value Conversion

```typescript
// Percentage (0-100) to DMX (0-255)
function percentToDMX(percent: number): number {
  return Math.round((percent / 100) * 255);
}

// DMX (0-255) to Percentage (0-100)
function dmxToPercent(dmx: number): number {
  return Math.round((dmx / 255) * 100);
}

// 16-bit position to DMX (2 channels: high byte, low byte)
function positionToDMX(position: number): [number, number] {
  const high = (position >> 8) & 0xFF;
  const low = position & 0xFF;
  return [high, low];
}

// DMX (2 channels) to 16-bit position
function dmxToPosition(high: number, low: number): number {
  return (high << 8) | low;
}

// Servo angle (0-180°) to DMX (0-255)
function angleToDMX(angle: number): number {
  return Math.round((angle / 180) * 255);
}

// DMX (0-255) to servo angle (0-180°)
function dmxToAngle(dmx: number): number {
  return Math.round((dmx / 255) * 180);
}
```

**C++ Equivalent:**
```cpp
uint8_t percentToDMX(uint8_t percent) {
  return (percent * 255) / 100;
}

uint8_t dmxToPercent(uint8_t dmx) {
  return (dmx * 100) / 255;
}

void positionToDMX(uint16_t position, uint8_t* high, uint8_t* low) {
  *high = (position >> 8) & 0xFF;
  *low = position & 0xFF;
}

uint16_t dmxToPosition(uint8_t high, uint8_t low) {
  return ((uint16_t)high << 8) | low;
}

uint8_t angleToDMX(uint8_t angle) {
  return (angle * 255) / 180;
}

uint8_t dmxToAngle(uint8_t dmx) {
  return (dmx * 180) / 255;
}
```
