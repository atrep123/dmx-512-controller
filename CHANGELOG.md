# Changelog

Vsechny vyznamne zmeny v projektu DMX 512 Kontroler jsou zdokumentovany v tomto souboru.

Format je zalozen na [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
a tento projekt dodrzuje [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- OLA integracni pipeline (featureflag `OUTPUT_MODE=ola`): peruniverse frame store, 44fps guard, debounce identickych framu, diagnosticky endpoint `GET /universes/:u/frame` a metriky `dmx_core_ola_*`.
- FE testy (Vitest): dmxQueue chunking (64), optimisticrevert pro Sceny.
- /state nyni posila ETag a podporuje volitelny `sparse=1` (prida `universesSparse`, `sparse:true`).

## [1.1.1] - 2025-11-04

### Added
- Odolnejsi WebSocket klient s jitter backoffem, heartbeatem a frontou zprav pro prikazy v UI.
- ConnectionView nove zobrazuje offline banner, prometheovske metriky (`cmds_total`, `queue_depth`, `ws_clients`, `apply_latency`) a nabizi rucni refresh bez zobrazovani API klice.
- Nove testy pokryvaji reconnect chovani a REST fallback pri vypnutem WebSocketu.
- CI pipeline cache-uje npm/pip artefakty a testy pouzivaji MQTT service name (`MQTT_HOST=mqtt`).

### Changed
- Service worker ignoruje dynamicke endpointy a nechava `/` i `index.html` vzdy nacist ze site.
- Vite proxy sjednocena do jednoho pravidla a vendor knihovny se bundluji do samostatneho chunku.
- Docker Compose + Caddy pouzivaji relativni `VITE_WS_URL=/ws` a spravne forwarduji WebSocket hlavicky.
- Tezke React view komponenty se nacitaji lazy (React.lazy + Suspense), cimz se zmensil uvodni bundle.

### Fixed
- ConnectionView korektne uklizi socket pri unmountu a nikdy nevypisuje API klic v UI.
- README a Deployment Guide doplneny o dev proxy, env promenne, compose/Caddy a smoke test postupy.

### Planovane funkce
- Export/Import konfigurace a scen
- MIDI kontroler podpora
- OSC protocol podpora
- Multi-user collaboration
- Timecode synchronizace
- Vice jazykovych mutaci (EN, DE)
- Advanced effect editor
- Fixture library (predpripravene fixture profily)

## [1.0.0] - 2024-11-01

### Added - Nove funkce
-  **DMX kontrola** - Ovladani jednotlivych DMX kanalu (0-255)
-  **RGB/RGBW Color Picker** - Intuitivni vyber barev
-  **Scene Management** - Ukladani a vyvolavani kompletnich stavu
-  **14 Preset Effects** - Chase, Strobe, Rainbow, Fade, Sweep, atd.
-  **Block Programming** - Vizualni programovani vlastnich efektu
-  **Stepper Motor Control** - 16-bit polohovani motoru
- Target **Servo Control** - Uhlove polohovani servomotoru (0-180)
-  **Joystick Control** - Pan/Tilt ovladani pomoci virtualniho joysticku
-  **Art-Net Support** - DMX over Ethernet protokol
-  **PWA Support** - Instalace jako nativni aplikace
-  **Custom Page Builder** - Vytvareni vlastnich ovladacich panelu
-  **Universe Management** - Sprava DMX univerzi (512 kanalu/universe)
-  **Offline Storage** - Vsechna data ulozena lokalne v IndexedDB
-  **6 Control Blocks** - Reusable UI komponenty pro vlastni panely

### Components
- `FixturesView` - Sprava a ovladani svetelnych zarizeni
- `ScenesView` - Sprava scen
- `EffectsView` - Vytvareni a spousteni efektu
- `MotorsView` - Ovladani motoru a servomotoru
- `ConnectionView` - Konfigurace sitoveho pripojeni
- `SetupView` - Nastaveni univerzi a fixtures
- `LiveControlView` - Ziva kontrola s joystickem
- `CustomPageBuilder` - Builder vlastnich stranek
- `BlockProgramming` - Vizualni editor bloku
- `ControlBlocksDemo` - Demo UI bloku

### Control Blocks
- `ChannelSliderBlock` - Slider pro DMX kanaly
- `ColorPickerBlock` - RGB/RGBW color picker
- `ToggleButtonBlock` - On/Off prepinac
- `ButtonPadBlock` - Grid tlacitek
- `PositionControlBlock` - Pan/Tilt kontrola
- `IntensityFaderBlock` - Vertikalni fader

### Effects
- Chase - Postupne zapinani fixtures
- Strobe - Rychle blikani
- Rainbow - Plynula zmena barev
- Fade - Stmivani/rozsvecovani
- Sweep - Pohyb napric fixtures
- Sparkle - Nahodne blikani
- Wipe - Wipe prechod
- Bounce - Bounce efekt
- Theater Chase - Theater chase pattern
- Fire - Simulace ohne
- Wave - Wave pattern
- Pulse - Pulsni efekt
- Color Fade - Fade mezi barvami
- Block Program - Vlastni programovani

### Documentation
- Book Kompletni README s prehledem projektu
- Handshake Contributing Guide pro vyvojare
- Build Architecture Documentation
-  API Reference pro vsechny typy a funkce
-  User Guide s navody k pouziti
-  Android Setup Guide
- Rocket Deployment Guide
-  Icons Guide
-  Security Guide
- Clipboard PRD (Product Requirements Document)

### Technology Stack
- React 19.0
- TypeScript 5.7
- Vite 6.3
- Tailwind CSS 4.1
- shadcn/ui komponenty
- Radix UI primitives
- Phosphor Icons
- Framer Motion animace
- @github/spark KV store

### Design
- Dark professional theme
- Triadic color scheme (Deep Cyan + Magenta)
- Mobile-first responsive design
- WCAG AA compliant accessibility
- Touch-optimized controls
- Inter font family

### Performance
- Lazy loading komponent
- Optimized rendering s React.memo
- 60fps animations
- Efficient IndexedDB storage
- Service Worker caching

## [0.1.0] - 2024-10-15

### Added
- Initial project setup
- Basic React + TypeScript configuration
- Tailwind CSS styling
- shadcn/ui integration
- Basic DMX types

## Verze format

Format verzi: `MAJOR.MINOR.PATCH`

- **MAJOR** - Breaking changes, nekompatibilni API zmeny
- **MINOR** - Nove funkce, zpetne kompatibilni
- **PATCH** - Bug fixes, male vylepseni

## Typy zmen

- `Added` - Nove funkce
- `Changed` - Zmeny v existujicich funkcich
- `Deprecated` - Funkce ktera bude odstranena
- `Removed` - Odstranene funkce
- `Fixed` - Bug fixes
- `Security` - Security fixes

## Contributing

Chcete prispet? Prectete si [Contributing Guide](CONTRIBUTING.md).

---

[Unreleased]: https://github.com/atrep123/dmx-512-controller/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/atrep123/dmx-512-controller/releases/tag/v1.0.0
[0.1.0]: https://github.com/atrep123/dmx-512-controller/releases/tag/v0.1.0
