# ESP32 DMX Gateway

Minimal firmware that reads DMX frames via the SparkFun DMX Shield and forwards
changes to the DMX controller backend (`/command` endpoint) as unified
`dmx.patch` payloads.

## Hardware

- [SparkFun DMX Shield](https://github.com/sparkfun/SparkFunDMX)
- ESP32 Thing Plus / Feather-compatible board (HardwareSerial2 available)
- DMX IN cable from your lighting console/pult

## Firmware features

- Uses the SparkFunDMX library to read up to 512 channels (default 32).
- Watches for changes (per channel threshold) and batches them into a single
  HTTP POST to `/command` or MQTT publish (`v1/demo/rgb/cmd`).
- Supports API key header (`x-api-key`), configurable universe/source values,
  and MQTT authentication.
- Reconnects Wi-Fi automatically; logs HTTP response codes via `Serial`.

## Usage

1. Install the SparkFunDMX library in the Arduino IDE (Library Manager ->
   search for `SparkFunDMX`).
2. Copy `esp32_dmx_gateway.ino` into a new sketch folder.
3. Update the configuration block near the top:

   ```cpp
   const char *WIFI_SSID = "YOUR_WIFI";
   const char *WIFI_PASS = "YOUR_PASSWORD";
   const char *SERVER_BASE_URL = "http://192.168.0.10:8080";
   const char *SERVER_API_KEY = "demo-key";
   const uint16_t DMX_CHANNEL_COUNT = 32;
   ```
   To publish via MQTT instead of HTTP, set `USE_MQTT = true` and configure
   `MQTT_HOST`, `MQTT_PORT`, `MQTT_TOPIC`, and credentials.

4. Wire the DMX shield EN pin to GPIO 21 (or adjust `DMX_ENABLE_PIN`), connect
   RX/TX to UART2 (default on Thing Plus).
5. Flash the firmware, open Serial Monitor at 115200 baud, and watch for logs.
6. The backend metrics (`dmx_engine_processed_total`, `/metrics`) will start
   increasing as DMX moves; you can confirm state via `/rgb` or the frontend.

Feel free to swap HTTP for MQTT: publish the same JSON payload to
`v1/demo/rgb/cmd` (QoS 1) if you prefer MQTT transport. The backend already
handles dedupe, sequences, and broadcasting to WebSocket/OLA/USB outputs.
