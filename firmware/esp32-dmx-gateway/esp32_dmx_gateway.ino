/*
  DMX -> HTTP gateway for ESP32 + SparkFun DMX Shield.

  Reads N DMX channels via SparkFunDMX and periodically posts a unified
  `dmx.patch` command to the DMX controller backend.

  Hardware:
    - SparkFun DMX Shield (https://github.com/sparkfun/SparkFunDMX)
    - ESP32 Thing Plus / Feather compatible board

  Connections:
    - Shield EN pin wired to GPIO defined by DMX_ENABLE_PIN (default 21)
    - Shield RX/TX tied to HardwareSerial(2)
    - DMX input cable from external console to shield XLR

  Configure Wi-Fi + server settings below before flashing.
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <PubSubClient.h>
#include <SparkFunDMX.h>

// ---- Wi-Fi & backend configuration ----------------------------------------
const char *WIFI_SSID = "YOUR_WIFI_SSID";
const char *WIFI_PASS = "YOUR_WIFI_PASSWORD";

const char *SERVER_BASE_URL = "http://192.168.0.10:8080"; // e.g. FastAPI backend
const char *SERVER_API_KEY = "demo-key";                  // maps to DMX_VITE_API_KEY/x-api-key
const uint16_t SERVER_UNIVERSE = 0;                       // DMX universe index
const char *DEVICE_SRC = "esp-dmx-gateway";               // appears in metrics/logs

// MQTT (optional). Set USE_MQTT true to publish DMX patches to MQTT instead of HTTP POST.
const bool USE_MQTT = false;
const char *MQTT_HOST = "192.168.0.10";
const uint16_t MQTT_PORT = 1883;
const char *MQTT_TOPIC = "v1/demo/rgb/cmd";
const char *MQTT_USER = "";
const char *MQTT_PASS = "";

// ---- DMX configuration ----------------------------------------------------
const uint16_t DMX_CHANNEL_COUNT = 32;    // Number of channels to monitor (max 512)
const uint8_t DMX_ENABLE_PIN = 21;        // Shield enable pin
const HardwareSerialPort_t DMX_UART = 2;  // UART2 on ESP32 Thing Plus

const uint32_t PATCH_INTERVAL_MS = 100;   // Minimum interval between POSTs
const uint8_t CHANGE_THRESHOLD = 1;       // Only send when value differs by >= threshold

// ---- Globals --------------------------------------------------------------
SparkFunDMX dmx;
HardwareSerial dmxSerial(DMX_UART);
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
uint8_t dmxLastValues[DMX_CHANNEL_COUNT + 1];  // 1-indexed convenience
unsigned long lastPublishMs = 0;

// ---- Helpers --------------------------------------------------------------
String randomCommandId() {
  char buf[27];
  for (int i = 0; i < 26; i++) {
    uint8_t r = random(0, 36);
    buf[i] = (r < 10) ? ('0' + r) : ('A' + r - 10);
  }
  buf[26] = '\0';
  return String(buf);
}

bool ensureWifi() {
  if (WiFi.status() == WL_CONNECTED) {
    return true;
  }
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print(F("Connecting to WiFi"));
  unsigned long started = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - started < 15000) {
    delay(250);
    Serial.print(F("."));
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print(F("WiFi connected, IP: "));
    Serial.println(WiFi.localIP());
    return true;
  }
  Serial.println(F("WiFi connect failed"));
  return false;
}

bool ensureMqtt() {
  if (!USE_MQTT) {
    return false;
  }
  if (!ensureWifi()) {
    return false;
  }
  if (mqttClient.connected()) {
    return true;
  }
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  char clientId[32];
  snprintf(clientId, sizeof(clientId), "dmx-%06X", esp_random() & 0xFFFFFF);
  Serial.print(F("Connecting MQTT..."));
  bool ok;
  if (strlen(MQTT_USER) > 0) {
    ok = mqttClient.connect(clientId, MQTT_USER, MQTT_PASS);
  } else {
    ok = mqttClient.connect(clientId);
  }
  Serial.println(ok ? F("OK") : F("FAIL"));
  return ok;
}

void sendPatch(uint8_t *values, size_t count) {
  String payload;
  payload.reserve(256);
  payload += F("{\"type\":\"dmx.patch\",\"id\":\"");
  payload += randomCommandId();
  payload += F("\",\"src\":\"");
  payload += DEVICE_SRC;
  payload += F("\",\"universe\":");
  payload += SERVER_UNIVERSE;
  payload += F(",\"patch\":[");

  bool first = true;
  for (uint16_t ch = 1; ch <= count; ch++) {
    uint8_t val = values[ch];
    if (abs((int)val - (int)dmxLastValues[ch]) >= CHANGE_THRESHOLD) {
      if (!first) payload += ',';
      payload += F("{\"ch\":");
      payload += ch;
      payload += F(",\"val\":");
      payload += val;
      payload += '}';
      dmxLastValues[ch] = val;
      first = false;
    }
  }

  payload += F("]}");
  if (first) {
    // no changes
    return;
  }

  if (!ensureWifi()) {
    Serial.println(F("Skip publish: WiFi not connected"));
    return;
  }

  if (USE_MQTT) {
    if (!ensureMqtt()) {
      Serial.println(F("Skip publish: MQTT offline"));
      return;
    }
    bool ok = mqttClient.publish(MQTT_TOPIC, payload.c_str());
    Serial.print(F("MQTT publish "));
    Serial.println(ok ? F("OK") : F("FAIL"));
    return;
  }

  HTTPClient http;
  String url = String(SERVER_BASE_URL) + "/command";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  if (strlen(SERVER_API_KEY) > 0) {
    http.addHeader("x-api-key", SERVER_API_KEY);
  }

  Serial.println(F("POST /command ->"));
  Serial.println(payload);

  int status = http.POST(payload);
  if (status <= 0) {
    Serial.print(F("HTTP error: "));
    Serial.println(http.errorToString(status));
  } else {
    Serial.print(F("HTTP status: "));
    Serial.println(status);
    if (status >= 400) {
      Serial.println(http.getString());
    }
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  Serial.println(F("ESP32 DMX -> HTTP gateway"));

  WiFi.mode(WIFI_STA);
  ensureWifi();

  dmxSerial.begin(DMX_BAUD, DMX_FORMAT);
  dmx.begin(dmxSerial, DMX_ENABLE_PIN, DMX_CHANNEL_COUNT);
  dmx.setComDir(DMX_READ_DIR);
  memset(dmxLastValues, 0xFF, sizeof(dmxLastValues));  // Force first publish

  Serial.println(F("DMX initialized."));
}

void loop() {
  dmx.update();
  if (USE_MQTT) {
    mqttClient.loop();
  }
  unsigned long now = millis();
  if (now - lastPublishMs < PATCH_INTERVAL_MS) {
    return;
  }
  lastPublishMs = now;

  uint8_t buffer[DMX_CHANNEL_COUNT + 1];
  for (uint16_t ch = 1; ch <= DMX_CHANNEL_COUNT; ch++) {
    buffer[ch] = dmx.readByte(ch);
  }
  sendPatch(buffer, DMX_CHANNEL_COUNT);
}
