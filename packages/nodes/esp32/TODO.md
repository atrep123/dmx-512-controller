# ESP32 Node - TODO a Chybějící Funkce

## ✅ Již Implementováno

- [x] PlatformIO konfigurace
- [x] Základní struktura firmware
- [x] Pin definice

## 📋 Co Chybí a Je Třeba Přidat

### DMX Output

- [ ] **DMX-512 UART Transmitter**
  - UART konfigurace pro DMX timing
  - Break and MAB (Mark After Break) generování
  - 512-channel data transmission
  - Frame rate: 40-44 Hz
  - Soubor: `src/dmx_output.cpp`, `src/dmx_output.h`

- [ ] **DMX Library Integration**
  - ESP32DMX library
  - nebo vlastní implementace
  - Multi-universe podpora (2 universes max na ESP32)

### Network Stack

- [ ] **WiFi Connection Manager**
  - WiFi STA mode
  - Auto-reconnect
  - Connection status monitoring
  - Fallback AP mode při selhání
  - Soubor: `src/wifi_manager.cpp`, `src/wifi_manager.h`

- [ ] **Art-Net Receiver**
  - UDP socket listening (port 6454)
  - ArtDmx packet parsing
  - Universe filtering
  - Sequence number checking
  - Soubor: `src/artnet_receiver.cpp`

- [ ] **sACN Receiver**
  - UDP socket listening (port 5568)
  - E1.31 packet parsing
  - Multicast join
  - Priority handling
  - Soubor: `src/sacn_receiver.cpp`

### Configuration

- [ ] **WiFi Configuration Portal**
  - AP mode pro initial setup
  - Web interface pro konfiguraci
  - Captive portal
  - SSID/password storage
  - Soubor: `src/config_portal.cpp`

- [ ] **Settings Storage**
  - EEPROM/NVS storage
  - WiFi credentials
  - Universe number
  - Protocol selection (Art-Net/sACN)
  - Node name
  - Soubor: `src/settings.cpp`, `src/settings.h`

- [ ] **Factory Reset**
  - Button press detection
  - Clear all settings
  - Restart to config mode

### Web Interface

- [ ] **Built-in Web Server**
  - ESP Async Web Server
  - Configuration page
  - Status dashboard
  - DMX monitor
  - Network settings
  - Soubor: `src/web_server.cpp`, `data/index.html`

- [ ] **REST API**
  - `/api/status` - Get node status
  - `/api/config` - Get/set configuration
  - `/api/dmx` - Get current DMX values
  - `/api/reboot` - Restart node

### Status Indicators

- [ ] **LED Status System**
  - WiFi connection status
  - DMX data activity
  - Error indication
  - Configuration mode
  - Soubor: `src/status_leds.cpp`

- [ ] **Serial Debugging**
  - Formatted debug output
  - DMX statistics
  - Network statistics
  - Error logging

### Firmware Updates

- [ ] **OTA Updates**
  - ArduinoOTA integration
  - Web-based OTA
  - Firmware version checking
  - Rollback on failure
  - Soubor: `src/ota_update.cpp`

- [ ] **Version Management**
  - Semantic versioning
  - Version display in web UI
  - Changelog tracking

### Performance Optimization

- [ ] **DMX Timing Optimization**
  - Interrupt-driven DMX output
  - DMA for UART
  - Minimize jitter
  - Frame rate stability

- [ ] **Network Optimization**
  - UDP buffer sizing
  - Packet loss handling
  - Latency measurement
  - QoS settings

### Discovery

- [ ] **mDNS Support**
  - Service advertisement
  - Hostname resolution
  - Easy device finding
  - Soubor: `src/mdns_service.cpp`

- [ ] **Node Announcement**
  - ArtPoll response
  - sACN source announcement
  - Node capabilities broadcast

### Failsafe

- [ ] **Watchdog Timer**
  - System hang detection
  - Auto-restart
  - Crash recovery

- [ ] **DMX Failsafe**
  - Timeout detection
  - Safe state (all channels off)
  - Last known state hold

### Testing Features

- [ ] **Test Patterns**
  - Full on/off
  - Chase pattern
  - Ramp test
  - RGB color test
  - Trigger via button/web
  - Soubor: `src/test_patterns.cpp`

- [ ] **Diagnostics**
  - Network latency test
  - DMX output test
  - Memory usage
  - CPU usage

### Advanced Features

- [ ] **Multiple Universe Support**
  - Dual universe output (ESP32 má 3 UARTs)
  - Universe mapping
  - Independent frame rates

- [ ] **RDM Support** (volitelné)
  - RDM responder
  - Device discovery
  - Parameter getting/setting

### Documentation

- [ ] **Hardware Assembly Guide**
  - Schéma zapojení
  - Bill of materials
  - PCB layout (volitelné)
  - Soubor: `docs/hardware.md`

- [ ] **Firmware User Guide**
  - Setup instructions
  - Configuration guide
  - Troubleshooting
  - Soubor: `docs/user-guide.md`

## 🔧 Technické Dluhy

- [ ] Refactor main.cpp na menší moduly
- [ ] Přidat error handling
- [ ] Memory leak checking
- [ ] Stack overflow protection

## 📦 Chybějící Závislosti

Závislosti k přidání do `platformio.ini`:

```ini
lib_deps = 
    ESP32DMX                      # DMX output
    ArduinoJson                   # JSON parsing
    ESPAsyncWebServer            # Web server
    AsyncTCP                      # Async TCP
    WiFiManager                   # WiFi config
    ArduinoOTA                    # OTA updates
```

## 🎯 Priority

### Vysoká Priorita (P0)
1. DMX-512 UART transmitter
2. WiFi connection manager
3. Art-Net receiver
4. Settings storage

### Střední Priorita (P1)
5. Web configuration interface
6. sACN receiver
7. OTA updates
8. Status LEDs

### Nízká Priorita (P2)
9. Multiple universe support
10. RDM support
11. Advanced diagnostics

## 📝 Poznámky

- ESP32 má omezené resources - optimalizovat paměť
- WiFi může způsobit interference s DMX timingem - testovat
- Použít FreeRTOS tasks pro separaci DMX output a network
- DMX output musí mít nejvyšší prioritu
- Testovat stabilitu při dlouhodobém provozu (24/7)
- Watchdog timer je kritický pro produkční použití
- MAX485 circuit vyžaduje external power 5V
- ESP32-S3 má lepší WiFi než původní ESP32
