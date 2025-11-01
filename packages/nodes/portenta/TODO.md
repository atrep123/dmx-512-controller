# Portenta H7 Node - TODO a Chybějící Funkce

## ✅ Již Implementováno

- [x] PlatformIO konfigurace pro M7 a M4 cores
- [x] Základní struktura dual-core firmware
- [x] RPC setup pro inter-core komunikaci

## 📋 Co Chybí a Je Třeba Přidat

### DMX Output (M7 Core)

- [ ] **Multi-Universe DMX Transmitter**
  - 4× UART DMX output (4 universes)
  - Simultaneous transmission
  - Frame synchronization
  - Timing precision < 1μs
  - Soubor: `src/m7/dmx_output.cpp`, `src/m7/dmx_output.h`

- [ ] **DMX Timing Engine**
  - Hardware timers pro DMX break/MAB
  - DMA for zero-copy transmission
  - Interrupt-driven output
  - Soubor: `src/m7/dmx_timing.cpp`

### Network Stack (M7 Core)

- [ ] **Ethernet Interface**
  - Ethernet.h integration
  - DHCP client
  - Static IP fallback
  - Link status monitoring
  - Soubor: `src/m7/ethernet_manager.cpp`

- [ ] **WiFi Interface** (volitelné)
  - WiFi fallback
  - Dual interface support
  - Network priority handling
  - Soubor: `src/m7/wifi_manager.cpp`

- [ ] **Art-Net Stack**
  - ArtDmx receiver (4 universes)
  - ArtPoll responder
  - ArtPollReply sender
  - Universe mapping
  - Soubor: `src/m7/artnet_stack.cpp`

- [ ] **sACN Stack**
  - E1.31 receiver (4 universes)
  - Multicast handling
  - Priority processing
  - Source monitoring
  - Soubor: `src/m7/sacn_stack.cpp`

### Motor Control (M4 Core)

- [ ] **Stepper Motor Driver**
  - 4× stepper motor support
  - AccelStepper integration
  - Position control (16-bit DMX)
  - Speed control
  - Acceleration profiles
  - Homing sequences
  - Soubor: `src/m4/stepper_driver.cpp`, `src/m4/stepper_driver.h`

- [ ] **Servo Controller**
  - 8× servo outputs
  - Microsecond precision PWM
  - DMX to angle conversion
  - Smooth transitions
  - Soubor: `src/m4/servo_controller.cpp`

- [ ] **Motor Safety**
  - Limit switch support
  - Emergency stop
  - Overload detection
  - Position feedback
  - Soubor: `src/m4/motor_safety.cpp`

### Effects Processing (M4 Core)

- [ ] **Real-time Effects Engine**
  - Chase effects
  - Fade effects
  - RGB color mixing
  - Pattern generation
  - Soubor: `src/m4/effects_engine.cpp`

- [ ] **Effect Blending**
  - HTP (Highest Takes Precedence)
  - LTP (Latest Takes Precedence)
  - Crossfade
  - Soubor: `src/m4/effect_blend.cpp`

### Inter-Core Communication

- [ ] **RPC Command System**
  - Command queue
  - Response handling
  - Error propagation
  - Timeout handling
  - Soubor: `src/shared/rpc_commands.cpp`, `src/shared/rpc_commands.h`

- [ ] **Shared Memory Buffer**
  - DMX data sharing
  - Lock-free ring buffer
  - Double buffering
  - Soubor: `src/shared/shared_memory.cpp`

### Configuration

- [ ] **Settings Management**
  - Flash storage (QSPI)
  - Universe configuration
  - Motor configuration
  - Network settings
  - Soubor: `src/shared/settings.cpp`

- [ ] **Configuration Profiles**
  - Multiple profiles
  - Quick switching
  - Profile export/import
  - Soubor: `src/shared/profiles.cpp`

### Web Interface

- [ ] **Advanced Web Dashboard**
  - Real-time DMX monitor (všechny 4 universes)
  - Motor position display
  - Network statistics
  - Performance metrics
  - Configuration UI
  - Soubor: `src/m7/web_server.cpp`, `data/dashboard/`

- [ ] **REST API**
  - `/api/universes` - Universe control
  - `/api/motors` - Motor control
  - `/api/effects` - Effect management
  - `/api/system` - System info
  - Soubor: `src/m7/api_server.cpp`

### Status and Monitoring

- [ ] **Status LED System**
  - Power status
  - Network status (Ethernet/WiFi)
  - DMX activity (per universe)
  - Error indicators
  - Soubor: `src/m7/status_system.cpp`

- [ ] **Performance Monitoring**
  - CPU usage (M7 & M4)
  - Memory usage
  - DMX frame rate
  - Network latency
  - Soubor: `src/shared/performance.cpp`

- [ ] **Diagnostics**
  - Self-test on boot
  - Continuous health check
  - Error logging
  - Soubor: `src/shared/diagnostics.cpp`

### Firmware Updates

- [ ] **Dual-Core OTA**
  - Update M7 firmware
  - Update M4 firmware
  - Coordinated updates
  - Rollback support
  - Soubor: `src/m7/ota_manager.cpp`

- [ ] **Bootloader Integration**
  - Safe boot mode
  - Recovery mode
  - Version verification

### Advanced Features

- [ ] **Scene Storage**
  - MicroSD card support
  - Scene library
  - Fast recall
  - Soubor: `src/m7/scene_storage.cpp`

- [ ] **Show Playback**
  - Timeline-based playback
  - Cue list
  - SMPTE timecode sync
  - Soubor: `src/m7/show_playback.cpp`

- [ ] **Audio Reactive**
  - Microphone input
  - Beat detection
  - FFT analysis
  - Audio-to-DMX mapping
  - Soubor: `src/m4/audio_reactive.cpp`

### Hardware Integration

- [ ] **RS-485 Transceiver Control**
  - DE/RE pin control
  - Auto-direction switching
  - Per-universe control
  - Soubor: `src/m7/rs485_control.cpp`

- [ ] **External I/O**
  - Digital inputs (triggers)
  - Analog inputs (sensors)
  - GPIO control
  - Soubor: `src/m4/external_io.cpp`

### Safety Features

- [ ] **Dual Watchdog**
  - M7 watchdog timer
  - M4 watchdog timer
  - Cross-core monitoring
  - Soubor: `src/shared/watchdog.cpp`

- [ ] **Power Management**
  - Power monitoring
  - Brownout detection
  - Safe shutdown
  - Soubor: `src/m7/power_manager.cpp`

- [ ] **Failsafe System**
  - Network timeout handling
  - Motor position limits
  - Emergency stop
  - Soubor: `src/shared/failsafe.cpp`

### Testing

- [ ] **Hardware Test Suite**
  - DMX output test
  - Motor test
  - Network test
  - Memory test
  - Soubor: `test/hardware_test.cpp`

- [ ] **Stress Testing**
  - Maximum throughput test
  - Long-term stability test
  - Temperature monitoring
  - Soubor: `test/stress_test.cpp`

### Documentation

- [ ] **Hardware Guide**
  - Carrier board schematic
  - Connector pinouts
  - Power requirements
  - Soubor: `docs/hardware/`

- [ ] **Dual-Core Architecture Doc**
  - Core responsibilities
  - Communication protocols
  - Performance considerations
  - Soubor: `docs/architecture.md`

## 🔧 Technické Dluhy

- [ ] Optimize inter-core latency
- [ ] Reduce memory footprint
- [ ] Profile CPU usage
- [ ] Implement error recovery

## 📦 Chybějící Závislosti

Závislosti k přidání do `platformio.ini`:

```ini
lib_deps = 
    arduino-libraries/Ethernet    # Ethernet
    ArduinoRS485                  # DMX output
    ArduinoJson                   # JSON
    waspmote/AccelStepper         # Stepper motors
    arduino-libraries/Servo       # Servo control
    arduino-libraries/SD          # MicroSD
```

## 🎯 Priority

### Vysoká Priorita (P0)
1. Multi-universe DMX output (M7)
2. Ethernet interface (M7)
3. Art-Net stack (M7)
4. Stepper motor driver (M4)
5. RPC command system

### Střední Priorita (P1)
6. Servo controller (M4)
7. sACN stack (M7)
8. Web dashboard
9. Effects engine (M4)
10. Settings management

### Nízká Priorita (P2)
11. Show playback
12. Audio reactive
13. Scene storage (SD card)
14. WiFi fallback

## 📝 Poznámky

- Portenta H7 je high-end řešení pro profesionální instalace
- Dual-core architektura umožňuje true parallel processing
- M7 (480 MHz) je primární - network, DMX
- M4 (240 MHz) je sekundární - motors, effects
- Inter-core latency je kritická - optimalizovat RPC
- 4 universes = 2048 DMX channels současně
- Ethernet má přednost před WiFi (stabilita)
- Vyžaduje external 5V power pro DMX transceivers
- Heat management - může být potřeba heatsink
- QSPI flash (16 MB) pro scenes a firmware
- SDRAM (8 MB) pro buffering
- Testovat thermal throttling při high load
