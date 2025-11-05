# Glosar pojmu

Vysvetleni klicovych pojmu a terminologie pouzivane v DMX 512 Kontroler aplikaci a v oblasti stage osvetleni.

## Clipboard Obsah

- [DMX a protokoly](#dmx-a-protokoly)
- [Hardware a zarizeni](#hardware-a-zarizeni)
- [Osvetleni](#osvetleni)
- [Efekty a programovani](#efekty-a-programovani)
- [Aplikacni terminy](#aplikacni-terminy)

##  DMX a protokoly

### DMX 512

**Digital Multiplex with 512 pieces of information**

Prumyslovy standard pro rizeni stage osvetleni. Jeden DMX "universe" prenasi 512 kanalu dat, kazdy s hodnotou 0-255. Prenosova rychlost je 250 kbit/s s obnovovaci frekvenci az 44 Hz.

**Priklad:** Par LED s 4 kanaly (R, G, B, Dimmer) na DMX adrese 1 zabira kanaly 1-4.

### Universe

Sada 512 DMX kanalu. Velke instalace pouzivaji vice univerzi (Universe 1, Universe 2, atd.). Kazde universe je nezavisle.

**Priklad:** 
- Universe 1: Par LEDs (kanaly 1-100)
- Universe 2: Moving heads (kanaly 1-200)

### DMX Adresa

Start pozice fixture v ramci universe. Urcuje prvni kanal, ktery fixture pouziva.

**Priklad:** Fixture s 4 kanaly na DMX adrese 5 zabira kanaly 5, 6, 7, 8.

### DMX Kanal

Jeden ze 512 kanalu v universe. Kazdy kanal ma hodnotu 0-255.

**Typicke pouziti:**
- 0 = Vypnuto/Minimum
- 127 = 50%
- 255 = Maximum/Plna intenzita

### Art-Net

DMX over Ethernet protokol. Umoznuje prenaset az 32,768 univerzi pres standardni Ethernet sit. Port: 6454 (UDP).

**Vyhody:**
- Dlouha kabelaz (100m+ pomoci switche)
- Vice univerzi na jeden kabel
- WiFi podpora
- Nizsi naklady nez DMX kabely

### sACN (E1.31)

**Streaming Architecture for Control Networks**

Profesionalni DMX over Ethernet protokol standardizovany ANSI. Podobny Art-Net, ale s lepsimi enterprise features.

**Pouziti:**
- Velke instalace
- Broadcast/multicast mod
- Priority handling

### USB DMX Interface

Hardware zarizeni prevadejici USB na DMX512. Umoznuje pocitaci komunikovat primo s DMX zarizenimi.

**Typy:**
- Enttec DMX USB PRO
- DMXking ultraDMX
- Generic USB-DMX adaptery

##  Hardware a zarizeni

### Fixture

Jakekoliv zarizeni ovladane pomoci DMX. Muze to byt svetlo, motor, smoke machine, atd.

**Typy:**
- Static lights (par, wash)
- Moving lights (moving head, scanner)
- LED fixtures (RGB, RGBW, pixel)
- Effects (strobe, laser, fog)

### Par LED

Jednoduchy svetelny reflektor s LED diodami. Obvykle RGB nebo RGBW.

**Typicke kanaly:**
- Ch 1: Red (0-255)
- Ch 2: Green (0-255)
- Ch 3: Blue (0-255)
- Ch 4: Dimmer/White (0-255)

### Moving Head

Inteligentni svetlo s motorickym pohybem hlavy (Pan/Tilt) a casto mnoha dalsimi funkcemi (gobo, prism, zoom).

**Typicke kanaly:**
- Pan (horizontalni pohyb)
- Tilt (vertikalni pohyb)
- Dimmer
- Color wheel
- Gobo wheel
- Prism
- Focus/Zoom

### RGB / RGBW Fixture

Svetlo s adresovatelnou barevnou LED.

- **RGB**: 3 kanaly (Red, Green, Blue)
- **RGBW**: 4 kanaly (RGB + White pro vyssi jas)
- **RGBA**: 4 kanaly (RGB + Amber pro teple barvy)

### Stepper Motor

Krokovy motor pouzivany pro presne polohovani. Rizen pomoci high/low byte (16-bit pozice = 0-65535 kroku).

**DMX kanaly:**
- Ch 1: Position High Byte
- Ch 2: Position Low Byte
- Ch 3: Speed
- Ch 4: Acceleration

### Servo Motor

Servomotor s uhlovym polohovanim 0-180. Jednodussi nez stepper, pouziva pouze 1 DMX kanal.

**Mapovani:**
- DMX 0 = 0
- DMX 127 = 90
- DMX 255 = 180

##  Osvetleni

### Dimmer

Funkce nebo kanal ovladajici intenzitu svetla.

**Hodnoty:**
- 0 = Vypnuto
- 127 = 50% intenzita
- 255 = Plna intenzita

### Color Temperature

Teplota barvy svetla merena v Kelvinech.

- **Warm White**: 2700-3200K (teple, zlute)
- **Neutral White**: 3500-4500K (neutralni)
- **Cool White**: 5000-6500K (studene, modrave)

### Pan / Tilt

**Pan**: Horizontalni rotace (vlevo-vpravo)  
**Tilt**: Vertikalni rotace (nahoru-dolu)

Pouzivano u moving heads a scanneru. Obvykle 16-bit (2 kanaly pro vysokou presnost).

### Gobo

Kovova nebo sklenena sablona umistena pred svetelnym zdrojem pro vytvoreni vzoru nebo obrazu.

**Priklady:**
- Stars (hvezdy)
- Breakup patterns (rozbite vzory)
- Custom logos

### Strobe

Rychle blikani svetla. Pouzivano pro dramaticky efekt.

**Frekvence:** Obvykle 1-25 bliknuti za sekundu.

### Wash Light

Svetlo vytvarejici siroky, rovnomerny svetelny kuzel. Pouzivano pro osvetleni velkych ploch.

**Priklady:**
- Par LEDs
- Wash moving heads
- Cyclorama lights

### Spot Light

Svetlo s uzkym, fokusovanym svetelnym paprskem. Pouzivano pro zvyrazneni konkretnich objektu.

**Priklady:**
- Profile spots
- Beam moving heads
- Follow spots

##  Efekty a programovani

### Scene (Scena)

Ulozeny snapshot vsech DMX hodnot, motor pozic a servo uhlu. Umoznuje okamzite vyvolani kompletniho lighting stavu.

**Pouziti:**
- Opening scene (uvodni osvetleni)
- Act 1, Act 2 (sceny pro jednotlive akty)
- Blackout (vsechna svetla vypnuto)

### Effect (Efekt)

Automatizovana sekvence zmen osvetleni bezici v realnem case.

**Typy:**
- **Chase**: Postupne zapinani svetel
- **Strobe**: Synchronizovane blikani
- **Rainbow**: Plynula zmena barev
- **Fade**: Stmivani/rozsvecovani

### Chase

Efekt postupneho zapinani/vypinani svetel v poradi.

**Priklad:** Svetla 12341234...

**Parametry:**
- Speed (rychlost postupu)
- Direction (smer - dopredu/zpet)
- Fade time (cas prechodu)

### Fade

Plynuly prechod mezi dvema stavy (napr. barva, intenzita).

**Fade In**: Postupne rozsvecovani  
**Fade Out**: Postupne zhasinani  
**Cross Fade**: Prechod z jednoho stavu do druheho

### Block Programming

Vizualni programovani efektu pomoci bloku. Kazdy blok reprezentuje jednu akci (set color, wait, loop).

**Bloky:**
- **Color blocks**: set-color, fade, rainbow-shift
- **Timing blocks**: wait, delay
- **Control blocks**: loop-start, loop-end
- **Movement blocks**: pan-tilt, chase-step

### Cue

Preddefinovany lighting stav s fade time. Podobne scenam, ale s casovanim.

**Cue List**: Sekvence cues pro celou show.

**Priklad:**
- Cue 1: House lights (5s fade)
- Cue 2: Stage wash (3s fade)
- Cue 3: Spotlight on singer (1s fade)

##  Aplikacni terminy

### PWA (Progressive Web App)

Webova aplikace ktera se chova jako nativni mobilni aplikace. Muzete ji instalovat na domovskou obrazovku a pouzivat offline.

**Vyhody:**
- Neni potreba App Store/Play Store
- Automaticke update
- Mensi velikost nez nativni app
- Cross-platform

### Service Worker

JavaScript bezici na pozadi, ktery umoznuje offline funkcionalitu a caching.

### IndexedDB

Databaze v prohlizeci pouzivana pro lokalni ukladani dat (fixtures, sceny, efekty).

### KV Store

Key-Value uloziste pouzivane aplikaci pro perzistentni data. Wrapper nad IndexedDB.

### Offline Mode

Rezim kdy aplikace funguje bez internetoveho pripojeni. Vsechna data jsou lokalni.

### Custom Page Builder

Funkce umoznujici vytvareni vlastnich ovladacich panelu z UI bloku.

**Bloky:**
- Channel Slider
- Color Picker
- Toggle Button
- Button Pad
- Position Control
- Intensity Fader

### Control Block

Znovupouzitelna UI komponenta pro vytvareni vlastnich ovladacich panelu.

**Vlastnosti:**
- Standalone (funguje samostatne)
- Configurable (nastavitelne parametry)
- Responsive (prizpusobive)
- Accessible (pristupne)

### Joystick Control

Virtualni joystick pro ovladani Pan/Tilt u moving heads.

**Pouziti:**
- Tahnete pro pohyb
- Center pro reset (127, 127)
- Smooth control

### Connection Profile

Ulozena konfigurace sitoveho pripojeni (IP, port, universe). Umoznuje rychle prepinani mezi ruznymi venues.

**Priklad:**
- Profile "Main Stage": 192.168.1.100, Universe 1
- Profile "Rehearsal": 192.168.2.50, Universe 0

##  Hodnoty a jednotky

### DMX Value Range

**0-255** (8-bit)
- 0 = Minimum/Off
- 127 = 50%
- 255 = Maximum/Full

### 16-bit Position

**0-65535**

Pouzivano pro presne polohovani (Pan/Tilt, stepper motor).

**Vypocet:**
- High Byte = floor(position / 256)
- Low Byte = position % 256

### Percentage

**0-100%**

Pouzivano pro user-friendly hodnoty (speed, intensity).

**Konverze:**
- DMX = (Percentage / 100)  255
- Percentage = (DMX / 255)  100

### Angle (Uhel)

**0-180**

Pouzivano pro servomotory.

**Konverze:**
- DMX = (Angle / 180)  255
- Angle = (DMX / 255)  180

### Frequency (Hz)

Frekvence obnovy DMX signalu nebo efektu.

**DMX Standard**: 44 Hz (44 updates per second)  
**Art-Net**: Konfigurovatelne (30-44 Hz obvykle)

##  Technicke terminy

### Latency

Zpozdeni mezi prikazem v aplikaci a provedenim na hardware.

**Zdroje latence:**
- WiFi latency (2-20ms)
- Processing time (1-5ms)
- DMX transmission (0.5ms per fixture)

**Target**: < 50ms pro real-time control

### Throughput

Pocet DMX packets odeslanych za sekundu.

**Standard**: 40-44 packets/second

### Packet

Jednotka dat odeslana pres sit. Art-Net packet obsahuje az 512 DMX hodnot.

### Multicast

Sitovy rezim kdy jeden packet je dorucen vice prijemcum najednou.

**Pouziti v sACN**: Efektivnejsi nez unicast pro vice devices.

### Broadcast

Sitovy rezim kdy packet je odeslan vsem zarizenim v siti.

**Art-Net**: Pouziva broadcast nebo unicast podle nastaveni.

##  Dalsi cteni

- [User Guide](USER_GUIDE.md) - Prakticke pouziti terminu
- [Architecture](ARCHITECTURE.md) - Technicka implementace
- [API Reference](API.md) - Programatorska reference
- [FAQ](FAQ.md) - Caste otazky

---

**Glosar pro DMX 512 Kontroler**  
Posledni aktualizace: 2024-11-01  
Chybi nejaky termin? [Dejte nam vedet!](https://github.com/atrep123/dmx-512-controller/issues)
