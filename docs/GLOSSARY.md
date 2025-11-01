# Glosář pojmů

Vysvětlení klíčových pojmů a terminologie používané v DMX 512 Kontrolér aplikaci a v oblasti stage osvětlení.

## 📋 Obsah

- [DMX a protokoly](#dmx-a-protokoly)
- [Hardware a zařízení](#hardware-a-zařízení)
- [Osvětlení](#osvětlení)
- [Efekty a programování](#efekty-a-programování)
- [Aplikační termíny](#aplikační-termíny)

## 🔌 DMX a protokoly

### DMX 512

**Digital Multiplex with 512 pieces of information**

Průmyslový standard pro řízení stage osvětlení. Jeden DMX "universe" přenáší 512 kanálů dat, každý s hodnotou 0-255. Přenosová rychlost je 250 kbit/s s obnovovací frekvencí až 44 Hz.

**Příklad:** Par LED s 4 kanály (R, G, B, Dimmer) na DMX adrese 1 zabírá kanály 1-4.

### Universe

Sada 512 DMX kanálů. Velké instalace používají více univerzí (Universe 1, Universe 2, atd.). Každé universe je nezávislé.

**Příklad:** 
- Universe 1: Par LEDs (kanály 1-100)
- Universe 2: Moving heads (kanály 1-200)

### DMX Adresa

Start pozice fixture v rámci universe. Určuje první kanál, který fixture používá.

**Příklad:** Fixture s 4 kanály na DMX adrese 5 zabírá kanály 5, 6, 7, 8.

### DMX Kanál

Jeden ze 512 kanálů v universe. Každý kanál má hodnotu 0-255.

**Typické použití:**
- 0 = Vypnuto/Minimum
- 127 = 50%
- 255 = Maximum/Plná intenzita

### Art-Net

DMX over Ethernet protokol. Umožňuje přenášet až 32,768 univerzí přes standardní Ethernet síť. Port: 6454 (UDP).

**Výhody:**
- Dlouhá kabeláž (100m+ pomocí switche)
- Více univerzí na jeden kabel
- WiFi podpora
- Nižší náklady než DMX kabely

### sACN (E1.31)

**Streaming Architecture for Control Networks**

Profesionální DMX over Ethernet protokol standardizovaný ANSI. Podobný Art-Net, ale s lepšími enterprise features.

**Použití:**
- Velké instalace
- Broadcast/multicast mód
- Priority handling

### USB DMX Interface

Hardware zařízení převádějící USB na DMX512. Umožňuje počítači komunikovat přímo s DMX zařízeními.

**Typy:**
- Enttec DMX USB PRO
- DMXking ultraDMX
- Generic USB-DMX adaptéry

## 🎛️ Hardware a zařízení

### Fixture

Jakékoliv zařízení ovládané pomocí DMX. Může to být světlo, motor, smoke machine, atd.

**Typy:**
- Static lights (par, wash)
- Moving lights (moving head, scanner)
- LED fixtures (RGB, RGBW, pixel)
- Effects (strobe, laser, fog)

### Par LED

Jednoduchý světelný reflektor s LED diodami. Obvykle RGB nebo RGBW.

**Typické kanály:**
- Ch 1: Red (0-255)
- Ch 2: Green (0-255)
- Ch 3: Blue (0-255)
- Ch 4: Dimmer/White (0-255)

### Moving Head

Inteligentní světlo s motorickým pohybem hlavy (Pan/Tilt) a často mnoha dalšími funkcemi (gobo, prism, zoom).

**Typické kanály:**
- Pan (horizontální pohyb)
- Tilt (vertikální pohyb)
- Dimmer
- Color wheel
- Gobo wheel
- Prism
- Focus/Zoom

### RGB / RGBW Fixture

Světlo s adresovatelnou barevnou LED.

- **RGB**: 3 kanály (Red, Green, Blue)
- **RGBW**: 4 kanály (RGB + White pro vyšší jas)
- **RGBA**: 4 kanály (RGB + Amber pro teplé barvy)

### Stepper Motor

Krokový motor používaný pro přesné polohování. Řízen pomocí high/low byte (16-bit pozice = 0-65535 kroků).

**DMX kanály:**
- Ch 1: Position High Byte
- Ch 2: Position Low Byte
- Ch 3: Speed
- Ch 4: Acceleration

### Servo Motor

Servomotor s úhlovým polohováním 0-180°. Jednodušší než stepper, používá pouze 1 DMX kanál.

**Mapování:**
- DMX 0 = 0°
- DMX 127 = 90°
- DMX 255 = 180°

## 💡 Osvětlení

### Dimmer

Funkce nebo kanál ovládající intenzitu světla.

**Hodnoty:**
- 0 = Vypnuto
- 127 = 50% intenzita
- 255 = Plná intenzita

### Color Temperature

Teplota barvy světla měřená v Kelvinech.

- **Warm White**: 2700-3200K (teplé, žluté)
- **Neutral White**: 3500-4500K (neutrální)
- **Cool White**: 5000-6500K (studené, modravé)

### Pan / Tilt

**Pan**: Horizontální rotace (vlevo-vpravo)  
**Tilt**: Vertikální rotace (nahoru-dolů)

Používáno u moving heads a scannerů. Obvykle 16-bit (2 kanály pro vysokou přesnost).

### Gobo

Kovová nebo skleněná šablona umístěná před světelným zdrojem pro vytvoření vzoru nebo obrazu.

**Příklady:**
- Stars (hvězdy)
- Breakup patterns (rozbité vzory)
- Custom logos

### Strobe

Rychlé blikání světla. Používáno pro dramatický efekt.

**Frekvence:** Obvykle 1-25 bliknutí za sekundu.

### Wash Light

Světlo vytvářející široký, rovnoměrný světelný kužel. Používáno pro osvětlení velkých ploch.

**Příklady:**
- Par LEDs
- Wash moving heads
- Cyclorama lights

### Spot Light

Světlo s úzkým, fokusovaným světelným paprskem. Používáno pro zvýraznění konkrétních objektů.

**Příklady:**
- Profile spots
- Beam moving heads
- Follow spots

## ⚡ Efekty a programování

### Scene (Scéna)

Uložený snapshot všech DMX hodnot, motor pozic a servo úhlů. Umožňuje okamžité vyvolání kompletního lighting stavu.

**Použití:**
- Opening scene (úvodní osvětlení)
- Act 1, Act 2 (scény pro jednotlivé akty)
- Blackout (všechna světla vypnuto)

### Effect (Efekt)

Automatizovaná sekvence změn osvětlení běžící v reálném čase.

**Typy:**
- **Chase**: Postupné zapínání světel
- **Strobe**: Synchronizované blikání
- **Rainbow**: Plynulá změna barev
- **Fade**: Stmívání/rozsvěcování

### Chase

Efekt postupného zapínání/vypínání světel v pořadí.

**Příklad:** Světla 1→2→3→4→1→2→3→4...

**Parametry:**
- Speed (rychlost postupu)
- Direction (směr - dopředu/zpět)
- Fade time (čas přechodu)

### Fade

Plynulý přechod mezi dvěma stavy (např. barva, intenzita).

**Fade In**: Postupné rozsvěcování  
**Fade Out**: Postupné zhasínání  
**Cross Fade**: Přechod z jednoho stavu do druhého

### Block Programming

Vizuální programování efektů pomocí bloků. Každý blok reprezentuje jednu akci (set color, wait, loop).

**Bloky:**
- **Color blocks**: set-color, fade, rainbow-shift
- **Timing blocks**: wait, delay
- **Control blocks**: loop-start, loop-end
- **Movement blocks**: pan-tilt, chase-step

### Cue

Předdefinovaný lighting stav s fade time. Podobné scénám, ale s časováním.

**Cue List**: Sekvence cues pro celou show.

**Příklad:**
- Cue 1: House lights (5s fade)
- Cue 2: Stage wash (3s fade)
- Cue 3: Spotlight on singer (1s fade)

## 📱 Aplikační termíny

### PWA (Progressive Web App)

Webová aplikace která se chová jako nativní mobilní aplikace. Můžete ji instalovat na domovskou obrazovku a používat offline.

**Výhody:**
- Není potřeba App Store/Play Store
- Automatické update
- Menší velikost než nativní app
- Cross-platform

### Service Worker

JavaScript běžící na pozadí, který umožňuje offline funkcionalitu a caching.

### IndexedDB

Databáze v prohlížeči používaná pro lokální ukládání dat (fixtures, scény, efekty).

### KV Store

Key-Value úložiště používané aplikací pro perzistentní data. Wrapper nad IndexedDB.

### Offline Mode

Režim kdy aplikace funguje bez internetového připojení. Všechna data jsou lokální.

### Custom Page Builder

Funkce umožňující vytváření vlastních ovládacích panelů z UI bloků.

**Bloky:**
- Channel Slider
- Color Picker
- Toggle Button
- Button Pad
- Position Control
- Intensity Fader

### Control Block

Znovupoužitelná UI komponenta pro vytváření vlastních ovládacích panelů.

**Vlastnosti:**
- Standalone (funguje samostatně)
- Configurable (nastavitelné parametry)
- Responsive (přizpůsobivé)
- Accessible (přístupné)

### Joystick Control

Virtuální joystick pro ovládání Pan/Tilt u moving heads.

**Použití:**
- Táhněte pro pohyb
- Center pro reset (127, 127)
- Smooth control

### Connection Profile

Uložená konfigurace síťového připojení (IP, port, universe). Umožňuje rychlé přepínání mezi různými venues.

**Příklad:**
- Profile "Main Stage": 192.168.1.100, Universe 1
- Profile "Rehearsal": 192.168.2.50, Universe 0

## 📊 Hodnoty a jednotky

### DMX Value Range

**0-255** (8-bit)
- 0 = Minimum/Off
- 127 = 50%
- 255 = Maximum/Full

### 16-bit Position

**0-65535**

Používáno pro přesné polohování (Pan/Tilt, stepper motor).

**Výpočet:**
- High Byte = floor(position / 256)
- Low Byte = position % 256

### Percentage

**0-100%**

Používáno pro user-friendly hodnoty (speed, intensity).

**Konverze:**
- DMX = (Percentage / 100) × 255
- Percentage = (DMX / 255) × 100

### Angle (Úhel)

**0-180°**

Používáno pro servomotory.

**Konverze:**
- DMX = (Angle / 180) × 255
- Angle = (DMX / 255) × 180

### Frequency (Hz)

Frekvence obnovy DMX signálu nebo efektu.

**DMX Standard**: 44 Hz (44 updates per second)  
**Art-Net**: Konfigurovatelné (30-44 Hz obvykle)

## 🔧 Technické termíny

### Latency

Zpoždění mezi příkazem v aplikaci a provedením na hardware.

**Zdroje latence:**
- WiFi latency (2-20ms)
- Processing time (1-5ms)
- DMX transmission (0.5ms per fixture)

**Target**: < 50ms pro real-time control

### Throughput

Počet DMX packets odeslaných za sekundu.

**Standard**: 40-44 packets/second

### Packet

Jednotka dat odeslaná přes síť. Art-Net packet obsahuje až 512 DMX hodnot.

### Multicast

Síťový režim kdy jeden packet je doručen více příjemcům najednou.

**Použití v sACN**: Efektivnější než unicast pro více devices.

### Broadcast

Síťový režim kdy packet je odeslán všem zařízením v síti.

**Art-Net**: Používá broadcast nebo unicast podle nastavení.

## 📚 Další čtení

- [User Guide](USER_GUIDE.md) - Praktické použití termínů
- [Architecture](ARCHITECTURE.md) - Technická implementace
- [API Reference](API.md) - Programátorská reference
- [FAQ](FAQ.md) - Časté otázky

---

**Glosář pro DMX 512 Kontrolér**  
Poslední aktualizace: 2024-11-01  
Chybí nějaký termín? [Dejte nám vědět!](https://github.com/atrep123/dmx-512-controller/issues)
