# Uživatelská příručka DMX 512 Kontrolér

Kompletní návod k použití DMX 512 Kontrolér aplikace pro řízení stage osvětlení, motorů a efektů.

## 📋 Obsah

- [Úvod](#úvod)
- [Začínáme](#začínáme)
- [Nastavení](#nastavení)
- [Ovládání světel](#ovládání-světel)
- [Scény](#scény)
- [Efekty](#efekty)
- [Motory a serva](#motory-a-serva)
- [Živá kontrola](#živá-kontrola)
- [Vlastní stránky](#vlastní-stránky)
- [Síťové připojení](#síťové-připojení)
- [Tipy a triky](#tipy-a-triky)

## 🎭 Úvod

DMX 512 Kontrolér je profesionální aplikace pro ovládání stage osvětlení a motorů pomocí DMX 512 protokolu. Aplikace běží jako Progressive Web App (PWA) na mobilních zařízeních a poskytuje intuitivní dotykové rozhraní.

### Co můžete ovládat

- 🎨 **Světelná zařízení** - DMX světla, RGB pary, moving heads
- ⚙️ **Motory** - Stepper motory s přesným polohováním
- 🎯 **Servomotory** - Úhlové polohování 0-180°
- ⚡ **Efekty** - Automatizované lighting efekty
- 🎬 **Scény** - Rychlé vyvolání uložených stavů

### Hlavní funkce

- Ovládání jednotlivých DMX kanálů
- RGB/RGBW barevný picker
- Ukladání a vyvolávání scén
- 14 vestavěných efektů
- Vizuální blokové programování vlastních efektů
- Joystick pro Pan/Tilt kontrolu
- Offline režim
- Vlastní ovládací panely

## 🚀 Začínáme

### První spuštění

1. **Otevřete aplikaci** v prohlížeči nebo jako nainstalovanou PWA
2. **Instalační prompt** - Pokud používáte mobilní prohlížeč, objeví se prompt k instalaci
3. **Základní orientace** - Aplikace má 9 hlavních sekcí dostupných přes horní záložky

### Základní workflow

```
1. Nastavení → Přidejte universe
2. Nastavení → Přidejte fixtures (světla)
3. Světla → Nastavte hodnoty kanálů
4. Scény → Uložte aktuální stav
5. Připojení → Připojte se k DMX síti
6. Živá kontrola → Ovládejte v reálném čase
```

## ⚙️ Nastavení

### Vytvoření Universe

Universe reprezentuje 512 DMX kanálů.

1. Přejděte na záložku **"Nastavení"**
2. V sekci **"DMX Universa"** klikněte na **"Přidat Universe"**
3. Zadejte název (např. "Main Stage")
4. Klikněte **"Vytvořit"**

### Přidání Fixture (světla)

1. V záložce **"Nastavení"**
2. V sekci **"Fixtures"** klikněte **"Přidat Fixture"**
3. Vyplňte formulář:
   - **Název**: Pojmenujte vaše světlo (např. "Par LED 1")
   - **Universe**: Vyberte universe
   - **DMX adresa**: Start adresa (1-512)
   - **Typ fixture**: Vyberte typ
   - **Počet kanálů**: Kolik kanálů má fixture

**Typy fixtures:**
- **Generic** - Obecné světlo s custom kanály
- **RGB** - RGB světlo (3 kanály: Red, Green, Blue)
- **RGBW** - RGBW světlo (4 kanály: Red, Green, Blue, White)
- **Moving Head** - Moving head s Pan/Tilt

4. Klikněte **"Přidat Fixture"**

### Úprava kanálů

Po vytvoření fixture můžete upravit názvy kanálů:

1. Najděte fixture v seznamu
2. Klikněte na **"Upravit"**
3. Změňte názvy kanálů (např. "Ch 1" → "Dimmer")
4. Uložte změny

## 💡 Ovládání světel

### Záložka "Světla"

Zde najdete všechna vaše fixtures s ovládáním jednotlivých kanálů.

#### Ovládání pomocí sliderů

1. Najděte fixture v seznamu
2. Posuňte slider kanálu doleva (nižší hodnota) nebo doprava (vyšší hodnota)
3. Hodnota se okamžitě aplikuje

**DMX hodnoty:**
- 0 = Vypnuto / Minimální
- 255 = Maximální intenzita

#### RGB Color Picker

Pro RGB/RGBW fixtures:

1. Klikněte na **barevný čtverec** nebo **"Vybrat barvu"**
2. Použijte color picker k výběru barvy
3. Nebo zadejte RGB hodnoty manuálně
4. Barva se okamžitě aplikuje na všechny RGB kanály

#### Číselné vstupy

Pro přesné hodnoty:

1. Klikněte na **číselnou hodnotu** vedle slideru
2. Zadejte přesnou hodnotu (0-255)
3. Stiskněte Enter

### Rychlé akce

- **Reset na 0**: Double-klik na slider
- **Set na Max (255)**: Klik na maximum slideru
- **Copy hodnotu**: Long-press na hodnotu (mobilní)

## 🎬 Scény

Scény umožňují uložit a rychle vyvolat kompletní stavy všech světel a motorů.

### Vytvoření scény

1. Přejděte na záložku **"Scény"**
2. Nastavte všechna světla do požadovaného stavu
3. Klikněte **"Uložit novou scénu"**
4. Zadejte název scény (např. "Opening", "Red Wash", "Blackout")
5. Klikněte **"Uložit"**

Scéna uloží:
- Všechny hodnoty DMX kanálů
- Pozice stepper motorů
- Úhly servomotorů

### Vyvolání scény

1. V záložce **"Scény"** najděte požadovanou scénu
2. Klikněte na **"Aktivovat"**
3. Všechny hodnoty se okamžitě aplikují

**Aktivní scéna** je zvýrazněná barevným rámečkem.

### Správa scén

- **Přejmenovat**: Klik na ikonu tužky
- **Smazat**: Klik na ikonu koše
- **Aktualizovat**: Aktivujte scénu → upravte hodnoty → "Uložit změny"

### Best practices

- Vytvořte scénu "Blackout" (všechny kanály na 0)
- Pojmenujte scény popisně (např. "Act 1 Opening", ne "Scene 1")
- Testujte scény před showem
- Vytvořte záložní scény

## ⚡ Efekty

Efekty jsou automatizované lighting sekvence.

### Předdefinované efekty

Aplikace obsahuje 14 vestavěných efektů:

1. **Chase** - Postupné zapínání světel
2. **Strobe** - Rychlé blikání
3. **Rainbow** - Plynulá změna barev duhy
4. **Fade** - Plynulé stmívání/rozsvěcování
5. **Sweep** - Pohyb světla napříč fixtures
6. **Sparkle** - Náhodné blikání
7. **Wipe** - Wipe přechod
8. **Bounce** - Bounce tam a zpět
9. **Theater Chase** - Theater chase pattern
10. **Fire** - Simulace ohně
11. **Wave** - Wave pattern
12. **Pulse** - Pulsní efekt
13. **Color Fade** - Fade mezi barvami
14. **Block Program** - Vlastní block program

### Vytvoření efektu

1. Přejděte na záložku **"Efekty"**
2. Klikněte **"Vytvořit efekt"**
3. Vyplňte formulář:
   - **Název**: Pojmenujte efekt
   - **Typ**: Vyberte typ efektu
   - **Rychlost**: 0-100 (vyšší = rychlejší)
   - **Intenzita**: 0-100 (ovlivňuje intenzitu efektu)
4. **Vyberte fixtures**: Zaškrtněte která světla efekt ovlivní
5. Klikněte **"Vytvořit"**

### Spuštění efektu

1. Najděte efekt v seznamu
2. Klikněte na **přepínač** (toggle)
3. Efekt se začne okamžitě provádět

**Zelená** = efekt běží  
**Šedá** = efekt je zastaven

### Úprava běžícího efektu

I když efekt běží, můžete upravit:
- **Rychlost**: Slider rychlosti
- **Intenzita**: Slider intenzity
- Změny se aplikují okamžitě

### Vizuální blokové programování

Pro pokročilé uživatele - vytvořte vlastní efekty pomocí bloků:

1. Vytvořte nový efekt typu **"Block Program"**
2. Klikněte **"Upravit bloky"**
3. V levém panelu vyberte typ bloku:
   - **Barvy**: set-color, fade, rainbow-shift
   - **Pohyb**: pan-tilt, chase-step
   - **Timing**: wait
   - **Control**: loop-start, loop-end
   - **Efekty**: strobe-pulse, random-color
4. Přetáhněte bloky do middle panelu
5. Klikněte na blok pro úpravu parametrů
6. Uspořádejte bloky do sekvence
7. Přidejte smyčky pomocí loop-start/loop-end
8. Uložte a spusťte

**Příklad simple chase:**
```
1. loop-start (count: 10)
2. set-color (fixture 0, red)
3. wait (100ms)
4. set-color (fixture 1, red)
5. wait (100ms)
6. loop-end
```

## 🔧 Motory a serva

### Stepper Motory

Stepper motory používají 16-bit polohování (0-65535 kroků).

#### Přidání motoru

1. Záložka **"Nastavení"** → sekce **"Stepper Motory"**
2. Klikněte **"Přidat Motor"**
3. Vyplňte:
   - Název
   - DMX adresa (obvykle 4 kanály)
   - Max kroků (např. 200 pro 1 otáčku)
4. Klikněte **"Přidat"**

#### Ovládání

1. Záložka **"Motory"**
2. Najděte motor
3. Nastavte:
   - **Pozice**: Target pozice (0-max steps)
   - **Rychlost**: Jak rychle se pohybuje (0-255)
   - **Zrychlení**: Acceleration rate (0-255)

Motor se automaticky pohne na target pozici.

### Servomotory

Serva používají úhlové polohování (0-180°).

#### Přidání serva

1. Záložka **"Nastavení"** → sekce **"Servomotory"**
2. Klikněte **"Přidat Servo"**
3. Vyplňte:
   - Název
   - DMX adresa (1 kanál)
   - Min/Max úhel (default 0-180)
4. Klikněte **"Přidat"**

#### Ovládání

1. Záložka **"Motory"**
2. Najděte servo
3. Nastavte **úhel** (0-180°)

Servo se pohne na nastavený úhel.

## 🎮 Živá kontrola

Záložka "Kontrola" poskytuje real-time ovládání pomocí joysticku.

### Joystick Pan/Tilt

Pro moving heads a motory s Pan/Tilt:

1. Přejděte na **"Kontrola"**
2. Vyberte fixture v dropdown menu
3. Použijte **joystick** k ovládání:
   - Táhněte joystick doleva/doprava = Pan
   - Táhněte joystick nahoru/dolů = Tilt
4. Joystick má **středovou pozici** (127, 127)

### Rychlé ovládání efektů

V sekci "Aktivní efekty":
- Start/Stop efekty jedním kliknutím
- Upravte rychlost on-the-fly
- Přepínání mezi více efekty současně

## 🎨 Vlastní stránky

Vytvořte si vlastní ovládací panel z UI bloků.

### Záložka "Moje stránka"

1. Přejděte na **"Moje stránka"**
2. Klikněte **"Přidat blok"**
3. Vyberte typ bloku:
   - **Channel Slider** - Ovládání jednoho kanálu
   - **Color Picker** - RGB picker
   - **Toggle Button** - On/Off přepínač
   - **Button Pad** - Grid tlačítek
   - **Position Control** - Pan/Tilt kontrola
   - **Intensity Fader** - Vertikální fader
4. Nakonfigurujte blok
5. Uspořádejte bloky drag & drop

### Use cases

- **DJ panel**: Rychlé ovládání barev a efektů
- **Theater panel**: Scény a dimming
- **Mobile panel**: Zjednodušené ovládání pro pohyb
- **Backup panel**: Emergency kontroly

## 🌐 Síťové připojení

### Podporované protokoly

- **Art-Net** - Nejpoužívanější DMX-over-Ethernet protokol
- **sACN (E1.31)** - Profesionální streaming ACN (připraveno)
- **USB DMX** - DMX interface přes USB (připraveno)

### Konfigurace Art-Net

1. Přejděte na **"Připojení"**
2. V sekci **"Protokol"** vyberte **"Art-Net"**
3. Vyplňte:
   - **IP adresa**: IP vaší Art-Net node (např. 192.168.1.100)
   - **Port**: Obvykle 6454
   - **Universe**: Číslo universa (0-15)
   - **Send Rate**: Packets per second (40-44)
4. Klikněte **"Připojit"**

### Profily připojení

Uložte si různé konfigurace pro různá místa:

1. Vyplňte konfiguraci
2. Zadejte **Název profilu** (např. "Main Venue", "Rehearsal Room")
3. Klikněte **"Uložit profil"**

**Načtení profilu:**
- Vyberte profil z dropdown
- Klikněte **"Načíst"**
- Konfigurace se vyplní automaticky

### Monitoring připojení

V horní části sekce připojení vidíte:
- **Status**: Connected / Disconnected / Connecting / Error
- **Packet counter**: Kolik packets bylo odesláno
- **Last packet**: Časová značka posledního packetu

### Troubleshooting připojení

**Nepřipojí se:**
- Zkontrolujte IP adresu
- Ověřte že Art-Net node je zapnutá
- Zkontrolujte síťové připojení
- Firewall může blokovat komunikaci

**Vysoká latence:**
- Snižte Send Rate
- Zkontrolujte WiFi sílu
- Použijte kabelové připojení pokud možné

## 💡 Tipy a triky

### Performance

- **Disable nepoužívané efekty** - Běžící efekty používají CPU
- **Omezení fixture count** - Pro mobilní zařízení max 30-40 fixtures
- **Offline mode** - Vypněte WiFi pro lepší battery life
- **Brightness** - Snižte jas displeje během show

### Workflow tipy

- **Organize fixtures logicky** - Pojmenujte je podle pozice
- **Color coding** - Použijte emoji v názvech (🔴 Red Par, 🔵 Blue Par)
- **Backup data** - Exportujte data pravidelně (TODO: implement)
- **Test před showem** - Vyzkoušejte všechny scény a efekty

### Keyboard shortcuts

Na desktopu můžete použít:
- **Space** - Play/Pause aktivní efekt
- **Esc** - Close dialog
- **Tab** - Navigate mezi controls

### Mobile tips

- **Portrait mode** - Lepší pro ovládání sliderů
- **Landscape mode** - Lepší pro joystick kontrolu
- **Pull to refresh** - Zakázáno aby se nepletlo s UI
- **Screen lock** - Nastavte "Keep screen on" v system settings

### Pro users

- **MIDI mapping** - Připojte MIDI kontrolér *(ve vývoji – viz [Roadmap V1.3](ROADMAP.md#v13---midi-support))*
- **OSC protocol** - Remote control přes OSC *(plánováno v sekci Pro Features)*
- **Timecode sync** - Sync s timecode *(plánováno v Pro Features – show control integrace)*
- **Multi-user** - Více zařízení současně *(potřebuje server mód, sledujte roadmapu)*

## �? Pokročilé funkce (roadmapa)

Následující funkce jsou připravované – některé mají již API stubs, jiné čekají na komunitní příspěvky. Přiložené odkazy vedou na GitHub issue nebo kapitolu v `ROADMAP.md`, kde můžeš sledovat stav nebo se zapojit.

### Cloud backup & export

- **Co je připraveno:** Export/import JSON snapshotů (`Data Management` panel).
- **Roadmap:** Automatické cloud zálohy, verzování a diff náhledy – [Roadmap V1.2](ROADMAP.md#v12---data-management).
- **Jak pomoci:** Otestuj export/import (issues label `data-management`) a přidej use-cases pro auto-backup.

### MIDI ovládání (preview)

Pilotní Web MIDI bridge je dostupný přímo v aplikaci:

1. Otevři **Nastavení → MIDI (preview)**.
2. Klikni na **„Zapnout MIDI bridge“** (Chrome 128+ a HTTPS/localhost jsou povinné).
3. V systémovém dialogu povol přístup k MIDI zařízení.
4. Panel zobrazí připojená zařízení a poslední přijatou zprávu (loguje do konzole a vystavuje event `dmx-midi`).
5. Přepni se do sekce **MIDI mapování** (umístěná přímo pod panelem) a klikni na **„Zachytit MIDI zprávu“** – poté pohni faderem nebo stiskni tlačítko.
6. Po doplnění příkazu a čísla ovladače zvol akci (DMX kanál, scéna, efekt toggle/intenzita nebo master dimmer) a stiskni **„Uložit mapování“**. Každé mapování lze smazat křížkem.
7. `LiveControlView` reaguje okamžitě: CC fadery škálují DMX kanály na 0–255, note-on tlačítka vyvolávají scény a přepínají efekty, master dimmer funguje jako globální brzda před odesláním DMX patchů.
8. Mapování se ukládají do IndexedDB i show snapshotu, takže export/import přenese MIDI vazby mezi zařízeními. Další rozšíření (MIDI feedback, clock sync) sleduj v [V1.3 – MIDI Support](ROADMAP.md#v13---midi-support).

- Feedback & requesty: issue [`#421 MIDI Support`](https://github.com/atrep123/dmx-512-controller/issues/421).
- Podporujeme libovolný class-compliant USB/MIDI kontrolér (Launchpad, APC, NanoKontrol…); připoj screenshot dat pro ladění.

### OSC protokol

- **Plán:** OSC server s mapovatelnými příkazy (`/dmx/scene`, `/dmx/channel`).
- **Issue:** [`#422 OSC Bridge`](https://github.com/atrep123/dmx-512-controller/issues/422).
- **Tip:** Pokud máš preferovaný OSC controller, zanech komentář s mapou příkazů.

### Timecode synchronization

- **Plán:** Podpora LTC/MTC a možnost spouštět scény podle timeline.
- **Roadmap:** Sekce „Pro Features – Show Control“.
- **Issue:** [`#423 Timecode`](https://github.com/atrep123/dmx-512-controller/issues/423).

### Desktop multi-user

- **Plán:** Serverový mód (FastAPI) + websocket hub sdílející stav mezi více klienty.
- **Status:** FastAPI backend už existuje (Tauri desktop wrapper), ale PWA zatím startuje v single-user módu.
- **Issue:** [`#318 Multi-user`](https://github.com/atrep123/dmx-512-controller/issues/318).

> **Chceš přispět?** Přečti [CONTRIBUTING.md](../CONTRIBUTING.md), přidej komentář na issue a začni s menším PoC (např. MIDI CC → channel slider).

## 🆘 Často kladené otázky

### Q: Mohu ovládat více univerzí současně?
A: Ano, přidejte více univerzí v Nastavení. Každé universe má 512 kanálů.

### Q: Funguje aplikace offline?
A: Ano! Všechna data jsou lokální. Potřebujete jen připojení k DMX síti.

### Q: Kolik fixtures mohu přidat?
A: Technicky neomezeno, ale doporučujeme max 50 fixtures pro mobile performance.

### Q: Mohu exportovat/importovat data?
A: Zatím ne, tato funkce je v plánu.

### Q: Podporuje aplikace MIDI kontroléry?
A: Zatím ne, ale je to v roadmapě.

### Q: Jak aktualizuji aplikaci?
A: PWA se aktualizuje automaticky. Obnovte stránku pro načtení nové verze.

### Q: Je aplikace zdarma?
A: Ano! Open source pod MIT licencí.

## 📞 Potřebujete pomoc?

- 📖 [Architecture Guide](./ARCHITECTURE.md)
- 💻 [API Documentation](./API.md)
- 🐛 [Report Issue](https://github.com/atrep123/dmx-512-controller/issues)
- 💬 [Discussions](https://github.com/atrep123/dmx-512-controller/discussions)

---

**Uživatelská příručka pro DMX 512 Kontrolér**  
Verze: 1.0  
Poslední aktualizace: 2024
