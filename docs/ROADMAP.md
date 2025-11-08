# Roadmap - PlĂˇnovanĂ© funkce

PĹ™ehled plĂˇnovanĂ˝ch funkcĂ­ a vylepĹˇenĂ­ pro DMX 512 KontrolĂ©r aplikaci.

## đź“‹ Obsah

- [AktuĂˇlnĂ­ verze](#aktuĂˇlnĂ­-verze)
- [V1.1 - NejbliĹľĹˇĂ­ update](#v11---nejbliĹľĹˇĂ­-update)
- [V1.2 - Data Management](#v12---data-management)
- [V1.3 - MIDI Support](#v13---midi-support)
- [V2.0 - Pro Features](#v20---pro-features)
- [DlouhodobĂ© plĂˇny](#dlouhodobĂ©-plĂˇny)
- [KomunitnĂ­ poĹľadavky](#komunitnĂ­-poĹľadavky)

## đźŽŻ AktuĂˇlnĂ­ verze

### V1.0 (Current) âś…

**Stav**: SpuĹˇtÄ›no 2024-11-01

**KlĂ­ÄŤovĂ© funkce:**
- âś… DMX kontrola (512 kanĂˇlĹŻ per universe)
- âś… RGB/RGBW color picker
- âś… Scene management
- âś… 14 preset effects
- âś… Block programming
- âś… Stepper motor control (16-bit)
- âś… Servo control (0-180Â°)
- âś… Joystick Pan/Tilt control
- âś… Art-Net support
- âś… PWA support (offline mode)
- âś… Custom page builder
- âś… 6 control blocks

## đźš€ V1.1 - NejbliĹľĹˇĂ­ update

**PlĂˇnovanĂ© vydĂˇnĂ­**: Q1 2025  
**ZamÄ›Ĺ™enĂ­**: UĹľivatelskĂ© vylepĹˇenĂ­ a polish

### NovĂ© funkce

#### 1. Testing Framework âšˇ VysokĂˇ priorita
- [x] Vitest setup
- [x] React Testing Library
- [x] Component tests
- [x] Integration tests
- [ ] E2E tests (Playwright)

**ProÄŤ**: Zajistit kvalitu kĂłdu a prevenci regresĂ­

#### 2. USB DMX Support đź”Ś VysokĂˇ priorita
- [x] Web Serial API integration
- [x] Support pro bÄ›ĹľnĂ© USB DMX interfaces
- [x] Enttec DMX USB PRO support
- [x] Auto-detection devices

**Use case**: PĹ™Ă­mĂ© pĹ™ipojenĂ­ k DMX bez Art-Net node

#### 3. Fixture Templates đź“š StĹ™ednĂ­ priorita
- [x] Library bÄ›ĹľnĂ˝ch fixtures
- [x] Template picker pĹ™i pĹ™idĂˇvĂˇnĂ­ fixture
- [ ] Community fixture contributions
- [ ] Import custom fixture profiles

**Fixtures v library:**
- Generic RGB Par (3ch, 4ch, 7ch)
- Generic Moving Head (16ch, 20ch, 24ch)
- Popular brands (Chauvet, ADJ, Martin)

#### 4. UI/UX Improvements đźŽ¨ StĹ™ednĂ­ priorita
- [x] Dark/Light theme toggle
- [ ] Customizable color scheme
- [x] Larger touch targets na mobilech
- [ ] Better gesture support
- [ ] Haptic feedback (vibrace)

#### 5. Performance Optimizations âšˇ NĂ­zkĂˇ priorita
- [ ] Virtual scrolling pro velkĂ© seznamy
- [ ] React.memo optimizations
- [ ] Lazy loading improvements
- [ ] Reduced bundle size
- [ ] Better caching strategy

## đź’ľ V1.2 - Data Management

**PlĂˇnovanĂ© vydĂˇnĂ­**: Q2 2025  
**ZamÄ›Ĺ™enĂ­**: Import/Export a zĂˇlohy

### NovĂ© funkce

#### 1. Export/Import đź’Ľ VysokĂˇ priorita
- [x] Export celĂ© konfigurace (JSON)
- [x] Export jednotlivĂ˝ch scĂ©n
- [x] Export effects
- [x] Import konfigurace
- [x] Merge import (slouÄŤenĂ­ s existujĂ­cĂ­mi daty)

**FormĂˇt**: JSON s verzovĂˇnĂ­m

**Use cases:**
- Backup pĹ™ed showem
- SdĂ­lenĂ­ konfigurace mezi zaĹ™Ă­zenĂ­mi
- Template sharing v komunitÄ›

#### 2. Cloud Backup âď¸Ź StĹ™ednĂ­ priorita
- [x] Optional cloud storage
- [x] Auto-backup mo��nost
- [x] Restore z cloud
- [x] Version history

**Privacy**: Opt-in, ĹˇifrovanĂ©, ĹľĂˇdnĂ© tracky

#### 3. Project Management đź“ StĹ™ednĂ­ priorita
- [x] Multiple projects
- [x] Project switching
- [x] Project templates
- [x] Project metadata (venue, date, notes)

**Use case**: RĹŻznĂ© projekty pro rĹŻznĂˇ venue

#### 4. Scene Organization đź—‚ď¸Ź NĂ­zkĂˇ priorita
- [ ] Scene folders
- [ ] Scene tagging
- [ ] Scene filtering
- [ ] Scene duplication
- [ ] Batch operations

## đźŽą V1.3 - MIDI Support

**PlĂˇnovanĂ© vydĂˇnĂ­**: Q3 2025  
**ZamÄ›Ĺ™enĂ­**: HardwarovĂ© ovlĂˇdĂˇnĂ­

### NovĂ© funkce

#### 1. MIDI Input đźŽ›ď¸Ź VysokĂˇ priorita
- [ ] Web MIDI API integration
- [ ] MIDI device detection
- [ ] MIDI learn funkce
- [ ] Fader mapping
- [ ] Button mapping
- [ ] Encoder support

**PodporovanĂ© kontrolĂ©ry:**
- AKAI APC mini/40
- Novation Launchpad
- Behringer X-Touch
- Generic MIDI controllers

#### 2. MIDI Mapping đź”— VysokĂˇ priorita
- [ ] Visual mapping interface
- [ ] Save/load mappings
- [ ] Multiple mapping profiles
- [ ] MIDI feedback (LED sync)

**MapovatelnĂ© funkce:**
- Channel faders â†’ MIDI CC
- Scene triggers â†’ MIDI notes
- Effect toggle â†’ MIDI notes
- Color picker â†’ MIDI encoder

#### 3. MIDI Clock Sync âŹ±ď¸Ź StĹ™ednĂ­ priorita
- [ ] MIDI clock input
- [ ] Tempo-synced effects
- [ ] Beat-triggered scenes
- [ ] BPM detection

**Use case**: Sync svÄ›tel s hudbou pĹ™es MIDI

## đźŽ¬ V2.0 - Pro Features

**PlĂˇnovanĂ© vydĂˇnĂ­**: Q4 2025  
**ZamÄ›Ĺ™enĂ­**: ProfesionĂˇlnĂ­ features

### NovĂ© funkce

#### 1. Cue List đź“‹ VysokĂˇ priorita
- [ ] Cue creation
- [ ] Fade times per cue
- [ ] Cue editing
- [ ] Cue triggering (manual/auto)
- [ ] Follow cues
- [ ] Wait times

**UI:**
- Timeline view
- Cue spreadsheet
- Real-time playback

#### 2. Timecode Support âŹ° VysokĂˇ priorita
- [ ] SMPTE timecode input
- [ ] Art-Net timecode
- [ ] OSC timecode
- [ ] Timecode-triggered cues
- [ ] Timecode display

**Use case:** ProgramovĂˇnĂ­ show s audio/video sync

#### 3. Multi-User Support đź‘Ą StĹ™ednĂ­ priorita
- [ ] WebSocket server
- [ ] Real-time sync mezi devices
- [ ] Role-based access (admin/operator/view)
- [ ] Conflict resolution
- [ ] User presence indication

**Architektura:** Optional server mode

#### 4. Advanced Effects đźŚź StĹ™ednĂ­ priorita
- [ ] Effect generator
- [ ] Pixel mapping
- [ ] Matrix effects (2D grid)
- [ ] Video-to-DMX
- [ ] Audio-reactive effects

#### 5. Fixture Library Import đź“¦ StĹ™ednĂ­ priorita
- [ ] GDTF import
- [ ] MVR import
- [ ] Fixture Builder Pro profiles
- [ ] Custom fixture editor

#### 6. Show Recording đź“ą NĂ­zkĂˇ priorita
- [ ] Record live show
- [ ] Playback recorded show
- [ ] Edit recording
- [ ] Export show file

## đź”® DlouhodobĂ© plĂˇny

### V3.0+ - Enterprise Features

**PotenciĂˇlnĂ­ timeline**: 2026+

#### Network Features
- [ ] sACN full implementation
- [ ] RDM (Remote Device Management)
- [ ] Multiple Art-Net nodes
- [ ] Network discovery/scanning
- [ ] DMX monitoring

#### Integration
- [ ] OSC protocol support
- [ ] REST API
- [ ] Webhooks
- [ ] Third-party integrations (MA, Hog, etc.)

#### Advanced Programming
- [ ] Effect editor with visual programming
- [ ] LUA scripting support
- [ ] Python scripting support
- [ ] Macro system

#### Platform
- [ ] Native iOS app
- [ ] Native Android app
- [ ] Desktop app (Electron/Tauri)
- [ ] Server version

#### Professional Tools
- [ ] Visualizer integration
- [ ] 3D venue planning
- [ ] Paperwork generation
- [ ] Magic sheets
- [ ] Reports and analytics

## đź—łď¸Ź KomunitnĂ­ poĹľadavky

Hlasujte pro features kterĂ© chcete vidÄ›t jako prvnĂ­!

### Top requested features

1. **Fixture Library** (45 hlasĹŻ) đź”Ą
2. **Export/Import** (38 hlasĹŻ) đź”Ą
3. **MIDI Support** (32 hlasĹŻ)
4. **Cue List** (28 hlasĹŻ)
5. **USB DMX** (24 hlasĹŻ)
6. **Dark Theme** (22 hlasĹŻ)
7. **Multi-User** (18 hlasĹŻ)
8. **Timecode** (15 hlasĹŻ)

**Jak hlasovat:**
- [Feature Requests](https://github.com/atrep123/dmx-512-controller/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)
- Dejte đź‘Ť na issue kterĂ© chcete
- Nebo vytvoĹ™te novĂ˝ feature request

## đź“Š Prioritizace

### KritĂ©ria pro prioritizaci

1. **User demand** - Kolik uĹľivatelĹŻ o to stojĂ­
2. **Impact** - Jak moc to pomĹŻĹľe uĹľivatelĹŻm
3. **Effort** - Jak nĂˇroÄŤnĂˇ je implementace
4. **Dependencies** - Co musĂ­ bĂ˝t hotovĂ© pĹ™ed tĂ­m
5. **Strategic fit** - ZapadĂˇ do dlouhodobĂ© vize

### PrioritnĂ­ matice

| Priorita | Definice | Timeline |
|----------|----------|----------|
| đź”Ą VysokĂˇ | NutnĂ© pro vÄ›tĹˇinu uĹľivatelĹŻ | PĹ™Ă­ĹˇtĂ­ verze |
| âšˇ StĹ™ednĂ­ | UĹľiteÄŤnĂ©, vylepĹˇuje UX | 2-3 verze |
| đź’ˇ NĂ­zkĂˇ | Nice to have | KdyĹľ je ÄŤas |
| đź”® Budoucnost | DlouhodobĂˇ vize | MoĹľnĂˇ nÄ›kdy |

## đź¤ť Jak pĹ™ispÄ›t k roadmapÄ›

### Navrhnout novou funkci

1. Zkontrolujte [existing feature requests](https://github.com/atrep123/dmx-512-controller/issues?q=is%3Aissue+label%3Aenhancement)
2. Pokud neexistuje, [vytvoĹ™te novĂ˝](https://github.com/atrep123/dmx-512-controller/issues/new?template=feature_request.yml)
3. PopiĹˇte:
   - JakĂ˝ problĂ©m Ĺ™eĹˇĂ­
   - Jak by to fungovalo
   - Use cases
   - Mockupy (pokud moĹľnĂ©)

### Implementovat funkci

1. NajdÄ›te feature na roadmapÄ›
2. Komentujte na issue Ĺľe na tom pracujete
3. PĹ™eÄŤtÄ›te si [Contributing Guide](../CONTRIBUTING.md)
4. VytvoĹ™te PR s implementacĂ­

### Hlasovat pro funkce

- Dejte đź‘Ť emoji reaction na issues
- Komentujte s vaĹˇimi use cases
- SdĂ­lejte proÄŤ je to pro vĂˇs dĹŻleĹľitĂ©

## đź“ť Release Notes

KaĹľdĂˇ verze bude mĂ­t detailnĂ­ release notes s:
- NovĂ˝mi funkcemi
- Bug fixes
- Breaking changes
- Migration guide
- Known issues

Release notes najdete v [CHANGELOG.md](../CHANGELOG.md)

## đź’¬ Diskuse

MĂˇte nĂˇpad? Chcete diskutovat o roadmapÄ›?

- đź’¬ [GitHub Discussions](https://github.com/atrep123/dmx-512-controller/discussions)
- đź› [Feature Requests](https://github.com/atrep123/dmx-512-controller/issues/new?template=feature_request.yml)
- đź“§ Nebo napiĹˇte maintainerĹŻm

## âš ď¸Ź UpozornÄ›nĂ­

**Roadmap je living document** a mĹŻĹľe se zmÄ›nit na zĂˇkladÄ›:
- User feedback
- TechnickĂ˝ch omezenĂ­
- ZmÄ›ny priorit
- DostupnĂ˝ch zdrojĹŻ
- NovĂ˝ch technologiĂ­

Timeline je **orientaÄŤnĂ­** a mĹŻĹľe se posunout.

---

**Roadmap pro DMX 512 KontrolĂ©r**  
PoslednĂ­ aktualizace: 2024-11-01  
DalĹˇĂ­ review: Q1 2025

đźŚź **PodpoĹ™te vĂ˝voj**: Star na [GitHub](https://github.com/atrep123/dmx-512-controller)!
