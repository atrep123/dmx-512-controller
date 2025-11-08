# Changelog

VĹˇechny vĂ˝znamnĂ© zmÄ›ny v projektu DMX 512 KontrolĂ©r jsou zdokumentovĂˇny v tomto souboru.

FormĂˇt je zaloĹľen na [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
a tento projekt dodrĹľuje [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- OLA integraÄŤnĂ­ pipeline (featureâ€‘flag `OUTPUT_MODE=ola`): perâ€‘universe frame store, 44â€Żfps guard, debounce identickĂ˝ch framĹŻ, diagnostickĂ˝ endpoint `GET /universes/:u/frame` a metriky `dmx_core_ola_*`.
- FE testy (Vitest): dmxQueue chunking (â‰¤64), optimisticâ€‘revert pro ScĂ©ny.
- /state nynĂ­ posĂ­lĂˇ ETag a podporuje volitelnĂ˝ `sparse=1` (pĹ™idĂˇ `universesSparse`, `sparse:true`).
- USB DMX backend: Enttec DMX USB PRO driver (`OUTPUT_MODE=enttec`), auto-detekce FTDI zařízení, USB diagnostické endpointy (`GET /usb/devices`, `POST /usb/refresh`, `POST /usb/reconnect`) a nová závislost pyserial.
- Multi-projektová správa a cloudové zálohy (`GET/POST /projects`, `POST /projects/{id}/select`, `GET/POST /projects/{id}/backups`, `POST /projects/{id}/restore`) včetně UI editoru metadat, historie záloh, S3/local storage a volitelného šifrování.- SparkFun DMX vstup: seriálový driver (`DMX_INPUT_ENABLED`, `DMX_INPUT_PORT`) který parsuje logy `DMX: read value from channel X: Y` a mapuje kanály 1–3 na RGB příkazy v enginu.


## [1.1.1] - 2025-11-04

- USB DMX bridge pes Web Serial (ConnectionView dokude patche pmo do USB rozhrand a zobrazuje diagnostiku).
- Knihovna fixture ablon a picker v SetupView (rychlejd patching DMX adres).
- Panel Export/Import s JSON zalodou + sloucendm redimem a novfd Theme toggle s vdtdfdfimi touch targety.
- dmxQueue patch pozorovateld a Vitest pokrytd FixturesView/observer logiky.

### Added
- OdolnÄ›jĹˇĂ­ WebSocket klient s jitter backoffem, heartbeatem a frontou zprĂˇv pro pĹ™Ă­kazy v UI.
- ConnectionView novÄ› zobrazuje offline banner, promĂ©theovskĂ© metriky (`cmds_total`, `queue_depth`, `ws_clients`, `apply_latency`) a nabĂ­zĂ­ ruÄŤnĂ­ refresh bez zobrazovĂˇnĂ­ API klĂ­ÄŤe.
- NovĂ© testy pokrĂ˝vajĂ­ reconnect chovĂˇnĂ­ a REST fallback pĹ™i vypnutĂ©m WebSocketu.
- CI pipeline cache-uje npm/pip artefakty a testy pouĹľĂ­vajĂ­ MQTT service name (`MQTT_HOST=mqtt`).

### Changed
- Service worker ignoruje dynamickĂ© endpointy a nechĂˇvĂˇ `/` i `index.html` vĹľdy naÄŤĂ­st ze sĂ­tÄ›.
- Vite proxy sjednocena do jednoho pravidla a vendor knihovny se bundlujĂ­ do samostatnĂ©ho chunku.
- Docker Compose + Caddy pouĹľĂ­vajĂ­ relativnĂ­ `VITE_WS_URL=/ws` a sprĂˇvnÄ› forwardujĂ­ WebSocket hlaviÄŤky.
- TÄ›ĹľkĂ© React view komponenty se naÄŤĂ­tajĂ­ lazy (React.lazy + Suspense), ÄŤĂ­mĹľ se zmenĹˇil ĂşvodnĂ­ bundle.

### Fixed
- ConnectionView korektnÄ› uklĂ­zĂ­ socket pĹ™i unmountu a nikdy nevypisuje API klĂ­ÄŤ v UI.
- README a Deployment Guide doplnÄ›ny o dev proxy, env promÄ›nnĂ©, compose/Caddy a smoke test postupy.

### PlĂˇnovanĂ© funkce
- Export/Import konfigurace a scĂ©n
- MIDI kontrolĂ©r podpora
- OSC protocol podpora
- Multi-user collaboration
- Timecode synchronizace
- VĂ­ce jazykovĂ˝ch mutacĂ­ (EN, DE)
- Advanced effect editor
- Fixture library (pĹ™edpĹ™ipravenĂ© fixture profily)

## [1.0.0] - 2024-11-01

### Added - NovĂ© funkce
- đźŽ¨ **DMX kontrola** - OvlĂˇdĂˇnĂ­ jednotlivĂ˝ch DMX kanĂˇlĹŻ (0-255)
- đźŚ **RGB/RGBW Color Picker** - IntuitivnĂ­ vĂ˝bÄ›r barev
- đźŽ¬ **Scene Management** - UklĂˇdĂˇnĂ­ a vyvolĂˇvĂˇnĂ­ kompletnĂ­ch stavĹŻ
- âšˇ **14 Preset Effects** - Chase, Strobe, Rainbow, Fade, Sweep, atd.
- đź§© **Block Programming** - VizuĂˇlnĂ­ programovĂˇnĂ­ vlastnĂ­ch efektĹŻ
- đź”§ **Stepper Motor Control** - 16-bit polohovĂˇnĂ­ motorĹŻ
- đźŽŻ **Servo Control** - ĂšhlovĂ© polohovĂˇnĂ­ servomotorĹŻ (0-180Â°)
- đźŽ® **Joystick Control** - Pan/Tilt ovlĂˇdĂˇnĂ­ pomocĂ­ virtuĂˇlnĂ­ho joysticku
- đźŚ **Art-Net Support** - DMX over Ethernet protokol
- đź“± **PWA Support** - Instalace jako nativnĂ­ aplikace
- đźŽ¨ **Custom Page Builder** - VytvĂˇĹ™enĂ­ vlastnĂ­ch ovlĂˇdacĂ­ch panelĹŻ
- đź“Š **Universe Management** - SprĂˇva DMX univerzĂ­ (512 kanĂˇlĹŻ/universe)
- đź’ľ **Offline Storage** - VĹˇechna data uloĹľenĂˇ lokĂˇlnÄ› v IndexedDB
- đźŽ›ď¸Ź **6 Control Blocks** - Reusable UI komponenty pro vlastnĂ­ panely

### Components
- `FixturesView` - SprĂˇva a ovlĂˇdĂˇnĂ­ svÄ›telnĂ˝ch zaĹ™Ă­zenĂ­
- `ScenesView` - SprĂˇva scĂ©n
- `EffectsView` - VytvĂˇĹ™enĂ­ a spouĹˇtÄ›nĂ­ efektĹŻ
- `MotorsView` - OvlĂˇdĂˇnĂ­ motorĹŻ a servomotorĹŻ
- `ConnectionView` - Konfigurace sĂ­ĹĄovĂ©ho pĹ™ipojenĂ­
- `SetupView` - NastavenĂ­ univerzĂ­ a fixtures
- `LiveControlView` - Ĺ˝ivĂˇ kontrola s joystickem
- `CustomPageBuilder` - Builder vlastnĂ­ch strĂˇnek
- `BlockProgramming` - VizuĂˇlnĂ­ editor blokĹŻ
- `ControlBlocksDemo` - Demo UI blokĹŻ

### Control Blocks
- `ChannelSliderBlock` - Slider pro DMX kanĂˇly
- `ColorPickerBlock` - RGB/RGBW color picker
- `ToggleButtonBlock` - On/Off pĹ™epĂ­naÄŤ
- `ButtonPadBlock` - Grid tlaÄŤĂ­tek
- `PositionControlBlock` - Pan/Tilt kontrola
- `IntensityFaderBlock` - VertikĂˇlnĂ­ fader

### Effects
- Chase - PostupnĂ© zapĂ­nĂˇnĂ­ fixtures
- Strobe - RychlĂ© blikĂˇnĂ­
- Rainbow - PlynulĂˇ zmÄ›na barev
- Fade - StmĂ­vĂˇnĂ­/rozsvÄ›covĂˇnĂ­
- Sweep - Pohyb napĹ™Ă­ÄŤ fixtures
- Sparkle - NĂˇhodnĂ© blikĂˇnĂ­
- Wipe - Wipe pĹ™echod
- Bounce - Bounce efekt
- Theater Chase - Theater chase pattern
- Fire - Simulace ohnÄ›
- Wave - Wave pattern
- Pulse - PulsnĂ­ efekt
- Color Fade - Fade mezi barvami
- Block Program - VlastnĂ­ programovĂˇnĂ­

### Documentation
- đź“– KompletnĂ­ README s pĹ™ehledem projektu
- đź¤ť Contributing Guide pro vĂ˝vojĂˇĹ™e
- đźŹ—ď¸Ź Architecture Documentation
- đź“š API Reference pro vĹˇechny typy a funkce
- đź‘¤ User Guide s nĂˇvody k pouĹľitĂ­
- đź“± Android Setup Guide
- đźš€ Deployment Guide
- đźŽ¨ Icons Guide
- đź”’ Security Guide
- đź“‹ PRD (Product Requirements Document)

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

## Verze formĂˇt

Format verzĂ­: `MAJOR.MINOR.PATCH`

- **MAJOR** - Breaking changes, nekompatibilnĂ­ API zmÄ›ny
- **MINOR** - NovĂ© funkce, zpÄ›tnÄ› kompatibilnĂ­
- **PATCH** - Bug fixes, malĂ© vylepĹˇenĂ­

## Typy zmÄ›n

- `Added` - NovĂ© funkce
- `Changed` - ZmÄ›ny v existujĂ­cĂ­ch funkcĂ­ch
- `Deprecated` - Funkce kterĂˇ bude odstranÄ›na
- `Removed` - OdstranÄ›nĂ© funkce
- `Fixed` - Bug fixes
- `Security` - Security fixes

## Contributing

Chcete pĹ™ispÄ›t? PĹ™eÄŤtÄ›te si [Contributing Guide](CONTRIBUTING.md).

---

[Unreleased]: https://github.com/atrep123/dmx-512-controller/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/atrep123/dmx-512-controller/releases/tag/v1.0.0
[0.1.0]: https://github.com/atrep123/dmx-512-controller/releases/tag/v0.1.0
