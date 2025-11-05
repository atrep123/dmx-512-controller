# Roadmap - Planovane funkce

Prehled planovanych funkci a vylepseni pro DMX 512 Kontroler aplikaci.

## Clipboard Obsah

- [Aktualni verze](#aktualni-verze)
- [V1.1 - Nejblizsi update](#v11---nejblizsi-update)
- [V1.2 - Data Management](#v12---data-management)
- [V1.3 - MIDI Support](#v13---midi-support)
- [V2.0 - Pro Features](#v20---pro-features)
- [Dlouhodobe plany](#dlouhodobe-plany)
- [Komunitni pozadavky](#komunitni-pozadavky)

## Target Aktualni verze

### V1.0 (Current) [x]

**Stav**: Spusteno 2024-11-01

**Klicove funkce:**
- [x] DMX kontrola (512 kanalu per universe)
- [x] RGB/RGBW color picker
- [x] Scene management
- [x] 14 preset effects
- [x] Block programming
- [x] Stepper motor control (16-bit)
- [x] Servo control (0-180)
- [x] Joystick Pan/Tilt control
- [x] Art-Net support
- [x] PWA support (offline mode)
- [x] Custom page builder
- [x] 6 control blocks

## Rocket V1.1 - Nejblizsi update

**Planovane vydani**: Q1 2025  
**Zamereni**: Uzivatelske vylepseni a polish

### Nove funkce

#### 1. Testing Framework  Vysoka priorita
- [ ] Vitest setup
- [ ] React Testing Library
- [ ] Component tests
- [ ] Integration tests
- [ ] E2E tests (Playwright)

**Proc**: Zajistit kvalitu kodu a prevenci regresi

#### 2. USB DMX Support  Vysoka priorita
- [ ] Web Serial API integration
- [ ] Support pro bezne USB DMX interfaces
- [ ] Enttec DMX USB PRO support
- [ ] Auto-detection devices

**Use case**: Prime pripojeni k DMX bez Art-Net node

#### 3. Fixture Templates  Stredni priorita
- [ ] Library beznych fixtures
- [ ] Template picker pri pridavani fixture
- [ ] Community fixture contributions
- [ ] Import custom fixture profiles

**Fixtures v library:**
- Generic RGB Par (3ch, 4ch, 7ch)
- Generic Moving Head (16ch, 20ch, 24ch)
- Popular brands (Chauvet, ADJ, Martin)

#### 4. UI/UX Improvements  Stredni priorita
- [ ] Dark/Light theme toggle
- [ ] Customizable color scheme
- [ ] Larger touch targets na mobilech
- [ ] Better gesture support
- [ ] Haptic feedback (vibrace)

#### 5. Performance Optimizations  Nizka priorita
- [ ] Virtual scrolling pro velke seznamy
- [ ] React.memo optimizations
- [ ] Lazy loading improvements
- [ ] Reduced bundle size
- [ ] Better caching strategy

##  V1.2 - Data Management

**Planovane vydani**: Q2 2025  
**Zamereni**: Import/Export a zalohy

### Nove funkce

#### 1. Export/Import  Vysoka priorita
- [ ] Export cele konfigurace (JSON)
- [ ] Export jednotlivych scen
- [ ] Export effects
- [ ] Import konfigurace
- [ ] Merge import (slouceni s existujicimi daty)

**Format**: JSON s verzovanim

**Use cases:**
- Backup pred showem
- Sdileni konfigurace mezi zarizenimi
- Template sharing v komunite

#### 2. Cloud Backup  Stredni priorita
- [ ] Optional cloud storage
- [ ] Auto-backup moznost
- [ ] Restore z cloud
- [ ] Version history

**Privacy**: Opt-in, sifrovane, zadne tracky

#### 3. Project Management  Stredni priorita
- [ ] Multiple projects
- [ ] Project switching
- [ ] Project templates
- [ ] Project metadata (venue, date, notes)

**Use case**: Ruzne projekty pro ruzna venue

#### 4. Scene Organization  Nizka priorita
- [ ] Scene folders
- [ ] Scene tagging
- [ ] Scene filtering
- [ ] Scene duplication
- [ ] Batch operations

##  V1.3 - MIDI Support

**Planovane vydani**: Q3 2025  
**Zamereni**: Hardwarove ovladani

### Nove funkce

#### 1. MIDI Input  Vysoka priorita
- [ ] Web MIDI API integration
- [ ] MIDI device detection
- [ ] MIDI learn funkce
- [ ] Fader mapping
- [ ] Button mapping
- [ ] Encoder support

**Podporovane kontrolery:**
- AKAI APC mini/40
- Novation Launchpad
- Behringer X-Touch
- Generic MIDI controllers

#### 2. MIDI Mapping  Vysoka priorita
- [ ] Visual mapping interface
- [ ] Save/load mappings
- [ ] Multiple mapping profiles
- [ ] MIDI feedback (LED sync)

**Mapovatelne funkce:**
- Channel faders  MIDI CC
- Scene triggers  MIDI notes
- Effect toggle  MIDI notes
- Color picker  MIDI encoder

#### 3. MIDI Clock Sync  Stredni priorita
- [ ] MIDI clock input
- [ ] Tempo-synced effects
- [ ] Beat-triggered scenes
- [ ] BPM detection

**Use case**: Sync svetel s hudbou pres MIDI

##  V2.0 - Pro Features

**Planovane vydani**: Q4 2025  
**Zamereni**: Profesionalni features

### Nove funkce

#### 1. Cue List Clipboard Vysoka priorita
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

#### 2. Timecode Support  Vysoka priorita
- [ ] SMPTE timecode input
- [ ] Art-Net timecode
- [ ] OSC timecode
- [ ] Timecode-triggered cues
- [ ] Timecode display

**Use case:** Programovani show s audio/video sync

#### 3. Multi-User Support  Stredni priorita
- [ ] WebSocket server
- [ ] Real-time sync mezi devices
- [ ] Role-based access (admin/operator/view)
- [ ] Conflict resolution
- [ ] User presence indication

**Architektura:** Optional server mode

#### 4. Advanced Effects  Stredni priorita
- [ ] Effect generator
- [ ] Pixel mapping
- [ ] Matrix effects (2D grid)
- [ ] Video-to-DMX
- [ ] Audio-reactive effects

#### 5. Fixture Library Import  Stredni priorita
- [ ] GDTF import
- [ ] MVR import
- [ ] Fixture Builder Pro profiles
- [ ] Custom fixture editor

#### 6. Show Recording  Nizka priorita
- [ ] Record live show
- [ ] Playback recorded show
- [ ] Edit recording
- [ ] Export show file

##  Dlouhodobe plany

### V3.0+ - Enterprise Features

**Potencialni timeline**: 2026+

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

##  Komunitni pozadavky

Hlasujte pro features ktere chcete videt jako prvni!

### Top requested features

1. **Fixture Library** (45 hlasu) 
2. **Export/Import** (38 hlasu) 
3. **MIDI Support** (32 hlasu)
4. **Cue List** (28 hlasu)
5. **USB DMX** (24 hlasu)
6. **Dark Theme** (22 hlasu)
7. **Multi-User** (18 hlasu)
8. **Timecode** (15 hlasu)

**Jak hlasovat:**
- [Feature Requests](https://github.com/atrep123/dmx-512-controller/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)
- Dejte  na issue ktere chcete
- Nebo vytvorte novy feature request

##  Prioritizace

### Kriteria pro prioritizaci

1. **User demand** - Kolik uzivatelu o to stoji
2. **Impact** - Jak moc to pomuze uzivatelum
3. **Effort** - Jak narocna je implementace
4. **Dependencies** - Co musi byt hotove pred tim
5. **Strategic fit** - Zapada do dlouhodobe vize

### Prioritni matice

| Priorita | Definice | Timeline |
|----------|----------|----------|
|  Vysoka | Nutne pro vetsinu uzivatelu | Pristi verze |
|  Stredni | Uzitecne, vylepsuje UX | 2-3 verze |
|  Nizka | Nice to have | Kdyz je cas |
|  Budoucnost | Dlouhodoba vize | Mozna nekdy |

## Handshake Jak prispet k roadmape

### Navrhnout novou funkci

1. Zkontrolujte [existing feature requests](https://github.com/atrep123/dmx-512-controller/issues?q=is%3Aissue+label%3Aenhancement)
2. Pokud neexistuje, [vytvorte novy](https://github.com/atrep123/dmx-512-controller/issues/new?template=feature_request.yml)
3. Popiste:
   - Jaky problem resi
   - Jak by to fungovalo
   - Use cases
   - Mockupy (pokud mozne)

### Implementovat funkci

1. Najdete feature na roadmape
2. Komentujte na issue ze na tom pracujete
3. Prectete si [Contributing Guide](../CONTRIBUTING.md)
4. Vytvorte PR s implementaci

### Hlasovat pro funkce

- Dejte  emoji reaction na issues
- Komentujte s vasimi use cases
- Sdilejte proc je to pro vas dulezite

## Note Release Notes

Kazda verze bude mit detailni release notes s:
- Novymi funkcemi
- Bug fixes
- Breaking changes
- Migration guide
- Known issues

Release notes najdete v [CHANGELOG.md](../CHANGELOG.md)

## Chat Diskuse

Mate napad? Chcete diskutovat o roadmape?

- Chat [GitHub Discussions](https://github.com/atrep123/dmx-512-controller/discussions)
- Bug [Feature Requests](https://github.com/atrep123/dmx-512-controller/issues/new?template=feature_request.yml)
- Email Nebo napiste maintainerum

##  Upozorneni

**Roadmap je living document** a muze se zmenit na zaklade:
- User feedback
- Technickych omezeni
- Zmeny priorit
- Dostupnych zdroju
- Novych technologii

Timeline je **orientacni** a muze se posunout.

---

**Roadmap pro DMX 512 Kontroler**  
Posledni aktualizace: 2024-11-01  
Dalsi review: Q1 2025

 **Podporte vyvoj**: Star na [GitHub](https://github.com/atrep123/dmx-512-controller)!
