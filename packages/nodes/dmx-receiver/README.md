# DMX-512 Controller - DMX Receiver Node

Firmware for DMX receiver nodes that accept DMX-512 input and control fixtures, motors, or relays directly. Ideal for standalone fixture control and DMX signal distribution.

## 🎯 Overview

This firmware creates a DMX receiver node that listens to incoming DMX-512 signals and controls connected devices (lights, motors, relays) based on received channel values. Perfect for creating custom DMX-controlled fixtures, translating DMX to other protocols, or building DMX signal repeaters.

## ✨ Features

- **DMX-512 Input**: Standard DMX-512A receiver
- **Multiple Personalities**: Different channel mappings for various uses
- **Direct Output Control**:
  - PWM outputs for LED dimming
  - Relay control for switching
  - Servo control (0-180°)
  - Stepper motor control
- **Address Selection**: DIP switches or rotary encoder for start address
- **Status Indicators**: LED feedback for signal and errors
- **Signal Quality**: Reports DMX signal health
- **Failsafe Mode**: Configurable behavior when signal is lost
- **Multiple Modes**:
  - **Fixture Mode**: Control RGB/RGBW LEDs
  - **Dimmer Mode**: Simple intensity control
  - **Relay Mode**: On/off switching
  - **Motor Mode**: Servo/stepper control
  - **Repeater Mode**: DMX signal amplification

## 🔧 Hardware Requirements

### Microcontroller Options

- **Arduino Nano** - Basic functionality
- **ESP32** - WiFi monitoring and configuration
- **STM32** - High-performance applications
- **Raspberry Pi Pico** - Cost-effective option

### Required Components

#### DMX Input Circuit

- **MAX485 or SN75176** RS-485 transceiver
- **120Ω termination** resistor (switchable)
- **XLR-3 or XLR-5** connector (input)
- **TVS diode** (protection)

#### Address Selection

- **8-position DIP switch** (0-255 in binary) or
- **Rotary encoder** with display

#### Outputs (depending on mode)

- **PWM Drivers**: For LED dimming (TLC5940, PCA9685)
- **Relays**: For switching (solid-state or mechanical)
- **Motor Drivers**: For servos/steppers (L298N, A4988)

### Wiring Diagram

```
XLR Input     MAX485        Arduino
---------     ------        -------
Pin 3 (DMX+)  → A
Pin 2 (DMX-)  → B
Pin 1 (GND)   → GND        → GND
              → RO         → RX (GPIO)
              → DE/RE      → GND (RX mode)
              + 5V         ← 5V
              
DIP Switch    Arduino
----------    -------
Bit 0         → GPIO2
Bit 1         → GPIO3
Bit 2         → GPIO4
Bit 3         → GPIO5
Bit 4         → GPIO6
Bit 5         → GPIO7
Bit 6         → GPIO8
Bit 7         → GPIO9
```

## 🚀 Quick Start

### Prerequisites

- **Arduino IDE** or **PlatformIO**
- **DMXSerial2 library** (for Arduino)
- Compatible microcontroller board

### Installation with Arduino IDE

1. **Install Libraries**:
   - Sketch → Include Library → Manage Libraries
   - Install: `DMXSerial2`, `Servo`, `AccelStepper`

2. **Open Sketch**:
   - File → Open → `dmx_receiver_node.ino`

3. **Select Board**:
   - Tools → Board → (your board)
   - Tools → Port → (your port)

4. **Configure Mode**:
   - Edit `config.h` to select personality

5. **Upload**:
   - Click Upload button

### Installation with PlatformIO

```bash
# Navigate to dmx-receiver directory
cd packages/nodes/dmx-receiver

# Build firmware
pio run

# Upload
pio run --target upload

# Monitor
pio device monitor
```

## ⚙️ Configuration

### Personality Selection

Edit `config.h`:

```cpp
// Select personality mode
#define PERSONALITY_MODE FIXTURE_RGB

// Available modes:
// - FIXTURE_RGB      : 3-channel RGB LED control
// - FIXTURE_RGBW     : 4-channel RGBW LED control  
// - DIMMER_1CH       : Single channel dimmer
// - DIMMER_4CH       : 4-channel dimmer
// - RELAY_8CH        : 8-channel relay control
// - SERVO_8CH        : 8 servo outputs
// - STEPPER_2CH      : 2 stepper motors
// - REPEATER         : DMX signal repeater
```

### Channel Mappings

#### RGB Fixture Mode (3 channels)

```
Start Address + 0: Red (0-255)
Start Address + 1: Green (0-255)
Start Address + 2: Blue (0-255)
```

#### RGBW Fixture Mode (4 channels)

```
Start Address + 0: Red (0-255)
Start Address + 1: Green (0-255)
Start Address + 2: Blue (0-255)
Start Address + 3: White (0-255)
```

#### Relay Mode (8 channels)

```
Start Address + 0: Relay 1 (0-127=Off, 128-255=On)
Start Address + 1: Relay 2
...
Start Address + 7: Relay 8
```

#### Servo Mode (8 channels)

```
Start Address + 0: Servo 1 (0-255 → 0-180°)
Start Address + 1: Servo 2
...
Start Address + 7: Servo 8
```

### DMX Address Setting

#### Via DIP Switch

Set switches to binary representation of start address:

```
Address 1:   00000001 (switches: -------X)
Address 10:  00001010 (switches: ----X-X-)
Address 100: 01100100 (switches: -XX--X--)
Address 255: 11111111 (switches: XXXXXXXX)
```

#### Via Software

For ESP32 with WiFi config:

```cpp
// Access web interface at http://<esp-ip>
// Set DMX start address: 1-512
```

### Output Pin Configuration

```cpp
// RGB LED outputs (PWM)
#define RED_PIN 3
#define GREEN_PIN 5
#define BLUE_PIN 6

// Relay outputs
#define RELAY_1_PIN 7
#define RELAY_2_PIN 8
// ... etc

// Servo outputs
#define SERVO_1_PIN 9
#define SERVO_2_PIN 10
// ... etc
```

## 🎭 Personalities Detail

### 1. RGB Fixture (3ch)

Perfect for RGB LED strips or fixtures:

```cpp
void updateRGB() {
  uint8_t red = getDMXValue(startAddress + 0);
  uint8_t green = getDMXValue(startAddress + 1);
  uint8_t blue = getDMXValue(startAddress + 2);
  
  analogWrite(RED_PIN, red);
  analogWrite(GREEN_PIN, green);
  analogWrite(BLUE_PIN, blue);
}
```

### 2. Dimmer (1-4ch)

Simple intensity control:

```cpp
void updateDimmer() {
  for (int i = 0; i < 4; i++) {
    uint8_t value = getDMXValue(startAddress + i);
    analogWrite(DIMMER_PINS[i], value);
  }
}
```

### 3. Relay (8ch)

On/off switching:

```cpp
void updateRelays() {
  for (int i = 0; i < 8; i++) {
    uint8_t value = getDMXValue(startAddress + i);
    digitalWrite(RELAY_PINS[i], value > 127 ? HIGH : LOW);
  }
}
```

### 4. Servo (8ch)

Servo positioning:

```cpp
void updateServos() {
  for (int i = 0; i < 8; i++) {
    uint8_t value = getDMXValue(startAddress + i);
    int angle = map(value, 0, 255, 0, 180);
    servos[i].write(angle);
  }
}
```

### 5. Repeater

Amplify/repeat DMX signal:

```cpp
void repeatDMX() {
  // Receive on input
  // Retransmit on output with fresh timing
  transmitDMXFrame(receivedData);
}
```

## 🚦 Status Indicators

### LED Indicators

- **Power LED** (Green): Always on when powered
- **DMX Signal LED** (Blue): Blinks when receiving DMX
- **Error LED** (Red): Indicates errors

**Blink Patterns**:
- Fast blink: Receiving valid DMX
- Slow blink: No signal (failsafe mode)
- Solid red: Configuration error
- Flashing red: DMX framing error

### Serial Output

Connect USB for debugging:

```
DMX Receiver Node v1.0
Personality: RGB Fixture
Start Address: 1
Channels: 3

DMX Signal: OK
Frame Rate: 44 Hz
Ch1: 255, Ch2: 128, Ch3: 0
```

## 🛡️ Failsafe Mode

Configure behavior when DMX signal is lost:

```cpp
// Failsafe options
#define FAILSAFE_HOLD      // Hold last values
#define FAILSAFE_ZERO      // All outputs to 0
#define FAILSAFE_PRESET    // Load preset values
#define FAILSAFE_IGNORE    // No change

// Failsafe timeout (milliseconds)
#define FAILSAFE_TIMEOUT 2000
```

## 🔧 Advanced Features

### Signal Quality Monitor

```cpp
void checkSignalQuality() {
  float frameRate = getDMXFrameRate();
  int errorCount = getDMXErrorCount();
  
  if (frameRate < 30) {
    // Signal quality poor
    indicateWarning();
  }
}
```

### Multiple Personalities

Switch modes via button or DIP switch:

```cpp
void selectPersonality(uint8_t mode) {
  switch(mode) {
    case 0: loadRGBPersonality(); break;
    case 1: loadDimmerPersonality(); break;
    case 2: loadRelayPersonality(); break;
    // ...
  }
}
```

## 📊 Performance

- **DMX Reception**: Full 512-channel support
- **Update Rate**: Matches input (typically 40-44 Hz)
- **Latency**: <1ms from input to output
- **PWM Frequency**: 1-20 kHz (configurable)
- **Power Consumption**: 50-200mA (depending on configuration)

## 🐛 Troubleshooting

### No DMX Signal

- Check wiring (especially DMX+ and DMX-)
- Verify termination resistor
- Check TX/RX pin assignment
- Test with known good DMX source

### Incorrect Start Address

- Verify DIP switch settings
- Check binary to decimal conversion
- Ensure pull-up/pull-down resistors on DIP switch

### Outputs Not Working

- Test outputs manually (bypass DMX)
- Check power supply to outputs
- Verify pin assignments
- Check PWM frequency

### Flickering

- Check DMX signal quality
- Reduce update rate if needed
- Add smoothing/filtering
- Check for ground loops

## 🧪 Testing

### Test Patterns

Built-in test modes (access via serial):

```
't' - Run test pattern
'r' - Red channel full
'g' - Green channel full
'b' - Blue channel full
'w' - White (all on)
'0' - All off
's' - Show status
```

### DMX Tester

Use a DMX controller or software:

- QLC+
- DMXControl
- Art-Net/sACN software sender

## 🔧 Development

### Project Structure

```
dmx-receiver/
├── src/
│   ├── main.cpp              # Main program
│   ├── dmx_input.cpp         # DMX reception
│   ├── personalities/        # Different modes
│   │   ├── rgb_fixture.cpp
│   │   ├── dimmer.cpp
│   │   ├── relay.cpp
│   │   └── servo.cpp
│   ├── address_select.cpp    # Address reading
│   └── failsafe.cpp          # Failsafe handling
├── include/
│   ├── config.h              # Configuration
│   └── personalities.h       # Mode definitions
├── lib/                      # Libraries
├── platformio.ini
└── README.md
```

### Adding Custom Personalities

1. Create new file in `personalities/`
2. Implement channel mapping
3. Add to personality selector
4. Update documentation

## 📚 Libraries Used

- **DMXSerial2** - DMX reception
- **Servo** - Servo control
- **AccelStepper** - Stepper motors
- **FastLED** - Advanced LED control (optional)

## 🤝 Contributing

Contributions welcome! Please:

1. Test with real DMX equipment
2. Document channel mappings
3. Follow existing personality structure
4. Submit pull request

## 📄 License

See the [LICENSE](../../../LICENSE) file in the root directory.

## 🔗 Related Packages

- [Protocol](../../protocol/README.md) - Protocol definitions
- [Android App](../../android-app/README.md) - Controller app
- [Server](../../server/README.md) - Backend server
- [ESP32 Node](../esp32/README.md) - DMX transmitter
- [Portenta Node](../portenta/README.md) - High-performance controller

## ⚠️ Important Notes

- **Termination**: Enable 120Ω termination only on last device in chain
- **Protection**: Use TVS diodes on DMX lines for lightning protection
- **Isolation**: Consider optical isolation for professional installations
- **Power**: Separate power supplies for logic and high-power outputs

## 📞 Support

For issues or questions, please use GitHub Issues in the main repository.

---

**Note**: DMX receiver nodes are perfect for creating custom fixtures, extending existing DMX systems, or building standalone DMX-controlled devices.
