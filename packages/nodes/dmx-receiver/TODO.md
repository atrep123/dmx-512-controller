# DMX Receiver Node - TODO a Chybějící Funkce

## ✅ Již Implementováno

- [x] PlatformIO konfigurace (Arduino Nano, ESP32, Pico)
- [x] Základní struktura firmware
- [x] Pin definice pro RGB fixture

## 📋 Co Chybí a Je Třeba Přidat

### DMX Input

- [ ] **DMX-512 UART Receiver**
  - UART RX konfigurace
  - DMX packet detection (break detection)
  - 512-channel reception
  - Frame validation
  - Error detection
  - Soubor: `src/dmx_input.cpp`, `src/dmx_input.h`

- [ ] **DMX Library Integration**
  - DMXSerial2 library (AVR)
  - ESP32DMX (ESP32)
  - nebo vlastní implementace
  - Soubor: `lib/dmx_receiver/`

### Address Selection

- [ ] **DIP Switch Reader**
  - 8-bit binary address reading
  - Pull-up/pull-down configuration
  - Address range validation (1-512)
  - Debouncing
  - Soubor: `src/address_selection.cpp`

- [ ] **Rotary Encoder** (alternativa)
  - Rotary encoder + button
  - LCD/OLED display pro address
  - User-friendly address setting
  - Soubor: `src/rotary_address.cpp`

### Personalities

- [ ] **RGB Fixture Personality**
  - 3 channels: R, G, B
  - PWM output control
  - Gamma correction
  - Soubor: `src/personalities/rgb_fixture.cpp`

- [ ] **RGBW Fixture Personality**
  - 4 channels: R, G, B, W
  - White balance
  - Color mixing
  - Soubor: `src/personalities/rgbw_fixture.cpp`

- [ ] **Dimmer Personality**
  - 1-4 channel dimmer
  - Smooth dimming curves
  - Minimum brightness limit
  - Soubor: `src/personalities/dimmer.cpp`

- [ ] **Relay Personality**
  - 8-channel relay control
  - Threshold setting (on/off point)
  - Relay delay protection
  - Soubor: `src/personalities/relay.cpp`

- [ ] **Servo Personality**
  - 8 servo outputs
  - DMX (0-255) to angle (0-180°) mapping
  - Servo trim adjustments
  - Soubor: `src/personalities/servo.cpp`

- [ ] **Stepper Personality**
  - 2 stepper motors
  - 16-bit position control
  - Speed control
  - Homing
  - Soubor: `src/personalities/stepper.cpp`

- [ ] **DMX Repeater Personality**
  - DMX pass-through
  - Signal amplification
  - Re-timing
  - Soubor: `src/personalities/repeater.cpp`

### Personality Selection

- [ ] **Mode Selection**
  - DIP switch mode selection
  - Button-based selection
  - Display current mode
  - Mode storage in EEPROM
  - Soubor: `src/personality_manager.cpp`

### Output Drivers

- [ ] **PWM Output Driver**
  - Multi-channel PWM
  - Frequency configuration
  - Resolution (8-bit, 12-bit, 16-bit)
  - Gamma correction tables
  - Soubor: `src/output/pwm_driver.cpp`

- [ ] **TLC5940 Driver** (external PWM chip)
  - 16-channel 12-bit PWM
  - SPI communication
  - Dot correction
  - Soubor: `src/output/tlc5940.cpp`

- [ ] **PCA9685 Driver** (I2C PWM chip)
  - 16-channel 12-bit PWM
  - I2C communication
  - Multiple chips support
  - Soubor: `src/output/pca9685.cpp`

- [ ] **Relay Driver**
  - Solid-state relay support
  - Mechanical relay support
  - Flyback diode protection
  - Soubor: `src/output/relay_driver.cpp`

### Status and Indicators

- [ ] **DMX Signal Indicator**
  - LED blink on data
  - Signal present LED
  - Frame rate display
  - Soubor: `src/status_indicators.cpp`

- [ ] **Error Indication**
  - Framing error detection
  - Timeout detection
  - Error LED patterns
  - Soubor: `src/error_indicators.cpp`

- [ ] **Display Support** (volitelné)
  - LCD 16×2 nebo OLED
  - Show DMX address
  - Show channel values
  - Show personality mode
  - Soubor: `src/display.cpp`

### Failsafe

- [ ] **Timeout Detection**
  - No-signal timeout (1-2 sec)
  - Failsafe trigger
  - Soubor: `src/failsafe.cpp`, `src/failsafe.h`

- [ ] **Failsafe Modes**
  - Hold last values
  - Go to zero
  - Go to preset values
  - User configurable
  - Soubor: `src/failsafe_modes.cpp`

### Configuration

- [ ] **EEPROM Settings**
  - DMX start address
  - Personality mode
  - Failsafe mode
  - Failsafe timeout
  - Custom presets
  - Soubor: `src/settings.cpp`, `src/settings.h`

- [ ] **Factory Reset**
  - Button combo for reset
  - Restore default settings
  - Clear all EEPROM
  - Soubor: `src/factory_reset.cpp`

### Advanced Features

- [ ] **WiFi Configuration** (ESP32 only)
  - Web interface for settings
  - DMX address over WiFi
  - Remote monitoring
  - Soubor: `src/esp32/wifi_config.cpp`

- [ ] **Bluetooth Configuration** (ESP32 only)
  - BLE for configuration
  - Mobile app control
  - Soubor: `src/esp32/ble_config.cpp`

- [ ] **DMX Splitter Mode**
  - Input + multiple outputs
  - Signal distribution
  - Soubor: `src/personalities/splitter.cpp`

### Testing Features

- [ ] **Test Patterns**
  - Full on test
  - RGB color cycle
  - Chase test
  - Button-triggered
  - Soubor: `src/test_patterns.cpp`

- [ ] **Diagnostics**
  - Channel value display
  - Signal quality indicator
  - Frame rate measurement
  - Soubor: `src/diagnostics.cpp`

### Signal Quality

- [ ] **DMX Validation**
  - Break time validation
  - MAB time validation
  - Frame time validation
  - Checksum (if available)
  - Soubor: `src/dmx_validator.cpp`

- [ ] **Signal Quality Monitor**
  - Frame rate tracking
  - Error rate calculation
  - Signal strength
  - Soubor: `src/signal_monitor.cpp`

### Protection

- [ ] **Input Protection**
  - TVS diodes for DMX input
  - Optical isolation
  - Ground loop protection
  - Documentation: `docs/protection.md`

- [ ] **Output Protection**
  - Current limiting
  - Over-temperature shutdown
  - Short circuit protection
  - Soubor: `src/output_protection.cpp`

### Power Management

- [ ] **Low Power Mode**
  - Sleep when no signal
  - Wake on DMX
  - Power consumption monitoring
  - Soubor: `src/power_management.cpp`

### Documentation

- [ ] **Hardware Build Guide**
  - Schematic diagrams
  - PCB layout (volitelné)
  - Component list (BOM)
  - Assembly instructions
  - Soubor: `docs/hardware-build.md`

- [ ] **Personality Guide**
  - Channel mapping tables
  - Configuration instructions
  - Usage examples
  - Soubor: `docs/personalities.md`

- [ ] **Troubleshooting Guide**
  - Common problems
  - Solutions
  - Debug procedures
  - Soubor: `docs/troubleshooting.md`

## 🔧 Technické Dluhy

- [ ] Refactor personality code (remove duplication)
- [ ] Optimize interrupt handling
- [ ] Add input validation
- [ ] Memory optimization

## 📦 Chybějící Závislosti

Závislosti k přidání do `platformio.ini`:

```ini
lib_deps = 
    DMXSerial2                    # DMX reception (AVR)
    ESP32DMX                      # DMX reception (ESP32)
    arduino-libraries/Servo       # Servo control
    waspmote/AccelStepper         # Stepper motors
    adafruit/Adafruit PWM Servo   # PCA9685
    FastLED                       # LED control (optional)
    LiquidCrystal                 # LCD display (optional)
    Adafruit SSD1306              # OLED display (optional)
```

## 🎯 Priority

### Vysoká Priorita (P0)
1. DMX-512 UART receiver
2. DIP switch address reader
3. RGB fixture personality
4. DMX signal indicator
5. Failsafe implementation

### Střední Priorita (P1)
6. RGBW personality
7. Dimmer personality
8. Relay personality
9. Servo personality
10. EEPROM settings

### Nízká Priorita (P2)
11. Stepper personality
12. WiFi configuration (ESP32)
13. Display support
14. DMX splitter mode
15. Advanced diagnostics

## 📝 Poznámky

- DMX receiver je nejjednodušší node - vhodný pro začátečníky
- Arduino Nano je levné řešení pro základní aplikace
- ESP32 přidává WiFi config capabilities
- Raspberry Pi Pico je dobrý kompromis (výkon/cena)
- DIP switch je nejspolehlivější pro adresu
- 120Ω termination resistor je kritický (pouze na konci řetězu)
- TVS diode (P6KE6.8CA) pro lightning protection
- Optical isolation (6N137) pro professional installations
- PWM frekvence > 400 Hz aby neblikalo na kameře
- Gamma correction je důležitá pro smooth dimming
- Testovat s reálným DMX kontrolerem
- MAX485 transceiver vyžaduje 5V napájení
