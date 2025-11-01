# DMX-512 Controller - ESP32 Node

Firmware for ESP32-based DMX-512 controllers with WiFi connectivity and Art-Net/sACN support.

## 🎯 Overview

This firmware turns an ESP32 microcontroller into a professional DMX-512 output node. It receives DMX data over WiFi via Art-Net or sACN protocols and outputs standard DMX-512 signals through UART for controlling lighting fixtures, motors, and other DMX devices.

## ✨ Features

- **DMX-512 Output**: Full 512-channel DMX output via UART
- **WiFi Connectivity**: Connect to existing WiFi networks
- **Art-Net Support**: Art-Net 4 receiver
- **sACN Support**: sACN (E1.31) receiver with multicast
- **Multiple Universes**: Support for multiple DMX universes (hardware dependent)
- **Low Latency**: Optimized for minimal delay (<5ms)
- **Web Configuration**: Built-in web interface for setup
- **Status LEDs**: Visual feedback for connection and data status
- **Firmware Updates**: OTA (Over-The-Air) updates supported
- **Standalone Mode**: Can run without server connection

## 🔧 Hardware Requirements

### Recommended ESP32 Boards

- **ESP32-DevKit-C** - Standard development board
- **ESP32-WROOM-32** - Compact module
- **ESP32-WROVER** - With PSRAM for advanced features
- **ESP32-S3** - Latest generation (recommended)

### Additional Components

- **DMX Output Circuit**:
  - MAX485 or SN75176 RS-485 transceiver
  - 120Ω termination resistor
  - XLR-3 or XLR-5 connector
  - 5V power supply

- **Status LEDs** (optional):
  - WiFi status LED
  - DMX activity LED
  - Power LED

### Wiring Diagram

```
ESP32         MAX485        XLR-3
-----         ------        -----
TX2 (GPIO17)  → DI          
              → DE ← +5V    
              → RE ← GND    
              → A  → Pin 3 (DMX+)
              → B  → Pin 2 (DMX-)
GND           → GND → Pin 1 (GND)
```

**Pin Mapping**:
- GPIO17 (TX2) - DMX Data Out
- GPIO16 (RX2) - DMX Data In (optional, for receiver mode)
- GPIO2 - WiFi Status LED
- GPIO4 - DMX Activity LED

## 🚀 Quick Start

### Prerequisites

- **PlatformIO** (recommended) or Arduino IDE
- ESP32 board support installed
- USB cable for programming

### Installation with PlatformIO

```bash
# Navigate to ESP32 directory
cd packages/nodes/esp32

# Install PlatformIO (if not already installed)
pip install platformio

# Build firmware
pio run

# Upload to ESP32
pio run --target upload

# Monitor serial output
pio device monitor
```

### Installation with Arduino IDE

1. Install Arduino IDE
2. Add ESP32 board support:
   - File → Preferences → Additional Board Manager URLs
   - Add: `https://dl.espressif.com/dl/package_esp32_index.json`
3. Install ESP32 boards from Tools → Board Manager
4. Open `esp32_dmx_node.ino`
5. Select your ESP32 board from Tools → Board
6. Select correct COM port
7. Click Upload

## ⚙️ Configuration

### WiFi Setup

On first boot, the ESP32 creates a WiFi access point:

- **SSID**: `DMX-Node-XXXXXX` (XXXXXX = chip ID)
- **Password**: `dmx512setup`

Connect to this AP and navigate to `http://192.168.4.1` to configure:

1. Enter your WiFi SSID and password
2. Set DMX universe number
3. Choose protocol (Art-Net or sACN)
4. Set node name (optional)
5. Click "Save and Restart"

### Configuration File

Settings are stored in EEPROM/NVS:

```cpp
struct Config {
  char wifiSSID[32];
  char wifiPassword[64];
  uint8_t universe;
  uint8_t protocol;  // 0=Art-Net, 1=sACN
  char nodeName[32];
  bool autoConnect;
  uint16_t dmxBreakTime;
  uint16_t dmxMABTime;
};
```

### Advanced Configuration

Edit `config.h` before compiling:

```cpp
// DMX Configuration
#define DMX_SERIAL_OUTPUT Serial2
#define DMX_TX_PIN 17
#define DMX_RX_PIN 16
#define DMX_BREAK_TIME 100    // microseconds
#define DMX_MAB_TIME 12       // microseconds

// Network Configuration
#define ARTNET_PORT 6454
#define SACN_PORT 5568
#define WEB_SERVER_PORT 80

// Status LED Pins
#define WIFI_LED_PIN 2
#define DMX_LED_PIN 4

// Enable features
#define ENABLE_WEB_CONFIG true
#define ENABLE_OTA_UPDATE true
#define ENABLE_MDNS true
```

## 🌐 Network Protocols

### Art-Net Configuration

- **Port**: UDP 6454
- **Universe**: 0-32767
- **Broadcast**: Listens on 255.255.255.255
- **Unicast**: Can be configured to specific IP

### sACN Configuration

- **Port**: UDP 5568
- **Universe**: 1-63999
- **Multicast**: Joins 239.255.X.X groups automatically
- **Priority**: Respects source priority

## 📡 Web Interface

Access the web interface at the ESP32's IP address:

```
http://<esp32-ip-address>
```

**Features**:
- WiFi configuration
- Universe and protocol settings
- DMX channel monitor (real-time)
- Network statistics
- Firmware update
- Reboot and reset options

## 🔄 Firmware Updates

### OTA (Over-The-Air)

1. Build new firmware: `pio run`
2. Go to web interface: `http://<esp32-ip>/update`
3. Upload `.bin` file from `.pio/build/esp32dev/firmware.bin`
4. Wait for update to complete

### USB

```bash
pio run --target upload
```

## 🐛 Troubleshooting

### No WiFi Connection

- Check SSID and password
- Ensure 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- Check signal strength
- Try manual reset

### No DMX Output

- Verify MAX485 wiring
- Check TX pin assignment (GPIO17)
- Test with DMX tester
- Check termination resistor (120Ω)

### High Latency

- Check WiFi signal strength
- Reduce network traffic
- Use unicast instead of broadcast
- Disable other services (mDNS, web server)

### Web Interface Not Accessible

- Check ESP32 IP address (monitor serial output)
- Ensure on same network
- Try direct IP instead of mDNS name
- Disable firewall temporarily

## 📊 Performance

- **DMX Update Rate**: ~40 Hz (25ms per frame)
- **Network Latency**: <5ms typical
- **Power Consumption**: ~100-150mA @ 3.3V
- **WiFi Range**: 50-100m (depending on environment)

## 🔧 Development

### Project Structure

```
esp32/
├── src/
│   ├── main.cpp          # Main program
│   ├── dmx_output.cpp    # DMX transmission
│   ├── network.cpp       # WiFi and protocols
│   ├── web_server.cpp    # Configuration web UI
│   └── config.cpp        # Configuration management
├── include/
│   ├── config.h          # Configuration defines
│   ├── dmx_output.h
│   └── network.h
├── data/                 # Web interface files (HTML/CSS/JS)
├── lib/                  # External libraries
├── platformio.ini        # PlatformIO config
└── README.md
```

### Building

```bash
# Clean build
pio run --target clean

# Build
pio run

# Build and upload
pio run --target upload

# Upload filesystem (web interface)
pio run --target uploadfs
```

### Dependencies

Automatically managed by PlatformIO:

- ESP32 Arduino Core
- ArtnetWifi library
- ESPAsyncWebServer
- AsyncTCP
- ArduinoJson

## 🧪 Testing

### Hardware Test

```bash
# Upload test firmware
pio test

# Or use serial monitor test mode
pio device monitor
# Type 't' for test pattern
```

### Test Patterns

- **Full On**: All channels at 255
- **Full Off**: All channels at 0
- **Chase**: Moving light pattern
- **Ramp**: 0-255 gradient

## 📚 Library Documentation

- [ESP-IDF Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/)
- [Arduino ESP32 Core](https://github.com/espressif/arduino-esp32)
- [Art-Net Protocol](http://www.art-net.org.uk)
- [sACN (E1.31) Protocol](https://tsp.esta.org/tsp/documents/docs/ANSI-ESTA_E1-31-2018.pdf)

## 🤝 Contributing

Contributions welcome! Please:

1. Test on real hardware
2. Follow ESP32 coding conventions
3. Document pin assignments
4. Update this README if needed
5. Submit pull request

## 📄 License

See the [LICENSE](../../../LICENSE) file in the root directory.

## 🔗 Related Packages

- [Protocol](../../protocol/README.md) - Protocol definitions
- [Android App](../../android-app/README.md) - Controller app
- [Server](../../server/README.md) - Backend server
- [Portenta Node](../portenta/README.md) - Alternative hardware
- [DMX Receiver](../dmx-receiver/README.md) - DMX input node

## ⚠️ Important Notes

- **Voltage Levels**: ESP32 uses 3.3V logic. Ensure proper level shifting for 5V peripherals
- **Power Supply**: Use stable 3.3V power supply. USB power is usually sufficient
- **ESD Protection**: Handle ESP32 boards with anti-static precautions
- **DMX Standard**: Follow DMX-512A timing specifications strictly

## 📞 Support

For issues or questions, please use GitHub Issues in the main repository.

---

**Note**: This firmware can work standalone or as part of a larger system with the server and Android app.
