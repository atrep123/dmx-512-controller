/**
 * DMX Receiver Node - Main Program
 * 
 * Firmware for DMX-512 receiver that controls fixtures directly
 * Supports multiple personalities for different applications
 * 
 * Hardware:
 * - Arduino Nano, ESP32, or compatible
 * - MAX485 RS-485 transceiver (RX mode)
 * - DIP switch for address selection
 * - Output drivers (PWM, relays, etc.)
 * 
 * Pin Configuration:
 * - GPIO2-9: DIP switch for address selection
 * - GPIO10: DMX signal LED
 * - GPIO11: Error LED
 * - PWM outputs: GPIO3, 5, 6 (RGB)
 */

#include <Arduino.h>

// Configuration
#define DMX_RX_PIN 0  // Hardware UART RX
#define DMX_CHANNELS 512

// Pin definitions
#define DMX_LED_PIN 10
#define ERROR_LED_PIN 11

// DIP switch pins for address selection
#define DIP_PIN_0 2
#define DIP_PIN_1 3
#define DIP_PIN_2 4
#define DIP_PIN_3 5
#define DIP_PIN_4 6
#define DIP_PIN_5 7
#define DIP_PIN_6 8
#define DIP_PIN_7 9

// Output pins (RGB fixture example)
#define RED_PIN 3
#define GREEN_PIN 5
#define BLUE_PIN 6

// Personality modes
enum Personality {
  RGB_FIXTURE,
  RGBW_FIXTURE,
  DIMMER_4CH,
  RELAY_8CH,
  SERVO_8CH
};

// Configuration
Personality currentPersonality = RGB_FIXTURE;
uint16_t dmxStartAddress = 1;
uint8_t dmxData[DMX_CHANNELS];
bool dmxSignalPresent = false;
unsigned long lastDMXFrame = 0;

// Function prototypes
void readDIPSwitch();
void handleDMXFrame();
void updateOutputs();
void updateRGBFixture();
void enterFailsafe();

void setup() {
  // Initialize serial for debugging
  Serial.begin(115200);
  Serial.println("\n\nDMX Receiver Node v1.0");
  Serial.println("======================");
  
  // Initialize status LEDs
  pinMode(DMX_LED_PIN, OUTPUT);
  pinMode(ERROR_LED_PIN, OUTPUT);
  digitalWrite(DMX_LED_PIN, LOW);
  digitalWrite(ERROR_LED_PIN, LOW);
  
  // Initialize DIP switch pins
  for (int i = 0; i < 8; i++) {
    pinMode(DIP_PIN_0 + i, INPUT_PULLUP);
  }
  
  // Read DMX start address from DIP switch
  readDIPSwitch();
  Serial.print("DMX Start Address: ");
  Serial.println(dmxStartAddress);
  
  // Initialize outputs based on personality
  switch (currentPersonality) {
    case RGB_FIXTURE:
      Serial.println("Personality: RGB Fixture (3 channels)");
      pinMode(RED_PIN, OUTPUT);
      pinMode(GREEN_PIN, OUTPUT);
      pinMode(BLUE_PIN, OUTPUT);
      break;
      
    // TODO: Add other personalities
      
    default:
      Serial.println("Unknown personality!");
      digitalWrite(ERROR_LED_PIN, HIGH);
      break;
  }
  
  // Initialize DMX receiver
  Serial.println("Initializing DMX receiver...");
  // TODO: Initialize DMX library for reception
  
  Serial.println("Setup complete!");
  Serial.println("Waiting for DMX signal...");
}

void loop() {
  // Check for DMX frames
  // TODO: Read DMX data from library
  
  // Check if DMX signal is present
  if (millis() - lastDMXFrame < 1000) {
    if (!dmxSignalPresent) {
      dmxSignalPresent = true;
      digitalWrite(DMX_LED_PIN, HIGH);
      Serial.println("DMX signal detected!");
    }
  } else {
    if (dmxSignalPresent) {
      dmxSignalPresent = false;
      digitalWrite(DMX_LED_PIN, LOW);
      Serial.println("DMX signal lost!");
      enterFailsafe();
    }
  }
  
  // Update outputs based on DMX data
  if (dmxSignalPresent) {
    updateOutputs();
  }
  
  // Blink status LED
  static unsigned long lastBlink = 0;
  if (dmxSignalPresent && millis() - lastBlink > 100) {
    digitalWrite(DMX_LED_PIN, !digitalRead(DMX_LED_PIN));
    lastBlink = millis();
  }
}

void readDIPSwitch() {
  // Read 8-bit address from DIP switch
  dmxStartAddress = 0;
  for (int i = 0; i < 8; i++) {
    if (digitalRead(DIP_PIN_0 + i) == LOW) {
      dmxStartAddress |= (1 << i);
    }
  }
  
  // Ensure address is in valid range (1-512)
  if (dmxStartAddress == 0) {
    dmxStartAddress = 1;
  }
}

void updateOutputs() {
  switch (currentPersonality) {
    case RGB_FIXTURE:
      updateRGBFixture();
      break;
      
    // TODO: Add other personalities
      
    default:
      break;
  }
}

void updateRGBFixture() {
  // Read RGB values from DMX
  uint8_t red = dmxData[dmxStartAddress - 1];
  uint8_t green = dmxData[dmxStartAddress];
  uint8_t blue = dmxData[dmxStartAddress + 1];
  
  // Update PWM outputs
  analogWrite(RED_PIN, red);
  analogWrite(GREEN_PIN, green);
  analogWrite(BLUE_PIN, blue);
}

void enterFailsafe() {
  // Failsafe mode: turn off all outputs
  Serial.println("Entering failsafe mode...");
  
  switch (currentPersonality) {
    case RGB_FIXTURE:
      analogWrite(RED_PIN, 0);
      analogWrite(GREEN_PIN, 0);
      analogWrite(BLUE_PIN, 0);
      break;
      
    // TODO: Add other personalities
      
    default:
      break;
  }
}

void handleDMXFrame() {
  // Called when a complete DMX frame is received
  lastDMXFrame = millis();
  
  // TODO: Copy DMX data from library buffer
}
