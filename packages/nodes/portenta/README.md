# DMX-512 Controller - Arduino Portenta H7 Node

High-performance firmware for Arduino Portenta H7 dual-core controller with advanced DMX, motor control, and real-time processing capabilities.

## 🎯 Overview

Professional-grade firmware for the Arduino Portenta H7 that leverages its dual-core ARM Cortex-M7/M4 architecture for high-performance DMX output, advanced motor control, and real-time effects processing. Ideal for demanding applications requiring multiple universes, complex effects, and precise timing.

## ✨ Features

- **Dual-Core Processing**: 
  - M7 core (480 MHz) - DMX output and network
  - M4 core (240 MHz) - Motor control and effects
- **Multiple DMX Universes**: Output up to 4 DMX universes simultaneously
- **High-Speed DMX**: Ultra-low latency (<2ms)
- **Advanced Motor Control**:
  - 16-bit stepper motor positioning
  - Servo control with microsecond precision
  - Smooth motion profiles
- **Ethernet Connectivity**: Art-Net/sACN over Ethernet (faster than WiFi)
- **WiFi Support**: Optional WiFi connectivity
- **Real-time Effects**: Hardware-accelerated effects processing
- **USB Host/Device**: USB DMX interfaces and configuration
- **Onboard Storage**: MicroSD card for scenes and logs
- **Built-in Crypto**: Hardware security for authentication

## 🔧 Hardware Requirements

### Arduino Portenta H7

- **CPU**: Dual-core STM32H747
  - ARM Cortex-M7 @ 480 MHz
  - ARM Cortex-M4 @ 240 MHz
- **RAM**: 8 MB SDRAM
- **Flash**: 16 MB QSPI Flash
- **Connectivity**: 
  - WiFi 802.11b/g/n
  - Bluetooth 5.1
  - USB-C (OTG)

### Additional Components

#### For DMX Output (per universe)

- **MAX485 or SN75176** RS-485 transceivers (×4 for 4 universes)
- **XLR-3 or XLR-5** connectors
- **120Ω termination** resistors
- **Level shifters** (3.3V to 5V)

#### Recommended Carrier Boards

- **Portenta Breakout Board** - Easy prototyping
- **Portenta Vision Shield** - With camera and IMU
- **Custom PCB** - For production deployment

### Pin Mapping

```
Portenta H7    Function          MAX485
-----------    --------          ------
SERIAL1_TX     Universe 1 TX  →  DI
SERIAL2_TX     Universe 2 TX  →  DI
SERIAL3_TX     Universe 3 TX  →  DI
SERIAL4_TX     Universe 4 TX  →  DI

GPIO0          WiFi Status LED
GPIO1          DMX Activity LED
GPIO2          Error LED

PWM0-PWM7      Servo outputs (8 channels)
GPIO3-GPIO6    Stepper motor control
```

## 🚀 Quick Start

### Prerequisites

- **Arduino IDE 2.0+** or **PlatformIO**
- **Arduino Mbed OS Portenta Boards** support
- **USB-C cable** for programming

### Installation with Arduino IDE

1. **Install Board Support**:
   - Open Arduino IDE
   - Go to Tools → Board Manager
   - Search for "Arduino Mbed OS Portenta Boards"
   - Install the package

2. **Install Libraries**:
   - Tools → Manage Libraries
   - Install: ArduinoRS485, Ethernet, WiFi

3. **Open Sketch**:
   - File → Open → `portenta_dmx_node.ino`

4. **Configure Board**:
   - Tools → Board → Arduino Portenta H7 (M7 core)
   - Tools → Port → Select your Portenta

5. **Upload**:
   - Click Upload button
   - Wait for compilation and upload

### Installation with PlatformIO

```bash
# Navigate to Portenta directory
cd packages/nodes/portenta

# Install PlatformIO
pip install platformio

# Build firmware
pio run

# Upload to Portenta
pio run --target upload

# Monitor serial output
pio device monitor
```

## ⚙️ Configuration

### Network Setup

#### Ethernet (Recommended)

1. Connect Ethernet cable
2. Portenta will obtain IP via DHCP
3. Check serial monitor for IP address
4. Configure Art-Net/sACN as needed

#### WiFi

Edit `config.h`:

```cpp
#define WIFI_SSID "YourNetworkName"
#define WIFI_PASSWORD "YourPassword"
#define USE_ETHERNET false
```

### DMX Configuration

```cpp
// Number of DMX universes
#define DMX_UNIVERSES 4

// Universe assignments
#define UNIVERSE_1 1
#define UNIVERSE_2 2
#define UNIVERSE_3 3
#define UNIVERSE_4 4

// DMX timing (microseconds)
#define DMX_BREAK_TIME 100
#define DMX_MAB_TIME 12
#define DMX_FRAME_RATE 40  // Hz
```

### Motor Configuration

```cpp
// Stepper motors
#define NUM_STEPPERS 4
#define STEPS_PER_REV 200
#define MAX_SPEED 1000  // steps/sec
#define ACCELERATION 500

// Servos
#define NUM_SERVOS 8
#define SERVO_MIN_PULSE 544   // microseconds
#define SERVO_MAX_PULSE 2400
```

## 🏗️ Architecture

### Dual-Core Design

```
M7 Core (480 MHz)           M4 Core (240 MHz)
─────────────────           ─────────────────
┌─────────────────┐        ┌─────────────────┐
│ Network Stack   │        │ Motor Control   │
│ - Art-Net RX    │        │ - Stepper       │
│ - sACN RX       │        │ - Servo         │
│ - WebSocket     │        │                 │
├─────────────────┤        ├─────────────────┤
│ DMX Output      │        │ Effects Engine  │
│ - 4 Universes   │        │ - Real-time     │
│ - UART TX       │        │ - Parallel      │
├─────────────────┤        ├─────────────────┤
│ Web Server      │        │ Scene Manager   │
│ - Config UI     │        │ - Transitions   │
│ - Status API    │        │ - Playback      │
└─────────────────┘        └─────────────────┘
         │                          │
         └──────── RPC/IPC ─────────┘
```

### Inter-Core Communication

```cpp
// M7 → M4: Send DMX data for processing
RPC.call("processDMX", universe, channelData);

// M4 → M7: Request network transmission
RPC.call("sendStatus", statusData);
```

## 🌐 Network Protocols

### Art-Net

- **Port**: UDP 6454
- **Universes**: 0-32767
- **Performance**: <2ms latency
- **Mode**: Unicast or broadcast

### sACN (E1.31)

- **Port**: UDP 5568
- **Universes**: 1-63999
- **Multicast**: Automatic group joining
- **Priority**: 0-200 (respects priorities)

### Custom Protocol

WebSocket server for direct control:

```
ws://<portenta-ip>:8080
```

## 📡 Web Interface

Access at `http://<portenta-ip>`:

- **Dashboard**: Real-time status and metrics
- **DMX Monitor**: Live channel values for all universes
- **Motor Control**: Manual stepper/servo control
- **Network Settings**: Configure protocols and addresses
- **Scene Manager**: Upload and manage scenes
- **Firmware Update**: OTA updates via web
- **Diagnostics**: CPU usage, memory, network stats

## 🎮 Motor Control

### Stepper Motors

```cpp
// Set target position
setStepperPosition(motorId, position);

// Set speed
setStepperSpeed(motorId, stepsPerSec);

// Home stepper
homestepper(motorId);
```

**DMX Mapping**:
- Channels 1-2: Position (16-bit)
- Channel 3: Speed (0-255)
- Channel 4: Control (0=stop, 255=go)

### Servo Control

```cpp
// Set angle
setServoAngle(servoId, angle);  // 0-180°

// Set pulse width
setServoPulse(servoId, microseconds);
```

**DMX Mapping**:
- 1 channel per servo (0-255 → 0-180°)

## 🔄 Firmware Updates

### OTA via Web Interface

1. Navigate to `http://<portenta-ip>/update`
2. Select firmware `.bin` file
3. Click "Update"
4. Wait for completion (~2 minutes)
5. Portenta restarts automatically

### USB Update

```bash
# Arduino IDE: Sketch → Upload
# Or PlatformIO:
pio run --target upload
```

## 📊 Performance Metrics

- **DMX Update Rate**: 44 Hz (maximum per universe)
- **Network Latency**: <2ms
- **Motor Steps**: Up to 10,000 steps/sec
- **Servo Update**: 50 Hz
- **CPU Usage**: ~40% (M7), ~25% (M4) under full load
- **Memory Usage**: ~2MB RAM used
- **Power Consumption**: ~500mA @ 5V

## 🐛 Troubleshooting

### No Network Connection

- Check Ethernet cable
- Verify DHCP server on network
- Check WiFi credentials
- Monitor serial output for errors

### DMX Output Issues

- Verify RS-485 transceiver wiring
- Check voltage levels (3.3V vs 5V)
- Ensure proper termination
- Test with DMX analyzer

### Motor Not Moving

- Check power supply (motors need external power)
- Verify pin connections
- Test with manual commands
- Check motor enable pin

### High CPU Usage

- Reduce DMX frame rate
- Disable unused features
- Optimize effects on M4 core
- Check for infinite loops

## 🔧 Development

### Project Structure

```
portenta/
├── src/
│   ├── main_m7.cpp       # M7 core main program
│   ├── main_m4.cpp       # M4 core main program
│   ├── dmx_output.cpp    # DMX transmission
│   ├── network.cpp       # Network stack
│   ├── motor_control.cpp # Stepper/servo control
│   ├── effects.cpp       # Effects processing
│   └── web_server.cpp    # Configuration interface
├── include/
│   ├── config.h          # Configuration
│   ├── dmx_output.h
│   ├── motor_control.h
│   └── rpc_commands.h    # Inter-core RPC
├── lib/                  # Libraries
├── data/                 # Web UI files
├── platformio.ini        # PlatformIO config
└── README.md
```

### Building Both Cores

```bash
# Build M7 core
pio run -e portenta_m7

# Build M4 core
pio run -e portenta_m4

# Upload both
pio run --target upload
```

### Debugging

```bash
# Serial debugging (M7)
pio device monitor --baud 115200

# OpenOCD debugging
pio debug
```

## 🧪 Testing

### Hardware Tests

```cpp
// Run self-test
void runSelfTest() {
  testDMXOutput();
  testNetworkStack();
  testMotorControl();
  testRPCCommunication();
}
```

### Benchmarking

```bash
# Upload benchmark firmware
pio test -e benchmark

# Results shown in serial monitor
```

## 📚 Libraries Used

- **Arduino Mbed OS** - Core framework
- **ArduinoRS485** - DMX output
- **Ethernet** - Network connectivity
- **WiFi** - Wireless support
- **RPC** - Inter-core communication
- **AccelStepper** - Stepper motor control
- **Servo** - Servo control

## 🤝 Contributing

Contributions welcome! Please:

1. Test on real Portenta H7 hardware
2. Test both M7 and M4 cores
3. Verify motor control functionality
4. Check memory usage
5. Submit pull request

## 📄 License

See the [LICENSE](../../../LICENSE) file in the root directory.

## 🔗 Related Packages

- [Protocol](../../protocol/README.md) - Protocol definitions
- [Android App](../../android-app/README.md) - Controller app
- [Server](../../server/README.md) - Backend server
- [ESP32 Node](../esp32/README.md) - Alternative hardware
- [DMX Receiver](../dmx-receiver/README.md) - DMX input node

## ⚠️ Important Notes

- **Power Requirements**: Portenta H7 needs stable 5V supply
- **Heat Management**: May require heatsink under heavy load
- **External Motors**: Always use external power for motors
- **Voltage Levels**: Portenta uses 3.3V I/O (use level shifters for 5V)

## 📞 Support

For issues or questions, please use GitHub Issues in the main repository.

---

**Note**: The Portenta H7 is recommended for professional installations requiring high performance, multiple universes, and advanced motor control.
