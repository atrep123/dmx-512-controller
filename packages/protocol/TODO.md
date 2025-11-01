# Protocol Package - TODO a Chybějící Funkce

## ✅ Již Implementováno

- [x] TypeScript typy pro základní entity (Universe, Fixture, Scene, Effect)
- [x] Motor typy (StepperMotor, Servo)
- [x] Art-Net packet struktura
- [x] sACN packet struktura
- [x] WebSocket message schémata
- [x] Konstanty pro DMX timing, Art-Net, sACN

## 📋 Co Chybí a Je Třeba Přidat

### Validace a Schémata

- [ ] **Zod Validation Schemas**
  - Validační schémata pro všechny typy
  - Runtime validation
  - Error messages v češtině
  - Soubor: `src/validation/schemas.ts`

- [ ] **JSON Schema Definitions**
  - JSON Schema pro REST API
  - OpenAPI/Swagger definice
  - Soubor: `src/schemas/openapi.json`

### Síťové Protokoly - Detailní Implementace

- [ ] **Art-Net Protocol Implementation**
  - ArtPoll packet builder
  - ArtPollReply parser
  - ArtDmx packet builder/parser
  - ArtSync support
  - RDM support
  - Soubor: `src/network/artnet/`

- [ ] **sACN Protocol Implementation**
  - Complete E1.31 packet builder
  - Universe discovery
  - Priority handling
  - Preview mode support
  - Soubor: `src/network/sacn/`

- [ ] **DMX-512A Standard**
  - Kompletní DMX packet builder
  - RDM command support
  - DMX start codes
  - Soubor: `src/dmx/dmx512a.ts`

### Message Queue a Buffering

- [ ] **Message Queue System**
  - FIFO queue pro DMX pakety
  - Priority queue
  - Rate limiting
  - Soubor: `src/queue/message-queue.ts`

- [ ] **Buffer Management**
  - Circular buffer pro DMX data
  - Double buffering
  - Memory pooling
  - Soubor: `src/buffer/buffer-manager.ts`

### Fixture Definitions

- [ ] **Fixture Profile Format**
  - Standardní formát pro fixture profily
  - GDTF import/export
  - Channel personality definitions
  - Soubor: `src/fixtures/profile-format.ts`

- [ ] **Common Fixture Profiles**
  - RGB PAR
  - RGBW fixtures
  - Moving heads
  - Dimmers
  - Soubor: `src/fixtures/profiles/`

### Error Handling

- [ ] **Error Types**
  - Custom error třídy
  - Error codes
  - Lokalizované error messages
  - Soubor: `src/errors/error-types.ts`

- [ ] **Error Recovery**
  - Retry strategies
  - Fallback mechanisms
  - Soubor: `src/errors/recovery.ts`

### Serializace a Deserializace

- [ ] **Binary Protocol Handlers**
  - Binary encoding/decoding
  - Endianness handling
  - Checksum calculation
  - Soubor: `src/serialization/binary.ts`

- [ ] **Protocol Converters**
  - Art-Net ↔ sACN conversion
  - DMX ↔ Network protocol mapping
  - Soubor: `src/converters/`

### C++ Headers pro Embedded

- [ ] **C++ Header Files**
  - DMX protocol structs
  - Art-Net structs
  - sACN structs
  - Compatibility s Arduino
  - Soubor: `include/dmx_protocol.h`

- [ ] **Arduino Library**
  - Arduino wrapper pro protokol
  - Examples pro PlatformIO
  - Soubor: `arduino/`

### Timing a Synchronizace

- [ ] **Timing Utilities**
  - DMX frame rate calculator
  - Timing validator
  - Jitter measurement
  - Soubor: `src/timing/utilities.ts`

- [ ] **Synchronization**
  - Multi-universe sync
  - Timecode support (SMPTE)
  - Beat sync
  - Soubor: `src/sync/`

### Discovery Protocols

- [ ] **Node Discovery**
  - mDNS/Bonjour for service discovery
  - Art-Net poll/poll-reply
  - sACN universe discovery
  - Soubor: `src/discovery/`

### Dokumentace

- [ ] **Protocol Specification Documents**
  - Detailní protokol dokumentace
  - Message flow diagrams
  - Sequence diagrams
  - Soubor: `docs/protocols/`

- [ ] **API Reference**
  - TypeDoc generovaná dokumentace
  - Code examples
  - Best practices

## 🔧 Technické Dluhy

- [ ] Přidat testy pro všechny typy
- [ ] Code coverage > 80%
- [ ] Benchmark performance
- [ ] Optimalizovat package size

## 📦 Chybějící Závislosti

Závislosti k přidání do `package.json`:

```json
{
  "dependencies": {
    "zod": "^3.22.0",              // Validation
    "buffer": "^6.0.3",            // Binary handling
    "crc": "^4.3.2"                // Checksum calculation
  },
  "devDependencies": {
    "vitest": "^1.0.0",            // Testing
    "typedoc": "^0.25.0",          // Documentation
    "benchmark": "^2.1.4"          // Performance testing
  }
}
```

## 🎯 Priority

### Vysoká Priorita (P0)
1. Zod validation schemas
2. Complete Art-Net implementation
3. Complete sACN implementation
4. C++ headers pro embedded

### Střední Priorita (P1)
5. Fixture profile format
6. Error types a handling
7. Message queue system
8. Binary protocol handlers

### Nízká Priorita (P2)
9. Timecode support
10. RDM support
11. GDTF import/export

## 📝 Poznámky

- Protocol package je foundation pro všechny ostatní komponenty
- Změny zde ovlivňují všechny ostatní packages
- Důležitá je zpětná kompatibilita
- C++ headers musí být kompatibilní s různými platformami (Arduino, ESP32, STM32)
- Testování na reálném hardware je kritické
