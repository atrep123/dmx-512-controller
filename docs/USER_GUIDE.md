# Uzivatelska prirucka DMX 512 Kontroler

Kompletni navod k pouziti DMX 512 Kontroler aplikace pro rizeni stage osvetleni, motoru a efektu.

## Clipboard Obsah

- [Uvod](#uvod)
- [Zaciname](#zaciname)
- [Nastaveni](#nastaveni)
- [Ovladani svetel](#ovladani-svetel)
- [Sceny](#sceny)
- [Efekty](#efekty)
- [Motory a serva](#motory-a-serva)
- [Ziva kontrola](#ziva-kontrola)
- [Vlastni stranky](#vlastni-stranky)
- [Sitove pripojeni](#sitove-pripojeni)
- [Tipy a triky](#tipy-a-triky)

## Theater Uvod

DMX 512 Kontroler je profesionalni aplikace pro ovladani stage osvetleni a motoru pomoci DMX 512 protokolu. Aplikace bezi jako Progressive Web App (PWA) na mobilnich zarizenich a poskytuje intuitivni dotykove rozhrani.

### Co muzete ovladat

-  **Svetelna zarizeni** - DMX svetla, RGB pary, moving heads
-  **Motory** - Stepper motory s presnym polohovanim
- Target **Servomotory** - Uhlove polohovani 0-180
-  **Efekty** - Automatizovane lighting efekty
-  **Sceny** - Rychle vyvolani ulozenych stavu

### Hlavni funkce

- Ovladani jednotlivych DMX kanalu
- RGB/RGBW barevny picker
- Ukladani a vyvolavani scen
- 14 vestavenych efektu
- Vizualni blokove programovani vlastnich efektu
- Joystick pro Pan/Tilt kontrolu
- Offline rezim
- Vlastni ovladaci panely

## Rocket Zaciname

### Prvni spusteni

1. **Otevrete aplikaci** v prohlizeci nebo jako nainstalovanou PWA
2. **Instalacni prompt** - Pokud pouzivate mobilni prohlizec, objevi se prompt k instalaci
3. **Zakladni orientace** - Aplikace ma 9 hlavnich sekci dostupnych pres horni zalozky

### Zakladni workflow

```
1. Nastaveni  Pridejte universe
2. Nastaveni  Pridejte fixtures (svetla)
3. Svetla  Nastavte hodnoty kanalu
4. Sceny  Ulozte aktualni stav
5. Pripojeni  Pripojte se k DMX siti
6. Ziva kontrola  Ovladejte v realnem case
```

##  Nastaveni

### Vytvoreni Universe

Universe reprezentuje 512 DMX kanalu.

1. Prejdete na zalozku **"Nastaveni"**
2. V sekci **"DMX Universa"** kliknete na **"Pridat Universe"**
3. Zadejte nazev (napr. "Main Stage")
4. Kliknete **"Vytvorit"**

### Pridani Fixture (svetla)

1. V zalozce **"Nastaveni"**
2. V sekci **"Fixtures"** kliknete **"Pridat Fixture"**
3. Vyplnte formular:
   - **Nazev**: Pojmenujte vase svetlo (napr. "Par LED 1")
   - **Universe**: Vyberte universe
   - **DMX adresa**: Start adresa (1-512)
   - **Typ fixture**: Vyberte typ
   - **Pocet kanalu**: Kolik kanalu ma fixture

**Typy fixtures:**
- **Generic** - Obecne svetlo s custom kanaly
- **RGB** - RGB svetlo (3 kanaly: Red, Green, Blue)
- **RGBW** - RGBW svetlo (4 kanaly: Red, Green, Blue, White)
- **Moving Head** - Moving head s Pan/Tilt

4. Kliknete **"Pridat Fixture"**

### Uprava kanalu

Po vytvoreni fixture muzete upravit nazvy kanalu:

1. Najdete fixture v seznamu
2. Kliknete na **"Upravit"**
3. Zmente nazvy kanalu (napr. "Ch 1"  "Dimmer")
4. Ulozte zmeny

##  Ovladani svetel

### Zalozka "Svetla"

Zde najdete vsechna vase fixtures s ovladanim jednotlivych kanalu.

#### Ovladani pomoci slideru

1. Najdete fixture v seznamu
2. Posunte slider kanalu doleva (nizsi hodnota) nebo doprava (vyssi hodnota)
3. Hodnota se okamzite aplikuje

**DMX hodnoty:**
- 0 = Vypnuto / Minimalni
- 255 = Maximalni intenzita

#### RGB Color Picker

Pro RGB/RGBW fixtures:

1. Kliknete na **barevny ctverec** nebo **"Vybrat barvu"**
2. Pouzijte color picker k vyberu barvy
3. Nebo zadejte RGB hodnoty manualne
4. Barva se okamzite aplikuje na vsechny RGB kanaly

#### Ciselne vstupy

Pro presne hodnoty:

1. Kliknete na **ciselnou hodnotu** vedle slideru
2. Zadejte presnou hodnotu (0-255)
3. Stisknete Enter

### Rychle akce

- **Reset na 0**: Double-klik na slider
- **Set na Max (255)**: Klik na maximum slideru
- **Copy hodnotu**: Long-press na hodnotu (mobilni)

##  Sceny

Sceny umoznuji ulozit a rychle vyvolat kompletni stavy vsech svetel a motoru.

### Vytvoreni sceny

1. Prejdete na zalozku **"Sceny"**
2. Nastavte vsechna svetla do pozadovaneho stavu
3. Kliknete **"Ulozit novou scenu"**
4. Zadejte nazev sceny (napr. "Opening", "Red Wash", "Blackout")
5. Kliknete **"Ulozit"**

Scena ulozi:
- Vsechny hodnoty DMX kanalu
- Pozice stepper motoru
- Uhly servomotoru

### Vyvolani sceny

1. V zalozce **"Sceny"** najdete pozadovanou scenu
2. Kliknete na **"Aktivovat"**
3. Vsechny hodnoty se okamzite aplikuji

**Aktivni scena** je zvyraznena barevnym rameckem.

### Sprava scen

- **Prejmenovat**: Klik na ikonu tuzky
- **Smazat**: Klik na ikonu kose
- **Aktualizovat**: Aktivujte scenu  upravte hodnoty  "Ulozit zmeny"

### Best practices

- Vytvorte scenu "Blackout" (vsechny kanaly na 0)
- Pojmenujte sceny popisne (napr. "Act 1 Opening", ne "Scene 1")
- Testujte sceny pred showem
- Vytvorte zalozni sceny

##  Efekty

Efekty jsou automatizovane lighting sekvence.

### Preddefinovane efekty

Aplikace obsahuje 14 vestavenych efektu:

1. **Chase** - Postupne zapinani svetel
2. **Strobe** - Rychle blikani
3. **Rainbow** - Plynula zmena barev duhy
4. **Fade** - Plynule stmivani/rozsvecovani
5. **Sweep** - Pohyb svetla napric fixtures
6. **Sparkle** - Nahodne blikani
7. **Wipe** - Wipe prechod
8. **Bounce** - Bounce tam a zpet
9. **Theater Chase** - Theater chase pattern
10. **Fire** - Simulace ohne
11. **Wave** - Wave pattern
12. **Pulse** - Pulsni efekt
13. **Color Fade** - Fade mezi barvami
14. **Block Program** - Vlastni block program

### Vytvoreni efektu

1. Prejdete na zalozku **"Efekty"**
2. Kliknete **"Vytvorit efekt"**
3. Vyplnte formular:
   - **Nazev**: Pojmenujte efekt
   - **Typ**: Vyberte typ efektu
   - **Rychlost**: 0-100 (vyssi = rychlejsi)
   - **Intenzita**: 0-100 (ovlivnuje intenzitu efektu)
4. **Vyberte fixtures**: Zaskrtnete ktera svetla efekt ovlivni
5. Kliknete **"Vytvorit"**

### Spusteni efektu

1. Najdete efekt v seznamu
2. Kliknete na **prepinac** (toggle)
3. Efekt se zacne okamzite provadet

**Zelena** = efekt bezi  
**Seda** = efekt je zastaven

### Uprava beziciho efektu

I kdyz efekt bezi, muzete upravit:
- **Rychlost**: Slider rychlosti
- **Intenzita**: Slider intenzity
- Zmeny se aplikuji okamzite

### Vizualni blokove programovani

Pro pokrocile uzivatele - vytvorte vlastni efekty pomoci bloku:

1. Vytvorte novy efekt typu **"Block Program"**
2. Kliknete **"Upravit bloky"**
3. V levem panelu vyberte typ bloku:
   - **Barvy**: set-color, fade, rainbow-shift
   - **Pohyb**: pan-tilt, chase-step
   - **Timing**: wait
   - **Control**: loop-start, loop-end
   - **Efekty**: strobe-pulse, random-color
4. Pretahnete bloky do middle panelu
5. Kliknete na blok pro upravu parametru
6. Usporadejte bloky do sekvence
7. Pridejte smycky pomoci loop-start/loop-end
8. Ulozte a spustte

**Priklad simple chase:**
```
1. loop-start (count: 10)
2. set-color (fixture 0, red)
3. wait (100ms)
4. set-color (fixture 1, red)
5. wait (100ms)
6. loop-end
```

##  Motory a serva

### Stepper Motory

Stepper motory pouzivaji 16-bit polohovani (0-65535 kroku).

#### Pridani motoru

1. Zalozka **"Nastaveni"**  sekce **"Stepper Motory"**
2. Kliknete **"Pridat Motor"**
3. Vyplnte:
   - Nazev
   - DMX adresa (obvykle 4 kanaly)
   - Max kroku (napr. 200 pro 1 otacku)
4. Kliknete **"Pridat"**

#### Ovladani

1. Zalozka **"Motory"**
2. Najdete motor
3. Nastavte:
   - **Pozice**: Target pozice (0-max steps)
   - **Rychlost**: Jak rychle se pohybuje (0-255)
   - **Zrychleni**: Acceleration rate (0-255)

Motor se automaticky pohne na target pozici.

### Servomotory

Serva pouzivaji uhlove polohovani (0-180).

#### Pridani serva

1. Zalozka **"Nastaveni"**  sekce **"Servomotory"**
2. Kliknete **"Pridat Servo"**
3. Vyplnte:
   - Nazev
   - DMX adresa (1 kanal)
   - Min/Max uhel (default 0-180)
4. Kliknete **"Pridat"**

#### Ovladani

1. Zalozka **"Motory"**
2. Najdete servo
3. Nastavte **uhel** (0-180)

Servo se pohne na nastaveny uhel.

##  Ziva kontrola

Zalozka "Kontrola" poskytuje real-time ovladani pomoci joysticku.

### Joystick Pan/Tilt

Pro moving heads a motory s Pan/Tilt:

1. Prejdete na **"Kontrola"**
2. Vyberte fixture v dropdown menu
3. Pouzijte **joystick** k ovladani:
   - Tahnete joystick doleva/doprava = Pan
   - Tahnete joystick nahoru/dolu = Tilt
4. Joystick ma **stredovou pozici** (127, 127)

### Rychle ovladani efektu

V sekci "Aktivni efekty":
- Start/Stop efekty jednim kliknutim
- Upravte rychlost on-the-fly
- Prepinani mezi vice efekty soucasne

##  Vlastni stranky

Vytvorte si vlastni ovladaci panel z UI bloku.

### Zalozka "Moje stranka"

1. Prejdete na **"Moje stranka"**
2. Kliknete **"Pridat blok"**
3. Vyberte typ bloku:
   - **Channel Slider** - Ovladani jednoho kanalu
   - **Color Picker** - RGB picker
   - **Toggle Button** - On/Off prepinac
   - **Button Pad** - Grid tlacitek
   - **Position Control** - Pan/Tilt kontrola
   - **Intensity Fader** - Vertikalni fader
4. Nakonfigurujte blok
5. Usporadejte bloky drag & drop

### Use cases

- **DJ panel**: Rychle ovladani barev a efektu
- **Theater panel**: Sceny a dimming
- **Mobile panel**: Zjednodusene ovladani pro pohyb
- **Backup panel**: Emergency kontroly

##  Sitove pripojeni

### Podporovane protokoly

- **Art-Net** - Nejpouzivanejsi DMX-over-Ethernet protokol
- **sACN (E1.31)** - Profesionalni streaming ACN (pripraveno)
- **USB DMX** - DMX interface pres USB (pripraveno)

### Konfigurace Art-Net

1. Prejdete na **"Pripojeni"**
2. V sekci **"Protokol"** vyberte **"Art-Net"**
3. Vyplnte:
   - **IP adresa**: IP vasi Art-Net node (napr. 192.168.1.100)
   - **Port**: Obvykle 6454
   - **Universe**: Cislo universa (0-15)
   - **Send Rate**: Packets per second (40-44)
4. Kliknete **"Pripojit"**

### Profily pripojeni

Ulozte si ruzne konfigurace pro ruzna mista:

1. Vyplnte konfiguraci
2. Zadejte **Nazev profilu** (napr. "Main Venue", "Rehearsal Room")
3. Kliknete **"Ulozit profil"**

**Nacteni profilu:**
- Vyberte profil z dropdown
- Kliknete **"Nacist"**
- Konfigurace se vyplni automaticky

### Monitoring pripojeni

V horni casti sekce pripojeni vidite:
- **Status**: Connected / Disconnected / Connecting / Error
- **Packet counter**: Kolik packets bylo odeslano
- **Last packet**: Casova znacka posledniho packetu

### Troubleshooting pripojeni

**Nepripoji se:**
- Zkontrolujte IP adresu
- Overte ze Art-Net node je zapnuta
- Zkontrolujte sitove pripojeni
- Firewall muze blokovat komunikaci

**Vysoka latence:**
- Snizte Send Rate
- Zkontrolujte WiFi silu
- Pouzijte kabelove pripojeni pokud mozne

##  Tipy a triky

### Performance

- **Disable nepouzivane efekty** - Bezici efekty pouzivaji CPU
- **Omezeni fixture count** - Pro mobilni zarizeni max 30-40 fixtures
- **Offline mode** - Vypnete WiFi pro lepsi battery life
- **Brightness** - Snizte jas displeje behem show

### Workflow tipy

- **Organize fixtures logicky** - Pojmenujte je podle pozice
- **Color coding** - Pouzijte emoji v nazvech ( Red Par,  Blue Par)
- **Backup data** - Exportujte data pravidelne (TODO: implement)
- **Test pred showem** - Vyzkousejte vsechny sceny a efekty

### Keyboard shortcuts

Na desktopu muzete pouzit:
- **Space** - Play/Pause aktivni efekt
- **Esc** - Close dialog
- **Tab** - Navigate mezi controls

### Mobile tips

- **Portrait mode** - Lepsi pro ovladani slideru
- **Landscape mode** - Lepsi pro joystick kontrolu
- **Pull to refresh** - Zakazano aby se nepletlo s UI
- **Screen lock** - Nastavte "Keep screen on" v system settings

### Pro users

- **MIDI mapping** - Pripojte MIDI kontroler (TODO: implement)
- **OSC protocol** - Remote control pres OSC (TODO: implement)
- **Timecode sync** - Sync s timecode (TODO: implement)
- **Multi-user** - Vice zarizeni soucasne (vyzaduje server)

##  Casto kladene otazky

### Q: Mohu ovladat vice univerzi soucasne?
A: Ano, pridejte vice univerzi v Nastaveni. Kazde universe ma 512 kanalu.

### Q: Funguje aplikace offline?
A: Ano! Vsechna data jsou lokalni. Potrebujete jen pripojeni k DMX siti.

### Q: Kolik fixtures mohu pridat?
A: Technicky neomezeno, ale doporucujeme max 50 fixtures pro mobile performance.

### Q: Mohu exportovat/importovat data?
A: Zatim ne, tato funkce je v planu.

### Q: Podporuje aplikace MIDI kontrolery?
A: Zatim ne, ale je to v roadmape.

### Q: Jak aktualizuji aplikaci?
A: PWA se aktualizuje automaticky. Obnovte stranku pro nacteni nove verze.

### Q: Je aplikace zdarma?
A: Ano! Open source pod MIT licenci.

##  Potrebujete pomoc?

- Book [Architecture Guide](./ARCHITECTURE.md)
- Computer [API Documentation](./API.md)
- Bug [Report Issue](https://github.com/atrep123/dmx-512-controller/issues)
- Chat [Discussions](https://github.com/atrep123/dmx-512-controller/discussions)

---

**Uzivatelska prirucka pro DMX 512 Kontroler**  
Verze: 1.0  
Posledni aktualizace: 2024
