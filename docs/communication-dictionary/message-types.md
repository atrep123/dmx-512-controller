# Message Types - Typy Zpráv

Definice všech typů zpráv používaných v DMX-512 Controller systému.

## Základní Message Wrapper

Všechny zprávy jsou zabaleny v tomto formátu:

```typescript
{
  "version": "1.0.0",           // Verze protokolu
  "type": "command" | "status" | "event",
  "timestamp": 1635789012345,   // Unix timestamp (ms)
  "payload": {...}              // Specifické data
}
```

## Command Messages - Příkazy

### SetChannel

Nastaví hodnotu jednoho DMX kanálu.

```typescript
{
  "type": "command",
  "payload": {
    "command": "setChannel",
    "universe": 1,              // 1-32767
    "channel": 1,               // 1-512
    "value": 255                // 0-255
  }
}
```

### SetChannels

Nastaví hodnoty více DMX kanálů najednou.

```typescript
{
  "type": "command",
  "payload": {
    "command": "setChannels",
    "universe": 1,
    "startChannel": 1,
    "values": [255, 128, 0, ...]  // Array hodnot
  }
}
```

### RecallScene

Vyvolá uloženou scénu.

```typescript
{
  "type": "command",
  "payload": {
    "command": "recallScene",
    "sceneId": "scene-123",
    "fadeTime": 1000            // ms (volitelné)
  }
}
```

### StartEffect

Spustí efekt.

```typescript
{
  "type": "command",
  "payload": {
    "command": "startEffect",
    "effectId": "effect-456",
    "speed": 50,                // 0-100
    "intensity": 75             // 0-100
  }
}
```

### StopEffect

Zastaví efekt.

```typescript
{
  "type": "command",
  "payload": {
    "command": "stopEffect",
    "effectId": "effect-456"
  }
}
```

### SetMotorPosition

Nastaví pozici krokového motoru.

```typescript
{
  "type": "command",
  "payload": {
    "command": "setMotorPosition",
    "motorId": "motor-001",
    "position": 10000,          // 0-65535 (16-bit)
    "speed": 200                // 0-255 (volitelné)
  }
}
```

### SetServoAngle

Nastaví úhel serva.

```typescript
{
  "type": "command",
  "payload": {
    "command": "setServoAngle",
    "servoId": "servo-001",
    "angle": 90                 // 0-180 degrees
  }
}
```

### ConfigureUniverse

Konfiguruje DMX universe.

```typescript
{
  "type": "command",
  "payload": {
    "command": "configureUniverse",
    "universeId": "universe-1",
    "number": 1,
    "enabled": true,
    "outputMode": "artnet" | "sacn" | "usb"
  }
}
```

## Status Messages - Stavové Zprávy

### UniverseStatus

Stav DMX universe.

```typescript
{
  "type": "status",
  "payload": {
    "universeId": "universe-1",
    "number": 1,
    "enabled": true,
    "frameRate": 42.5,          // Hz
    "lastUpdate": 1635789012345,
    "channelCount": 512,
    "activeChannels": 48        // Kanály != 0
  }
}
```

### NodeStatus

Stav hardware node.

```typescript
{
  "type": "status",
  "payload": {
    "nodeId": "esp32-001",
    "nodeType": "esp32" | "portenta" | "receiver",
    "online": true,
    "ipAddress": "192.168.1.100",
    "universes": [1, 2],
    "uptime": 3600000,          // ms
    "cpuUsage": 45.2,           // %
    "memoryUsage": 60.5,        // %
    "temperature": 45.0         // °C
  }
}
```

### SystemStatus

Celkový stav systému.

```typescript
{
  "type": "status",
  "payload": {
    "connected": true,
    "clientCount": 3,
    "universeCount": 4,
    "fixtureCount": 24,
    "activeEffects": 2,
    "timestamp": 1635789012345
  }
}
```

## Event Messages - Události

### SceneRecalled

Scéna byla vyvolána.

```typescript
{
  "type": "event",
  "payload": {
    "event": "sceneRecalled",
    "sceneId": "scene-123",
    "sceneName": "Opening Look",
    "userId": "user-456"        // Kdo vyvolal (volitelné)
  }
}
```

### EffectStarted

Efekt byl spuštěn.

```typescript
{
  "type": "event",
  "payload": {
    "event": "effectStarted",
    "effectId": "effect-456",
    "effectName": "Rainbow Chase",
    "fixtures": ["fixture-1", "fixture-2"]
  }
}
```

### EffectStopped

Efekt byl zastaven.

```typescript
{
  "type": "event",
  "payload": {
    "event": "effectStopped",
    "effectId": "effect-456",
    "reason": "manual" | "auto" | "error"
  }
}
```

### ClientConnected

Klient se připojil.

```typescript
{
  "type": "event",
  "payload": {
    "event": "clientConnected",
    "clientId": "client-789",
    "userAgent": "DMX Controller Android/1.0",
    "ipAddress": "192.168.1.50"
  }
}
```

### ClientDisconnected

Klient se odpojil.

```typescript
{
  "type": "event",
  "payload": {
    "event": "clientDisconnected",
    "clientId": "client-789",
    "reason": "normal" | "timeout" | "error"
  }
}
```

### NodeDiscovered

Nový hardware node byl objeven.

```typescript
{
  "type": "event",
  "payload": {
    "event": "nodeDiscovered",
    "nodeId": "esp32-002",
    "nodeType": "esp32",
    "ipAddress": "192.168.1.101",
    "universes": [3]
  }
}
```

### NodeOffline

Hardware node je offline.

```typescript
{
  "type": "event",
  "payload": {
    "event": "nodeOffline",
    "nodeId": "esp32-001",
    "lastSeen": 1635789012345
  }
}
```

### ChannelUpdated

DMX kanál byl aktualizován (broadcast všem klientům).

```typescript
{
  "type": "event",
  "payload": {
    "event": "channelUpdated",
    "universe": 1,
    "channel": 1,
    "value": 255,
    "source": "manual" | "scene" | "effect"
  }
}
```

### ErrorOccurred

Došlo k chybě.

```typescript
{
  "type": "event",
  "payload": {
    "event": "errorOccurred",
    "errorCode": "DMX_TIMEOUT",
    "errorMessage": "DMX signal lost on universe 1",
    "severity": "warning" | "error" | "critical",
    "timestamp": 1635789012345
  }
}
```

## Binary Messages (Art-Net/sACN)

### Art-Net DMX Packet

```
Header (18 bytes):
  ID[8]: "Art-Net\0"
  OpCode[2]: 0x5000 (little-endian)
  ProtVer[2]: 14 (big-endian)
  Sequence[1]: 0-255 (packet sequence)
  Physical[1]: 0 (physical port)
  Universe[2]: 0-32767 (little-endian)
  Length[2]: 512 (big-endian, length of data)

Data (512 bytes):
  DMX channels 1-512 (0-255 each)
```

### sACN (E1.31) Packet

```
Root Layer (38 bytes):
  Preamble Size[2]: 0x0010
  Postamble Size[2]: 0x0000
  ACN Packet Identifier[12]: ASC-E1.17
  Flags and Length[2]: 0x7000 + length
  Vector[4]: 0x00000004
  CID[16]: UUID

Framing Layer (77 bytes):
  Flags and Length[2]
  Vector[4]: 0x00000002
  Source Name[64]: UTF-8 string
  Priority[1]: 0-200
  Sync Address[2]: 0
  Sequence Number[1]: 0-255
  Options[1]: 0
  Universe[2]: 1-63999

DMP Layer (11 + 512 bytes):
  Flags and Length[2]
  Vector[1]: 0x02
  Address Type and Data Type[1]: 0xA1
  First Property Address[2]: 0x0000
  Address Increment[2]: 0x0001
  Property Value Count[2]: 513
  Start Code[1]: 0x00
  DMX Data[512]: channels 1-512
```

## C++ Equivalent

```cpp
// Command structure
struct DMXCommand {
  uint8_t type;         // CMD_SET_CHANNEL, etc.
  uint16_t universe;
  uint16_t channel;
  uint8_t value;
  uint32_t timestamp;
};

// Status structure
struct NodeStatus {
  char nodeId[32];
  uint8_t nodeType;
  bool online;
  uint32_t uptime;
  float cpuUsage;
  float memoryUsage;
};

// Event structure
struct DMXEvent {
  uint8_t eventType;    // EVENT_SCENE_RECALLED, etc.
  char id[32];
  uint32_t timestamp;
  uint8_t data[128];    // Event-specific data
};
```

## Message Ordering

1. Commands jsou processed immediately
2. Status updates jsou sent periodically (1-10 Hz)
3. Events jsou broadcast immediately při vzniku
4. DMX data jsou sent at frame rate (40-44 Hz)

## Error Handling

Když zpráva obsahuje chybu:

```typescript
{
  "type": "error",
  "payload": {
    "errorCode": "INVALID_CHANNEL",
    "errorMessage": "Channel 513 is out of range (1-512)",
    "originalMessage": {...}    // Původní zpráva
  }
}
```
