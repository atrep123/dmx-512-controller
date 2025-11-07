# Changelog

Všechny významné změny v projektu DMX 512 Kontrolér jsou zdokumentovány v tomto souboru.

Formát je založen na [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
a tento projekt dodržuje [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- OLA integrační pipeline (feature‑flag `OUTPUT_MODE=ola`): per‑universe frame store, 44 fps guard, debounce identických framů, diagnostický endpoint `GET /universes/:u/frame` a metriky `dmx_core_ola_*`.
- FE testy (Vitest): dmxQueue chunking (≤64), optimistic‑revert pro Scény.
- /state nyní posílá ETag a podporuje volitelný `sparse=1` (přidá `universesSparse`, `sparse:true`).

## [1.1.1] - 2025-11-04

- USB DMX bridge pes Web Serial (ConnectionView dokude patche pmo do USB rozhrand a zobrazuje diagnostiku).
- Knihovna fixture ablon a picker v SetupView (rychlejd patching DMX adres).
- Panel Export/Import s JSON zalodou + sloucendm redimem a novfd Theme toggle s vdtdfdfimi touch targety.
- dmxQueue patch pozorovateld a Vitest pokrytd FixturesView/observer logiky.

### Added
- Odolnější WebSocket klient s jitter backoffem, heartbeatem a frontou zpráv pro příkazy v UI.
- ConnectionView nově zobrazuje offline banner, prométheovské metriky (`cmds_total`, `queue_depth`, `ws_clients`, `apply_latency`) a nabízí ruční refresh bez zobrazování API klíče.
- Nové testy pokrývají reconnect chování a REST fallback při vypnutém WebSocketu.
- CI pipeline cache-uje npm/pip artefakty a testy používají MQTT service name (`MQTT_HOST=mqtt`).

### Changed
- Service worker ignoruje dynamické endpointy a nechává `/` i `index.html` vždy načíst ze sítě.
- Vite proxy sjednocena do jednoho pravidla a vendor knihovny se bundlují do samostatného chunku.
- Docker Compose + Caddy používají relativní `VITE_WS_URL=/ws` a správně forwardují WebSocket hlavičky.
- Těžké React view komponenty se načítají lazy (React.lazy + Suspense), čímž se zmenšil úvodní bundle.

### Fixed
- ConnectionView korektně uklízí socket při unmountu a nikdy nevypisuje API klíč v UI.
- README a Deployment Guide doplněny o dev proxy, env proměnné, compose/Caddy a smoke test postupy.

### Plánované funkce
- Export/Import konfigurace a scén
- MIDI kontrolér podpora
- OSC protocol podpora
- Multi-user collaboration
- Timecode synchronizace
- Více jazykových mutací (EN, DE)
- Advanced effect editor
- Fixture library (předpřipravené fixture profily)

## [1.0.0] - 2024-11-01

### Added - Nové funkce
- 🎨 **DMX kontrola** - Ovládání jednotlivých DMX kanálů (0-255)
- 🌈 **RGB/RGBW Color Picker** - Intuitivní výběr barev
- 🎬 **Scene Management** - Ukládání a vyvolávání kompletních stavů
- ⚡ **14 Preset Effects** - Chase, Strobe, Rainbow, Fade, Sweep, atd.
- 🧩 **Block Programming** - Vizuální programování vlastních efektů
- 🔧 **Stepper Motor Control** - 16-bit polohování motorů
- 🎯 **Servo Control** - Úhlové polohování servomotorů (0-180°)
- 🎮 **Joystick Control** - Pan/Tilt ovládání pomocí virtuálního joysticku
- 🌐 **Art-Net Support** - DMX over Ethernet protokol
- 📱 **PWA Support** - Instalace jako nativní aplikace
- 🎨 **Custom Page Builder** - Vytváření vlastních ovládacích panelů
- 📊 **Universe Management** - Správa DMX univerzí (512 kanálů/universe)
- 💾 **Offline Storage** - Všechna data uložená lokálně v IndexedDB
- 🎛️ **6 Control Blocks** - Reusable UI komponenty pro vlastní panely

### Components
- `FixturesView` - Správa a ovládání světelných zařízení
- `ScenesView` - Správa scén
- `EffectsView` - Vytváření a spouštění efektů
- `MotorsView` - Ovládání motorů a servomotorů
- `ConnectionView` - Konfigurace síťového připojení
- `SetupView` - Nastavení univerzí a fixtures
- `LiveControlView` - Živá kontrola s joystickem
- `CustomPageBuilder` - Builder vlastních stránek
- `BlockProgramming` - Vizuální editor bloků
- `ControlBlocksDemo` - Demo UI bloků

### Control Blocks
- `ChannelSliderBlock` - Slider pro DMX kanály
- `ColorPickerBlock` - RGB/RGBW color picker
- `ToggleButtonBlock` - On/Off přepínač
- `ButtonPadBlock` - Grid tlačítek
- `PositionControlBlock` - Pan/Tilt kontrola
- `IntensityFaderBlock` - Vertikální fader

### Effects
- Chase - Postupné zapínání fixtures
- Strobe - Rychlé blikání
- Rainbow - Plynulá změna barev
- Fade - Stmívání/rozsvěcování
- Sweep - Pohyb napříč fixtures
- Sparkle - Náhodné blikání
- Wipe - Wipe přechod
- Bounce - Bounce efekt
- Theater Chase - Theater chase pattern
- Fire - Simulace ohně
- Wave - Wave pattern
- Pulse - Pulsní efekt
- Color Fade - Fade mezi barvami
- Block Program - Vlastní programování

### Documentation
- 📖 Kompletní README s přehledem projektu
- 🤝 Contributing Guide pro vývojáře
- 🏗️ Architecture Documentation
- 📚 API Reference pro všechny typy a funkce
- 👤 User Guide s návody k použití
- 📱 Android Setup Guide
- 🚀 Deployment Guide
- 🎨 Icons Guide
- 🔒 Security Guide
- 📋 PRD (Product Requirements Document)

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

## Verze formát

Format verzí: `MAJOR.MINOR.PATCH`

- **MAJOR** - Breaking changes, nekompatibilní API změny
- **MINOR** - Nové funkce, zpětně kompatibilní
- **PATCH** - Bug fixes, malé vylepšení

## Typy změn

- `Added` - Nové funkce
- `Changed` - Změny v existujících funkcích
- `Deprecated` - Funkce která bude odstraněna
- `Removed` - Odstraněné funkce
- `Fixed` - Bug fixes
- `Security` - Security fixes

## Contributing

Chcete přispět? Přečtěte si [Contributing Guide](CONTRIBUTING.md).

---

[Unreleased]: https://github.com/atrep123/dmx-512-controller/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/atrep123/dmx-512-controller/releases/tag/v1.0.0
[0.1.0]: https://github.com/atrep123/dmx-512-controller/releases/tag/v0.1.0
