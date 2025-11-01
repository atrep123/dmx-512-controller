# DMX-512 Controller - Modular System

A comprehensive DMX-512 lighting and motion control system split into modular components for flexible deployment and development.

## 📦 Project Structure

This is a monorepo containing multiple packages:

```
dmx-512-controller/
├── packages/
│   ├── android-app/          # React PWA for Android/iOS control
│   ├── protocol/              # Shared protocol definitions and communication specs
│   ├── server/                # Backend server for centralized control
│   └── nodes/                 # Embedded firmware for hardware nodes
│       ├── esp32/             # ESP32 DMX controller firmware
│       ├── portenta/          # Arduino Portenta H7 firmware
│       └── dmx-receiver/      # DMX receiver node firmware
├── .github/                   # GitHub Actions workflows
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

- **For Web/Android App**: Node.js 18+, npm
- **For ESP32**: PlatformIO or Arduino IDE with ESP32 support
- **For Portenta**: Arduino IDE with Portenta H7 board support
- **For Server**: Node.js 18+ or Python 3.9+

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/atrep123/dmx-512-controller.git
   cd dmx-512-controller
   ```

2. **Install dependencies** (for npm workspaces)
   ```bash
   npm install
   ```

3. **Choose your component** and navigate to its directory:
   - Android App: `cd packages/android-app`
   - Server: `cd packages/server`
   - ESP32: `cd packages/nodes/esp32`
   - etc.

See individual package READMEs for detailed setup instructions.

## 📱 Packages Overview

### Android App (`packages/android-app`)
Progressive Web App (PWA) for mobile control of DMX fixtures, motors, and effects.

**Features:**
- Mobile-first touch interface
- DMX channel control (0-255)
- Scene management
- Automated effects
- Stepper motor & servo control
- Art-Net / sACN network output
- Offline support

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS

[→ More details](./packages/android-app/README.md)

---

### Protocol (`packages/protocol`)
Shared protocol definitions and communication specifications for all components.

**Includes:**
- DMX-512 protocol specifications
- Art-Net / sACN protocol definitions
- Custom control protocol for inter-component communication
- Message schemas and data structures
- TypeScript types and interfaces

[→ More details](./packages/protocol/README.md)

---

### Server (`packages/server`)
Backend server for centralized control and coordination between nodes.

**Features:**
- WebSocket server for real-time communication
- DMX universe management
- REST API for configuration
- Data persistence
- Multi-client support
- Network discovery

[→ More details](./packages/server/README.md)

---

### Nodes (`packages/nodes`)

#### ESP32 (`packages/nodes/esp32`)
Firmware for ESP32-based DMX controllers.

**Features:**
- DMX-512 output via UART
- WiFi connectivity (Art-Net/sACN)
- Multiple universe support
- Low-latency performance
- Web configuration interface

[→ More details](./packages/nodes/esp32/README.md)

---

#### Portenta H7 (`packages/nodes/portenta`)
Firmware for Arduino Portenta H7 high-performance controller.

**Features:**
- Dual-core processing
- High-speed DMX output
- Advanced motor control
- Real-time effects processing
- Ethernet connectivity

[→ More details](./packages/nodes/portenta/README.md)

---

#### DMX Receiver (`packages/nodes/dmx-receiver`)
Firmware for DMX receiver nodes that control fixtures directly.

**Features:**
- DMX-512 input
- Direct fixture control
- Standalone operation
- Multiple personality profiles
- Status LED indicators

[→ More details](./packages/nodes/dmx-receiver/README.md)

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Android App   │ ← User Interface (PWA)
└────────┬────────┘
         │ WebSocket/HTTP
         ▼
┌─────────────────┐
│     Server      │ ← Central Control
└────────┬────────┘
         │ Art-Net/sACN/Custom Protocol
         ▼
┌────────────────────────────────┐
│          Network               │
└────┬───────────┬───────────┬───┘
     │           │           │
     ▼           ▼           ▼
┌─────────┐ ┌──────────┐ ┌──────────────┐
│  ESP32  │ │ Portenta │ │ DMX Receiver │ ← Hardware Nodes
└────┬────┘ └────┬─────┘ └──────┬───────┘
     │           │               │
     ▼           ▼               ▼
  [Fixtures] [Motors]      [Direct DMX]
```

## 🔧 Development

### Workspace Commands

```bash
# Install all dependencies
npm install

# Build all packages
npm run build

# Run tests for all packages
npm test

# Lint all packages
npm run lint
```

### Individual Package Development

Navigate to each package directory for specific development commands. See package READMEs for details.

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines in each package.

1. Fork the repository
2. Create a feature branch
3. Make your changes in the appropriate package(s)
4. Test thoroughly
5. Submit a pull request

## 📄 License

See [LICENSE](./LICENSE) file for details.

## 🔗 Related Documentation

- [PRD.md](./PRD.md) - Original Product Requirements Document
- [SECURITY.md](./SECURITY.md) - Security policies
- Individual package READMEs for detailed documentation

## 📞 Support

For issues, questions, or contributions, please use GitHub Issues in this repository.

---

**Note:** This is a modular system. You can use any combination of components based on your needs. The Android app can work standalone or with server coordination, and nodes can operate independently or be managed centrally.
