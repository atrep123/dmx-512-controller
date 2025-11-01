# Protocol Constants - Protokolové Konstanty

Všechny konstanty používané napříč systémem.

## DMX-512 Constants

```typescript
const DMX = {
  // Channel specifications
  CHANNELS_PER_UNIVERSE: 512,
  CHANNEL_MIN: 1,
  CHANNEL_MAX: 512,
  VALUE_MIN: 0,
  VALUE_MAX: 255,
  
  // Timing (microseconds)
  BREAK_MIN: 88,
  BREAK_TYP: 100,
  BREAK_MAX: 120,
  MAB_MIN: 8,
  MAB_TYP: 12,
  MAB_MAX: 16,
  
  // Communication
  BAUD_RATE: 250000,           // 250 kbaud
  FRAME_RATE_MIN: 1,           // Hz
  FRAME_RATE_MAX: 44,          // Hz
  FRAME_RATE_TYPICAL: 40,      // Hz
  FRAME_TIME_MS: 25,           // ms @ 40Hz
  
  // Start codes
  START_CODE_DMX: 0x00,
  START_CODE_RDM: 0xCC,
  START_CODE_TEST: 0x55,
} as const;
```

**C++ Equivalent:**
```cpp
#define DMX_CHANNELS_PER_UNIVERSE 512
#define DMX_CHANNEL_MIN 1
#define DMX_CHANNEL_MAX 512
#define DMX_VALUE_MIN 0
#define DMX_VALUE_MAX 255

#define DMX_BREAK_MIN 88
#define DMX_BREAK_TYP 100
#define DMX_MAB_MIN 8
#define DMX_MAB_TYP 12

#define DMX_BAUD_RATE 250000
#define DMX_FRAME_RATE 40

#define DMX_START_CODE_DMX 0x00
#define DMX_START_CODE_RDM 0xCC
```

## Art-Net Constants

```typescript
const ARTNET = {
  // Protocol
  PROTOCOL_VERSION: 14,
  HEADER_ID: 'Art-Net\0',
  
  // Network
  PORT: 6454,
  BROADCAST_IP: '255.255.255.255',
  
  // OpCodes
  OPCODE_POLL: 0x2000,
  OPCODE_POLL_REPLY: 0x2100,
  OPCODE_DMX: 0x5000,
  OPCODE_SYNC: 0x5200,
  OPCODE_ADDRESS: 0x6000,
  
  // Universe
  UNIVERSE_MIN: 0,
  UNIVERSE_MAX: 32767,
  
  // Packet sizes
  HEADER_SIZE: 18,
  DMX_DATA_SIZE: 512,
  PACKET_SIZE: 530,          // Header + Data
  
  // Timing
  POLL_INTERVAL_MS: 2500,     // Send ArtPoll every 2.5s
  TIMEOUT_MS: 10000,          // Node timeout after 10s
} as const;
```

**C++ Equivalent:**
```cpp
#define ARTNET_PROTOCOL_VERSION 14
#define ARTNET_PORT 6454

#define ARTNET_OPCODE_POLL 0x2000
#define ARTNET_OPCODE_POLL_REPLY 0x2100
#define ARTNET_OPCODE_DMX 0x5000
#define ARTNET_OPCODE_SYNC 0x5200

#define ARTNET_UNIVERSE_MIN 0
#define ARTNET_UNIVERSE_MAX 32767

#define ARTNET_HEADER_SIZE 18
#define ARTNET_PACKET_SIZE 530
```

## sACN (E1.31) Constants

```typescript
const SACN = {
  // Protocol
  PROTOCOL_VERSION: 'E1.31-2018',
  ACN_IDENTIFIER: 'ASC-E1.17',
  
  // Network
  PORT: 5568,
  MULTICAST_BASE: '239.255.0.0',
  MULTICAST_MASK: '255.255.0.0',
  
  // Universe
  UNIVERSE_MIN: 1,
  UNIVERSE_MAX: 63999,
  
  // Priority
  PRIORITY_MIN: 0,
  PRIORITY_MAX: 200,
  PRIORITY_DEFAULT: 100,
  
  // Packet structure
  ROOT_LAYER_SIZE: 38,
  FRAMING_LAYER_SIZE: 77,
  DMP_LAYER_SIZE: 11,
  PREAMBLE_SIZE: 0x0010,
  
  // Timing
  TIMEOUT_MS: 2500,           // Source timeout
  HOLD_LAST_MS: 3000,         // Hold last look
} as const;
```

**C++ Equivalent:**
```cpp
#define SACN_PORT 5568
#define SACN_MULTICAST_BASE "239.255.0.0"

#define SACN_UNIVERSE_MIN 1
#define SACN_UNIVERSE_MAX 63999

#define SACN_PRIORITY_MIN 0
#define SACN_PRIORITY_MAX 200
#define SACN_PRIORITY_DEFAULT 100
```

## WebSocket Constants

```typescript
const WEBSOCKET = {
  // Protocol
  PROTOCOL_VERSION: '1.0.0',
  
  // Heartbeat
  HEARTBEAT_INTERVAL_MS: 30000,    // 30 seconds
  HEARTBEAT_TIMEOUT_MS: 60000,     // 1 minute
  
  // Reconnection
  RECONNECT_DELAY_MIN_MS: 1000,    // 1 second
  RECONNECT_DELAY_MAX_MS: 30000,   // 30 seconds
  RECONNECT_MAX_ATTEMPTS: 10,
  
  // Message size
  MAX_MESSAGE_SIZE: 65536,         // 64 KB
  
  // Close codes (standard + custom)
  CLOSE_NORMAL: 1000,
  CLOSE_GOING_AWAY: 1001,
  CLOSE_PROTOCOL_ERROR: 1002,
  CLOSE_INVALID_DATA: 1003,
  CLOSE_AUTH_FAILED: 4001,         // Custom
  CLOSE_RATE_LIMIT: 4002,          // Custom
} as const;
```

## Hardware Limits

```typescript
const HARDWARE = {
  // ESP32
  ESP32_MAX_UNIVERSES: 2,
  ESP32_MAX_MEMORY_KB: 320,
  ESP32_UART_COUNT: 3,
  
  // Portenta H7
  PORTENTA_MAX_UNIVERSES: 4,
  PORTENTA_MAX_MEMORY_MB: 8,
  PORTENTA_UART_COUNT: 4,
  PORTENTA_CORES: 2,
  
  // Motors
  MAX_STEPPERS: 4,
  MAX_SERVOS: 8,
  SERVO_ANGLE_MIN: 0,
  SERVO_ANGLE_MAX: 180,
  STEPPER_POSITION_MAX: 65535,
  
  // General
  MAX_FIXTURES_PER_UNIVERSE: 100,  // Practical limit
  MAX_EFFECTS: 10,                 // Simultaneous
  MAX_SCENES: 100,
} as const;
```

**C++ Equivalent:**
```cpp
#define ESP32_MAX_UNIVERSES 2
#define PORTENTA_MAX_UNIVERSES 4

#define MAX_STEPPERS 4
#define MAX_SERVOS 8
#define SERVO_ANGLE_MIN 0
#define SERVO_ANGLE_MAX 180
#define STEPPER_POSITION_MAX 65535
```

## Configuration Limits

```typescript
const CONFIG = {
  // String lengths
  ID_MAX_LENGTH: 32,
  NAME_MAX_LENGTH: 64,
  DESCRIPTION_MAX_LENGTH: 256,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 64,
  
  // Network
  IP_ADDRESS_LENGTH: 15,         // "xxx.xxx.xxx.xxx"
  MAC_ADDRESS_LENGTH: 17,        // "XX:XX:XX:XX:XX:XX"
  HOSTNAME_MAX_LENGTH: 63,
  
  // Timeouts
  CONNECTION_TIMEOUT_MS: 5000,
  REQUEST_TIMEOUT_MS: 10000,
  DEFAULT_FADE_TIME_MS: 1000,
  MAX_FADE_TIME_MS: 60000,
  
  // Storage
  MAX_LOG_ENTRIES: 1000,
  MAX_HISTORY_DAYS: 30,
  BACKUP_INTERVAL_HOURS: 24,
} as const;
```

## Effect Parameters

```typescript
const EFFECTS = {
  // Speed (0-100 → actual timing)
  SPEED_MIN_MS: 50,              // Speed 100 = 50ms per step
  SPEED_MAX_MS: 5000,            // Speed 0 = 5000ms per step
  
  // Chase
  CHASE_MIN_SIZE: 1,
  CHASE_MAX_SIZE: 50,
  
  // Strobe
  STROBE_MIN_HZ: 1,
  STROBE_MAX_HZ: 25,
  
  // Rainbow
  RAINBOW_STEPS: 360,            // 360° color wheel
  
  // Fade
  FADE_STEPS: 100,
} as const;
```

## Network Timeouts

```typescript
const TIMEOUTS = {
  // DMX
  DMX_SIGNAL_TIMEOUT_MS: 2000,
  DMX_FRAME_TIMEOUT_MS: 50,
  
  // Art-Net
  ARTNET_NODE_TIMEOUT_MS: 10000,
  ARTNET_POLL_INTERVAL_MS: 2500,
  
  // sACN
  SACN_SOURCE_TIMEOUT_MS: 2500,
  SACN_HOLD_LAST_MS: 3000,
  
  // WebSocket
  WS_PING_INTERVAL_MS: 30000,
  WS_PONG_TIMEOUT_MS: 5000,
  
  // HTTP
  HTTP_REQUEST_TIMEOUT_MS: 10000,
  HTTP_LONG_POLL_TIMEOUT_MS: 60000,
  
  // General
  FAILSAFE_TIMEOUT_MS: 2000,
  WATCHDOG_TIMEOUT_MS: 5000,
} as const;
```

## Status Codes (HTTP-like)

```typescript
const STATUS = {
  // Success 2xx
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // Client errors 4xx
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  TOO_MANY_REQUESTS: 429,
  
  // Server errors 5xx
  INTERNAL_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503,
  TIMEOUT: 504,
} as const;
```

## Color Constants

```typescript
const COLORS = {
  // RGB presets
  BLACK: [0, 0, 0],
  WHITE: [255, 255, 255],
  RED: [255, 0, 0],
  GREEN: [0, 255, 0],
  BLUE: [0, 0, 255],
  YELLOW: [255, 255, 0],
  CYAN: [0, 255, 255],
  MAGENTA: [255, 0, 255],
  
  // Gamma correction
  GAMMA: 2.2,
} as const;
```

**C++ Equivalent:**
```cpp
const uint8_t COLOR_BLACK[3] = {0, 0, 0};
const uint8_t COLOR_WHITE[3] = {255, 255, 255};
const uint8_t COLOR_RED[3] = {255, 0, 0};
const uint8_t COLOR_GREEN[3] = {0, 255, 0};
const uint8_t COLOR_BLUE[3] = {0, 0, 255};

#define GAMMA_CORRECTION 2.2
```

## Version Numbers

```typescript
const VERSION = {
  PROTOCOL_VERSION: '1.0.0',
  API_VERSION: '1.0.0',
  MIN_COMPATIBLE_VERSION: '1.0.0',
} as const;
```

## Feature Flags

```typescript
const FEATURES = {
  // Optional features
  ENABLE_RDM: false,
  ENABLE_SMPTE: false,
  ENABLE_AUDIO_REACTIVE: false,
  ENABLE_CLOUD_SYNC: false,
  
  // Debug
  DEBUG_MODE: false,
  VERBOSE_LOGGING: false,
} as const;
```

## Usage Example

### TypeScript
```typescript
import { DMX, ARTNET, SACN } from '@dmx-controller/protocol';

// Validate channel
if (channel < DMX.CHANNEL_MIN || channel > DMX.CHANNEL_MAX) {
  throw new Error(`Invalid channel: ${channel}`);
}

// Create Art-Net packet
const packet = {
  port: ARTNET.PORT,
  opCode: ARTNET.OPCODE_DMX,
  universe: 1,
  // ...
};
```

### C++
```cpp
#include "dmx_constants.h"

// Validate channel
if (channel < DMX_CHANNEL_MIN || channel > DMX_CHANNEL_MAX) {
  return ERR_INVALID_CHANNEL;
}

// Send Art-Net
sendUDP(ARTNET_PORT, packet, ARTNET_PACKET_SIZE);
```
