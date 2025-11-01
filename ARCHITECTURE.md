# DMX-512 Controller - Architecture

## System Architecture Overview

This document describes the architecture of the modular DMX-512 controller system.

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Layer                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────┐          │
│  │          Android App (PWA)                        │          │
│  │  - Mobile-first touch interface                   │          │
│  │  - DMX channel control                            │          │
│  │  - Scene & effect management                      │          │
│  │  - Motor control                                  │          │
│  └─────────────┬─────────────────────────────────────┘          │
│                │                                                │
└────────────────┼────────────────────────────────────────────────┘
                 │ WebSocket / HTTP
                 │ (Optional - can work standalone)
┌────────────────▼────────────────────────────────────────────────┐
│                      Server Layer                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────┐          │
│  │               Backend Server                      │          │
│  │  - WebSocket server (real-time)                   │          │
│  │  - REST API (configuration)                       │          │
│  │  - Multi-client coordination                      │          │
│  │  - Data persistence                               │          │
│  │  - Direct DMX output (optional)                   │          │
│  └─────────────┬─────────────────────────────────────┘          │
│                │                                                │
└────────────────┼────────────────────────────────────────────────┘
                 │ Art-Net / sACN / Custom Protocol
                 │
┌────────────────▼────────────────────────────────────────────────┐
│                      Network Layer                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│           Ethernet / WiFi Network (UDP/TCP)                     │
│           - Art-Net (UDP port 6454)                             │
│           - sACN (UDP port 5568)                                │
│           - Custom protocol (WebSocket)                         │
│                                                                 │
└────────────────┬────────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┬────────────────┐
    │            │            │                │
┌───▼────┐  ┌───▼────┐  ┌────▼──────┐  ┌──────▼────┐
│ ESP32  │  │Portenta│  │   DMX     │  │  Other    │
│  Node  │  │  H7    │  │ Receiver  │  │  Nodes    │
└───┬────┘  └───┬────┘  └────┬──────┘  └──────┬────┘
    │           │            │                │
┌───▼──────────────────────────────────────────────────────────────┐
│                     Hardware Layer                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  DMX-512 Output → Lighting Fixtures                             │
│                 → Moving Heads                                  │
│                 → LED Strips                                    │
│                 → Stepper Motors                                │
│                 → Servos                                        │
│                 → Relays                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Package Dependencies

```
┌─────────────────┐
│  android-app    │
│  (React PWA)    │
└────────┬────────┘
         │
         │ imports
         ▼
┌─────────────────┐         ┌─────────────────┐
│    protocol     │◄────────│     server      │
│ (Type defs)     │ imports │  (Backend)      │
└────────┬────────┘         └─────────────────┘
         │
         │ used by
         ▼
┌─────────────────┐
│   Node firmware │
│ (ESP32/Portenta)│
│  (C++ headers)  │
└─────────────────┘
```

## Data Flow

### 1. User Control Flow

```
User Input (Touch)
    ↓
Android App (React)
    ↓
Local State Update
    ↓
[Optional: Send to Server via WebSocket]
    ↓
[Optional: Server broadcasts to all clients]
    ↓
Art-Net/sACN Packet Generation
    ↓
Network Transmission
    ↓
Node Reception (ESP32/Portenta/Receiver)
    ↓
DMX-512 Output
    ↓
Physical Fixture Response
```

### 2. Scene Recall Flow

```
User taps Scene button
    ↓
Android App loads scene state
    ↓
For each universe:
    ↓
    Set all channel values
    ↓
    Generate Art-Net packet
    ↓
    Send to network
    ↓
Nodes receive and output DMX
```

### 3. Effect Flow

```
Effect starts
    ↓
Timer/Animation loop
    ↓
Calculate channel values for current frame
    ↓
Update affected fixtures
    ↓
Generate Art-Net packets
    ↓
Send to network (40-44 Hz)
    ↓
Nodes output DMX
```

## Protocol Stack

### Application Layer
- **Android App**: User interface and control logic
- **Server**: Business logic and coordination

### Presentation Layer
- **Protocol Package**: Data structures and message schemas
- **WebSocket**: Real-time bidirectional communication
- **REST API**: Configuration and state management

### Session Layer
- **Authentication**: JWT tokens (optional)
- **Session Management**: WebSocket connections

### Transport Layer
- **TCP**: WebSocket connections (App ↔ Server)
- **UDP**: Art-Net and sACN (Server/App ↔ Nodes)

### Network Layer
- **IPv4**: Standard networking
- **Multicast**: sACN universe groups

### Data Link Layer
- **Ethernet**: Wired connections (Portenta)
- **WiFi**: Wireless connections (ESP32, Android)

### Physical Layer
- **DMX-512**: RS-485 differential signaling
- **Ethernet**: Cat5/6 cables
- **WiFi**: 2.4/5 GHz radio

## Deployment Scenarios

### Scenario 1: Standalone Android App + ESP32

```
[Android Device]
      ↓ WiFi (Art-Net)
   [ESP32]
      ↓ DMX-512
  [Fixtures]
```

**Use case**: Small installations, mobile DJ setups

### Scenario 2: Server-Coordinated Multi-Client

```
[Android 1]     [Android 2]     [Web Browser]
      ↓               ↓               ↓
      └───────────────┴───────────────┘
                      ↓ WebSocket
                  [Server]
                      ↓ Art-Net/sACN
      ┌───────────────┴───────────────┐
      ↓               ↓               ↓
   [ESP32]      [Portenta H7]    [DMX Receiver]
      ↓               ↓               ↓
  [Fixtures]     [Motors]         [Fixtures]
```

**Use case**: Permanent installations, multi-user control, complex shows

### Scenario 3: Direct Server Output

```
[Android App]
      ↓ WebSocket
   [Server]
      ↓ Art-Net (direct)
   [DMX Nodes]
      ↓ DMX-512
  [Fixtures]
```

**Use case**: Server with network interface directly connected to lighting network

## Security Considerations

### Network Security
- Optional authentication on WebSocket connections
- JWT tokens for API access
- HTTPS/WSS in production

### DMX Security
- Art-Net and sACN have no built-in security
- Network segmentation recommended
- Firewall rules to restrict access

### Embedded Security
- OTA update verification
- Secure boot (ESP32/Portenta)
- Configuration encryption

## Performance Characteristics

### Latency
- **User Input → DMX Output**: 5-20ms typical
- **WebSocket Round Trip**: 2-10ms on LAN
- **DMX Frame Rate**: 40-44 Hz (22-25ms per frame)

### Throughput
- **Single Universe**: 512 channels @ 44 Hz
- **ESP32**: 1-2 universes max
- **Portenta H7**: 4+ universes
- **Server**: Limited by network bandwidth

### Scalability
- **Fixtures**: Unlimited (multiple universes)
- **Clients**: 10-100 simultaneous connections (server-dependent)
- **Universes**: 1-32768 (Art-Net), 1-63999 (sACN)

## Technology Choices

### Frontend (Android App)
- **React 19**: Modern UI framework
- **TypeScript**: Type safety
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first styling
- **PWA**: Installable on mobile

### Backend (Server)
- **Node.js** or **Python**: Runtime options
- **WebSocket**: Real-time communication
- **Express**: REST API framework
- **PostgreSQL/MongoDB**: Optional persistence

### Protocol Package
- **TypeScript**: Shared types
- **JSON**: Message serialization
- **UDP**: Network transport

### Embedded (Nodes)
- **C++/Arduino**: Firmware language
- **PlatformIO**: Build system
- **ESP-IDF**: ESP32 framework
- **Mbed OS**: Portenta framework

## Future Enhancements

1. **MIDI Integration**: Control via MIDI controllers
2. **Timecode Sync**: SMPTE/MTC synchronization
3. **Audio Reactive**: Beat detection and audio analysis
4. **3D Visualization**: Virtual stage preview
5. **Cloud Sync**: Remote access and backup
6. **Mobile App**: Native iOS/Android apps
7. **RDM Support**: Remote device management
8. **DMX Input**: Control from existing consoles

## References

- [DMX-512A Standard](https://tsp.esta.org/tsp/documents/docs/ANSI-ESTA_E1-11_2008R2018.pdf)
- [Art-Net 4 Specification](http://www.art-net.org.uk/resources/art-net-specification/)
- [sACN (E1.31) Specification](https://tsp.esta.org/tsp/documents/docs/ANSI-ESTA_E1-31-2018.pdf)
- [React Documentation](https://react.dev/)
- [ESP32 Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/)
- [Arduino Portenta H7 Guide](https://docs.arduino.cc/hardware/portenta-h7)

---

Last updated: 2025-11-01
