# DMX-512 Controller - Protocol Package

Shared protocol definitions and communication specifications for all DMX-512 controller components.

## 📦 Overview

This package contains the protocol specifications, message schemas, and type definitions used by all components of the DMX-512 controller system. It ensures consistent communication between the Android app, server, and hardware nodes (ESP32, Portenta, DMX receivers).

## 🎯 Purpose

- **Standardization**: Common data structures across all components
- **Type Safety**: TypeScript definitions for compile-time checking
- **Documentation**: Protocol specifications and message formats
- **Interoperability**: Ensures all nodes can communicate effectively

## 📋 Contents

### Protocol Specifications

- **DMX-512 Standard**: DMX512-A specification compliance
- **Art-Net**: Art-Net 4 protocol implementation
- **sACN (E1.31)**: Streaming ACN protocol
- **Custom Control Protocol**: Inter-component communication

### Data Structures

- **Universes**: DMX universe definitions (512 channels each)
- **Fixtures**: Lighting fixture profiles and channel mappings
- **Scenes**: Complete state snapshots
- **Effects**: Automated effect definitions
- **Commands**: Control messages between components

## 🏗️ Structure

```
protocol/
├── src/
│   ├── dmx/              # DMX-512 protocol definitions
│   │   ├── universe.ts   # Universe structure
│   │   ├── channels.ts   # Channel definitions
│   │   └── timing.ts     # DMX timing specifications
│   ├── network/          # Network protocol definitions
│   │   ├── artnet.ts     # Art-Net protocol
│   │   ├── sacn.ts       # sACN protocol
│   │   └── discovery.ts  # Node discovery
│   ├── messages/         # Message schemas
│   │   ├── commands.ts   # Control commands
│   │   ├── status.ts     # Status messages
│   │   └── events.ts     # Event notifications
│   ├── types/            # TypeScript type definitions
│   │   ├── fixtures.ts   # Fixture types
│   │   ├── effects.ts    # Effect types
│   │   ├── motors.ts     # Motor types
│   │   └── scenes.ts     # Scene types
│   └── index.ts          # Main exports
├── docs/                 # Protocol documentation
│   ├── DMX512.md        # DMX-512 specification
│   ├── ArtNet.md        # Art-Net details
│   ├── sACN.md          # sACN details
│   └── CustomProtocol.md # Custom protocol spec
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Installation

```bash
# Install as a dependency in other packages
npm install @dmx-controller/protocol

# Or for local development
cd packages/protocol
npm install
```

## 📝 Usage

### In TypeScript/JavaScript Projects

```typescript
import {
  Universe,
  Fixture,
  Scene,
  ArtNetPacket,
  DMXChannel
} from '@dmx-controller/protocol';

// Define a universe
const universe: Universe = {
  id: 'universe-1',
  name: 'Main Stage',
  number: 1,
  channels: new Array(512).fill(0)
};

// Define a fixture
const fixture: Fixture = {
  id: 'fixture-1',
  name: 'LED PAR',
  universeId: 'universe-1',
  address: 1,
  channels: 7,
  type: 'rgb-dimmer'
};

// Create Art-Net packet
const packet: ArtNetPacket = {
  opCode: 0x5000,
  protocolVersion: 14,
  sequence: 0,
  physical: 0,
  universe: 0,
  data: universe.channels
};
```

### In C++ (for embedded nodes)

```cpp
#include "dmx_protocol.h"

// DMX universe structure
DMXUniverse universe;
universe.number = 1;
universe.channelCount = 512;

// Fixture definition
Fixture fixture = {
  .id = 1,
  .address = 1,
  .channelCount = 7,
  .type = FIXTURE_TYPE_RGB_DIMMER
};

// Set channel value
setChannelValue(&universe, 1, 255);
```

## 📚 Protocol Details

### DMX-512 Specification

- **Channels**: 512 per universe (1-512)
- **Data Format**: 8-bit (0-255)
- **Timing**: 
  - Break: min 88μs
  - Mark After Break: min 8μs
  - Baud Rate: 250 kbaud
- **Frame Rate**: ~44 Hz maximum

### Art-Net

- **Version**: Art-Net 4
- **Port**: UDP 6454
- **Universe Range**: 0-32767
- **Packet Size**: 530 bytes (18 header + 512 data)

### sACN (E1.31)

- **Version**: E1.31-2018
- **Port**: UDP 5568
- **Universe Range**: 1-63999
- **Multicast**: 239.255.0.0/16
- **Priority**: 0-200

### Custom Control Protocol

WebSocket-based protocol for app-server communication:

```typescript
// Message structure
interface ControlMessage {
  type: 'command' | 'status' | 'event';
  timestamp: number;
  payload: any;
}

// Command types
type Command =
  | { type: 'setChannel'; universe: number; channel: number; value: number }
  | { type: 'recallScene'; sceneId: string }
  | { type: 'startEffect'; effectId: string }
  | { type: 'stopEffect'; effectId: string };
```

## 🔧 Development

### Building

```bash
# Compile TypeScript
npm run build

# Watch mode for development
npm run dev

# Type checking
npm run typecheck
```

### Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### Linting

```bash
npm run lint
```

## 📖 Documentation

Detailed protocol documentation is available in the `docs/` directory:

- [DMX-512 Specification](./docs/DMX512.md)
- [Art-Net Protocol](./docs/ArtNet.md)
- [sACN Protocol](./docs/sACN.md)
- [Custom Control Protocol](./docs/CustomProtocol.md)

## 🌍 Multi-Language Support

The protocol package provides definitions for:

- **TypeScript/JavaScript**: For web app and Node.js server
- **C/C++**: Header files for Arduino/ESP32 (coming soon)
- **Python**: Python bindings for scripting (coming soon)

## 🔌 Integration

### With Android App

```typescript
// In android-app package.json
{
  "dependencies": {
    "@dmx-controller/protocol": "workspace:*"
  }
}
```

### With Server

```typescript
// In server package.json
{
  "dependencies": {
    "@dmx-controller/protocol": "workspace:*"
  }
}
```

### With Hardware Nodes

C++ header files will be provided for inclusion in PlatformIO/Arduino projects.

## 🤝 Contributing

When adding new features that require data structures or protocols:

1. Define types in this package first
2. Document the protocol in `docs/`
3. Update the changelog
4. Ensure backward compatibility
5. Add tests for new message types

## 📄 License

See the [LICENSE](../../LICENSE) file in the root directory.

## 🔗 Related Packages

- [Android App](../android-app/README.md) - Mobile PWA
- [Server](../server/README.md) - Backend server
- [ESP32 Node](../nodes/esp32/README.md) - ESP32 firmware
- [Portenta Node](../nodes/portenta/README.md) - Portenta firmware
- [DMX Receiver](../nodes/dmx-receiver/README.md) - Receiver firmware

---

**Note**: This is a foundational package. All other packages depend on it for consistent data structures and protocol definitions.
