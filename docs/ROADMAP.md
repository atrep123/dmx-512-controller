# Roadmap - Plánované funkce

Přehled plánovaných funkcí a vylepšení pro DMX 512 Kontrolér aplikaci.

## 📋 Obsah

- [Aktuální verze](#aktuální-verze)
- [V1.1 - Nejbližší update](#v11---nejbližší-update)
- [V1.2 - Data Management](#v12---data-management)
- [V1.3 - MIDI Support](#v13---midi-support)
- [V2.0 - Pro Features](#v20---pro-features)
- [Dlouhodobé plány](#dlouhodobé-plány)
- [Komunitní požadavky](#komunitní-požadavky)

## 🎯 Aktuální verze

### V1.0 (Current) ✅

**Stav**: Spuštěno 2024-11-01

**Klíčové funkce:**
- ✅ DMX kontrola (512 kanálů per universe)
- ✅ RGB/RGBW color picker
- ✅ Scene management
- ✅ 14 preset effects
- ✅ Block programming
- ✅ Stepper motor control (16-bit)
- ✅ Servo control (0-180°)
- ✅ Joystick Pan/Tilt control
- ✅ Art-Net support
- ✅ PWA support (offline mode)
- ✅ Custom page builder
- ✅ 6 control blocks

## 🚀 V1.1 - Nejbližší update

**Plánované vydání**: Q1 2025  
**Zaměření**: Uživatelské vylepšení a polish

### Nové funkce

#### 1. Testing Framework ⚡ Vysoká priorita
- [x] Vitest setup
- [x] React Testing Library
- [x] Component tests
- [x] Integration tests
- [ ] E2E tests (Playwright)

**Proč**: Zajistit kvalitu kódu a prevenci regresí

#### 2. USB DMX Support 🔌 Vysoká priorita
- [x] Web Serial API integration
- [x] Support pro běžné USB DMX interfaces
- [ ] Enttec DMX USB PRO support
- [ ] Auto-detection devices

**Use case**: Přímé připojení k DMX bez Art-Net node

#### 3. Fixture Templates 📚 Střední priorita
- [x] Library běžných fixtures
- [x] Template picker při přidávání fixture
- [ ] Community fixture contributions
- [ ] Import custom fixture profiles

**Fixtures v library:**
- Generic RGB Par (3ch, 4ch, 7ch)
- Generic Moving Head (16ch, 20ch, 24ch)
- Popular brands (Chauvet, ADJ, Martin)

#### 4. UI/UX Improvements 🎨 Střední priorita
- [x] Dark/Light theme toggle
- [ ] Customizable color scheme
- [x] Larger touch targets na mobilech
- [ ] Better gesture support
- [ ] Haptic feedback (vibrace)

#### 5. Performance Optimizations ⚡ Nízká priorita
- [ ] Virtual scrolling pro velké seznamy
- [ ] React.memo optimizations
- [ ] Lazy loading improvements
- [ ] Reduced bundle size
- [ ] Better caching strategy

## 💾 V1.2 - Data Management

**Plánované vydání**: Q2 2025  
**Zaměření**: Import/Export a zálohy

### Nové funkce

#### 1. Export/Import 💼 Vysoká priorita
- [x] Export celé konfigurace (JSON)
- [x] Export jednotlivých scén
- [x] Export effects
- [x] Import konfigurace
- [x] Merge import (sloučení s existujícími daty)

**Formát**: JSON s verzováním

**Use cases:**
- Backup před showem
- Sdílení konfigurace mezi zařízeními
- Template sharing v komunitě

#### 2. Cloud Backup ☁️ Střední priorita
- [ ] Optional cloud storage
- [ ] Auto-backup možnost
- [ ] Restore z cloud
- [ ] Version history

**Privacy**: Opt-in, šifrované, žádné tracky

#### 3. Project Management 📁 Střední priorita
- [ ] Multiple projects
- [ ] Project switching
- [ ] Project templates
- [ ] Project metadata (venue, date, notes)

**Use case**: Různé projekty pro různá venue

#### 4. Scene Organization 🗂️ Nízká priorita
- [ ] Scene folders
- [ ] Scene tagging
- [ ] Scene filtering
- [ ] Scene duplication
- [ ] Batch operations

## 🎹 V1.3 - MIDI Support

**Plánované vydání**: Q3 2025  
**Zaměření**: Hardwarové ovládání

### Nové funkce

#### 1. MIDI Input 🎛️ Vysoká priorita
- [ ] Web MIDI API integration
- [ ] MIDI device detection
- [ ] MIDI learn funkce
- [ ] Fader mapping
- [ ] Button mapping
- [ ] Encoder support

**Podporované kontroléry:**
- AKAI APC mini/40
- Novation Launchpad
- Behringer X-Touch
- Generic MIDI controllers

#### 2. MIDI Mapping 🔗 Vysoká priorita
- [ ] Visual mapping interface
- [ ] Save/load mappings
- [ ] Multiple mapping profiles
- [ ] MIDI feedback (LED sync)

**Mapovatelné funkce:**
- Channel faders → MIDI CC
- Scene triggers → MIDI notes
- Effect toggle → MIDI notes
- Color picker → MIDI encoder

#### 3. MIDI Clock Sync ⏱️ Střední priorita
- [ ] MIDI clock input
- [ ] Tempo-synced effects
- [ ] Beat-triggered scenes
- [ ] BPM detection

**Use case**: Sync světel s hudbou přes MIDI

## 🎬 V2.0 - Pro Features

**Plánované vydání**: Q4 2025  
**Zaměření**: Profesionální features

### Nové funkce

#### 1. Cue List 📋 Vysoká priorita
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

#### 2. Timecode Support ⏰ Vysoká priorita
- [ ] SMPTE timecode input
- [ ] Art-Net timecode
- [ ] OSC timecode
- [ ] Timecode-triggered cues
- [ ] Timecode display

**Use case:** Programování show s audio/video sync

#### 3. Multi-User Support 👥 Střední priorita
- [ ] WebSocket server
- [ ] Real-time sync mezi devices
- [ ] Role-based access (admin/operator/view)
- [ ] Conflict resolution
- [ ] User presence indication

**Architektura:** Optional server mode

#### 4. Advanced Effects 🌟 Střední priorita
- [ ] Effect generator
- [ ] Pixel mapping
- [ ] Matrix effects (2D grid)
- [ ] Video-to-DMX
- [ ] Audio-reactive effects

#### 5. Fixture Library Import 📦 Střední priorita
- [ ] GDTF import
- [ ] MVR import
- [ ] Fixture Builder Pro profiles
- [ ] Custom fixture editor

#### 6. Show Recording 📹 Nízká priorita
- [ ] Record live show
- [ ] Playback recorded show
- [ ] Edit recording
- [ ] Export show file

## 🔮 Dlouhodobé plány

### V3.0+ - Enterprise Features

**Potenciální timeline**: 2026+

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

## 🗳️ Komunitní požadavky

Hlasujte pro features které chcete vidět jako první!

### Top requested features

1. **Fixture Library** (45 hlasů) 🔥
2. **Export/Import** (38 hlasů) 🔥
3. **MIDI Support** (32 hlasů)
4. **Cue List** (28 hlasů)
5. **USB DMX** (24 hlasů)
6. **Dark Theme** (22 hlasů)
7. **Multi-User** (18 hlasů)
8. **Timecode** (15 hlasů)

**Jak hlasovat:**
- [Feature Requests](https://github.com/atrep123/dmx-512-controller/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)
- Dejte 👍 na issue které chcete
- Nebo vytvořte nový feature request

## 📊 Prioritizace

### Kritéria pro prioritizaci

1. **User demand** - Kolik uživatelů o to stojí
2. **Impact** - Jak moc to pomůže uživatelům
3. **Effort** - Jak náročná je implementace
4. **Dependencies** - Co musí být hotové před tím
5. **Strategic fit** - Zapadá do dlouhodobé vize

### Prioritní matice

| Priorita | Definice | Timeline |
|----------|----------|----------|
| 🔥 Vysoká | Nutné pro většinu uživatelů | Příští verze |
| ⚡ Střední | Užitečné, vylepšuje UX | 2-3 verze |
| 💡 Nízká | Nice to have | Když je čas |
| 🔮 Budoucnost | Dlouhodobá vize | Možná někdy |

## 🤝 Jak přispět k roadmapě

### Navrhnout novou funkci

1. Zkontrolujte [existing feature requests](https://github.com/atrep123/dmx-512-controller/issues?q=is%3Aissue+label%3Aenhancement)
2. Pokud neexistuje, [vytvořte nový](https://github.com/atrep123/dmx-512-controller/issues/new?template=feature_request.yml)
3. Popište:
   - Jaký problém řeší
   - Jak by to fungovalo
   - Use cases
   - Mockupy (pokud možné)

### Implementovat funkci

1. Najděte feature na roadmapě
2. Komentujte na issue že na tom pracujete
3. Přečtěte si [Contributing Guide](../CONTRIBUTING.md)
4. Vytvořte PR s implementací

### Hlasovat pro funkce

- Dejte 👍 emoji reaction na issues
- Komentujte s vašimi use cases
- Sdílejte proč je to pro vás důležité

## 📝 Release Notes

Každá verze bude mít detailní release notes s:
- Novými funkcemi
- Bug fixes
- Breaking changes
- Migration guide
- Known issues

Release notes najdete v [CHANGELOG.md](../CHANGELOG.md)

## 💬 Diskuse

Máte nápad? Chcete diskutovat o roadmapě?

- 💬 [GitHub Discussions](https://github.com/atrep123/dmx-512-controller/discussions)
- 🐛 [Feature Requests](https://github.com/atrep123/dmx-512-controller/issues/new?template=feature_request.yml)
- 📧 Nebo napište maintainerům

## ⚠️ Upozornění

**Roadmap je living document** a může se změnit na základě:
- User feedback
- Technických omezení
- Změny priorit
- Dostupných zdrojů
- Nových technologií

Timeline je **orientační** a může se posunout.

---

**Roadmap pro DMX 512 Kontrolér**  
Poslední aktualizace: 2024-11-01  
Další review: Q1 2025

🌟 **Podpořte vývoj**: Star na [GitHub](https://github.com/atrep123/dmx-512-controller)!
