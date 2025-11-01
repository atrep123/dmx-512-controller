# Android App - TODO a Chybějící Funkce

## ✅ Již Implementováno

- [x] React PWA s mobilním rozhraním
- [x] DMX kanálové ovládání (0-255)
- [x] Správa scén
- [x] Automatizované efekty
- [x] Ovládání motorů (krokové + servo)
- [x] Vizuální programování bloků
- [x] Vlastní stavba stránek
- [x] PWA podpora pro Android/iOS

## 📋 Co Chybí a Je Třeba Přidat

### Síťová Komunikace

- [ ] **Art-Net Sender** - Implementovat skutečné odesílání Art-Net paketů
  - Vytvořit UDP socket pro Art-Net (port 6454)
  - Implementovat Art-Net packet builder
  - Přidat broadcast/unicast režimy
  - Soubor: `src/lib/artnet-sender.ts`

- [ ] **sACN Sender** - Implementovat skutečné odesílání sACN paketů
  - Vytvořit UDP socket pro sACN (port 5568)
  - Implementovat E1.31 packet builder
  - Multicast podpora
  - Soubor: `src/lib/sacn-sender.ts`

- [ ] **WebSocket Client** - Připojení k serveru
  - Implementovat WebSocket klient
  - Auto-reconnect logika
  - Heartbeat/ping-pong
  - Soubor: `src/lib/websocket-client.ts`

- [ ] **Communication Manager** - Centrální správa komunikace
  - Integrovat Art-Net, sACN a WebSocket
  - Správa více univerz současně
  - Queue pro odesílání paketů
  - Soubor: `src/lib/communication-manager.ts`

### Datová Persistence

- [ ] **Export/Import Konfigurace**
  - Export všech nastavení do JSON
  - Import konfigurace ze souboru
  - Backup/restore funkcionalita
  - Soubor: `src/lib/config-export.ts`

- [ ] **Cloud Sync** (volitelné)
  - Synchronizace s cloud úložištěm
  - Offline first strategie
  - Konflikt resolving

### Efekty a Animace

- [ ] **DMX Efekty Library**
  - Chase (postupné rozsvícení)
  - Strobe (blikání)
  - Rainbow (barevný přechod)
  - Fade (plynulý přechod)
  - Sweep (zametání)
  - Soubor: `src/lib/effects/`

- [ ] **Časovač Efektů**
  - Plánování efektů na určitý čas
  - Kalendář představení
  - Soubor: `src/lib/scheduler.ts`

### Uživatelské Rozhraní

- [ ] **Fixture Library**
  - Předdefinované profily svítidel
  - Import GDTF profilů
  - Custom fixture editor
  - Soubor: `src/lib/fixture-library.ts`

- [ ] **Vizualizace**
  - 2D layout stage planu
  - Live DMX monitor
  - Graphical channel display
  - Soubor: `src/components/Visualizer.tsx`

- [ ] **Joystick pro Motory**
  - Vylepšený joystick control
  - Multi-touch podpora
  - Haptic feedback
  - Soubor: `src/components/AdvancedJoystick.tsx`

### Výkon a Optimalizace

- [ ] **DMX Frame Rate Optimization**
  - Optimalizovat refresh rate (40-44 Hz)
  - Snížit latenci
  - Buffer management

- [ ] **Memory Management**
  - Optimalizovat použití paměti
  - Lazy loading komponent
  - Virtual scrolling pro dlouhé seznamy

### Integrace s Hardware

- [ ] **USB DMX Interface Support**
  - WebUSB API integrace
  - DMXKing support
  - Enttec support
  - Soubor: `src/lib/usb-dmx.ts`

- [ ] **MIDI Controller Support**
  - Web MIDI API integrace
  - Mapping MIDI → DMX
  - Learn mode
  - Soubor: `src/lib/midi-controller.ts`

### Bezpečnost

- [ ] **Autentizace**
  - Login/logout funkcionalita
  - JWT token management
  - Role-based access control

- [ ] **Šifrování**
  - Šifrování citlivých dat v localStorage
  - HTTPS enforcement

### Testování

- [ ] **Unit Tests**
  - Testy pro všechny komponenty
  - Testing library setup
  - Mock pro network calls

- [ ] **Integration Tests**
  - E2E testy pro kritické workflows
  - Cypress nebo Playwright setup

- [ ] **Performance Tests**
  - DMX frame rate testy
  - Latency měření
  - Load testing

### Dokumentace

- [ ] **Uživatelská Příručka**
  - Krok-za-krokem tutoriály
  - Video návody
  - FAQ sekce

- [ ] **API Dokumentace**
  - JSDoc komentáře
  - API reference
  - Příklady použití

## 🔧 Technické Dluhy

- [ ] Refaktorovat velké komponenty na menší
- [ ] Odstranit duplicitní kód
- [ ] Přidat TypeScript strict mode
- [ ] Aktualizovat závislosti
- [ ] Optimalizovat bundle size

## 📦 Chybějící Závislosti

Závislosti k přidání do `package.json`:

```json
{
  "dependencies": {
    "dgram": "^1.0.1",           // UDP socket (Art-Net/sACN)
    "ws": "^8.0.0",               // WebSocket client
    "jszip": "^3.10.0",           // Export/import
    "crypto-js": "^4.2.0"         // Šifrování
  },
  "devDependencies": {
    "vitest": "^1.0.0",           // Unit testing
    "cypress": "^13.0.0",         // E2E testing
    "@testing-library/react": "^14.0.0"
  }
}
```

## 🎯 Priority

### Vysoká Priorita (P0)
1. Art-Net/sACN skutečné odesílání
2. WebSocket klient pro server
3. Communication Manager

### Střední Priorita (P1)
4. USB DMX podpora
5. Export/Import konfigurace
6. Fixture library

### Nízká Priorita (P2)
7. Cloud sync
8. MIDI podpora
9. Vizualizace

## 📝 Poznámky

- Před implementací síťových funkcí je třeba otestovat na reálném hardware
- Art-Net/sACN vyžaduje UDP, které nemusí být dostupné ve všech prohlížečích
- Zvážit fallback na WebSocket proxy přes server pro prohlížeče bez UDP
- PWA má omezení pro přístup k nízkoúrovňovým síťovým funkcím
