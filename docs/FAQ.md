# Casto Kladene Otazky (FAQ)

Odpovedi na nejcastejsi otazky o DMX 512 Kontroler aplikaci.

## Clipboard Obsah

- [Obecne](#obecne)
- [Instalace a nastaveni](#instalace-a-nastaveni)
- [Pouzivani aplikace](#pouzivani-aplikace)
- [DMX a hardware](#dmx-a-hardware)
- [Reseni problemu](#reseni-problemu)
- [Pokrocile funkce](#pokrocile-funkce)

## Theater Obecne

### Co je DMX 512?

DMX 512 (Digital Multiplex) je prumyslovy komunikacni protokol pouzivany pro rizeni stage osvetleni a efektu. Jeden DMX "universe" muze ovladat az 512 kanalu, kde kazdy kanal ma hodnotu 0-255.

### Je aplikace zdarma?

Ano! Aplikace je open source pod MIT licenci. Muzete ji pouzivat, upravovat a distribuovat zdarma.

### Potrebuji internetove pripojeni?

Ne! Aplikace funguje kompletne offline. Internet potrebujete jen pri prvni instalaci a pro pripojeni k DMX siti (pokud pouzivate Art-Net nebo sACN).

### Na jakych zarizenich aplikace bezi?

- **Android**: 5.0 (Lollipop) a vyssi
- **iOS**: Safari 15+
- **Desktop**: Chrome, Edge, Firefox, Safari
- **Nejlepsi zkusenost**: Android 8+ s Chrome

### Kolik stoji provoz aplikace?

Aplikace je kompletne zdarma a nema zadne provozni naklady. Vsechna data jsou ulozena lokalne na vasem zarizeni.

##  Instalace a nastaveni

### Jak nainstaluji aplikaci?

1. Otevrete aplikaci v mobilnim prohlizeci
2. Kliknete na "Instalovat" v instalacnim promptu
3. Nebo Chrome menu  "Pridat na plochu"
4. Ikona se objevi na domovske obrazovce

Podrobny navod: [Android Setup Guide](ANDROID_SETUP.md)

### Proc se nezobrazuje instalacni prompt?

**Mozne priciny:**
- Stranka nebezi na HTTPS
- Jiz mate aplikaci nainstalovanou
- Prohlizec nepodporuje PWA
- Service Worker se nenainstaloval spravne

**Reseni:**
1. Overte HTTPS v URL
2. Zkuste v Chrome menu  "Pridat na plochu"
3. Vymazte cache prohlizece a zkuste znovu

### Kde se ukladaji moje data?

Data jsou ulozena lokalne ve vasem prohlizeci pomoci IndexedDB. Nikam se neodesilaji a zustavaji na vasem zarizeni.

### Mohu pouzivat aplikaci na vice zarizenich?

Ano, ale data se automaticky nesynchronizuji. Kazde zarizeni ma vlastni lokalni kopii dat. V budoucnu planujeme pridat export/import funkcionalitu.

### Jak aktualizuji aplikaci na novou verzi?

PWA se aktualizuje automaticky na pozadi. Pri pristim spusteni se nacte nova verze. Pripadne muzete obnovit stranku (refresh).

##  Pouzivani aplikace

### Kolik fixtures mohu pridat?

Technicky neni limit, ale doporucujeme:
- **Mobil**: Max 30-40 fixtures pro optimalni vykon
- **Tablet**: Max 50-60 fixtures
- **Desktop**: 100+ fixtures

### Mohu ovladat vice univerzi soucasne?

Ano! Muzete pridat neomezeny pocet univerzi. Kazde universe ma 512 DMX kanalu.

### Jak vytvorim vlastni efekt?

Mate dve moznosti:

**1. Prednastavene efekty:**
- Vyberte typ (chase, strobe, atd.)
- Nastavte rychlost a intenzitu
- Vyberte fixtures

**2. Blokove programovani:**
- Vytvorte efekt typu "Block Program"
- Pretahujte bloky (barvy, pohyb, cekani)
- Sestavte sekvenci
- Spustte

Navod: [User Guide - Efekty](USER_GUIDE.md#efekty)

### Muzu spustit vice efektu najednou?

Ano! Muzete spustit vice efektu soucasne. Efekty na ruznych fixtures bezi nezavisle. Pokud se efekty prekryvaji na stejnych fixtures, vysledek zavisi na poradi aplikace.

### Jak ulozim aktualni nastaveni?

Pouzijte funkci **Sceny**:
1. Nastavte vsechna svetla
2. Zalozka "Sceny"  "Ulozit novou scenu"
3. Pojmenujte scenu
4. Kliknete "Ulozit"

### Co je rozdil mezi RGB a RGBW?

- **RGB**: 3 kanaly (Red, Green, Blue) - barevne svetlo
- **RGBW**: 4 kanaly (Red, Green, Blue, White) - barevne svetlo + ciste bily kanal pro vyssi intenzitu

##  DMX a hardware

### Jake DMX rozhrani potrebuji?

Podporujeme:
- **Art-Net**: Ethernet DMX interface (nejcastejsi)
- **sACN (E1.31)**: Profesionalni streaming ACN
- **USB DMX**: USB DMX interface (v priprave)

### Jak pripojim Art-Net interface?

1. Pripojte Art-Net node k siti (Ethernet/WiFi)
2. Zjistete IP adresu node (obvykle 192.168.x.x nebo 2.x.x.x)
3. V aplikaci: Pripojeni  Art-Net  Zadejte IP
4. Nastavte universe cislo
5. Kliknete "Pripojit"

### Jakou IP adresu mam zadat?

IP adresa zavisi na vasem Art-Net zarizeni:
- Zkontrolujte manual zarizeni
- Obvykle 192.168.1.x nebo 2.x.x.x
- Muzete pouzit aplikaci pro skenovani site
- Nektera zarizeni maji displej s IP adresou

### Funguje aplikace s DMX512 kabely?

Aplikace sama nepodporuje prime DMX512 pripojeni. Potrebujete:
- **Art-Net nebo sACN node** - prevadi Ethernet na DMX512
- **USB DMX interface** - prevadi USB na DMX512 (v priprave)

### Jaky je doporuceny send rate pro Art-Net?

**Standardni**: 40-44 packets/second (DMX standard je 44 Hz)

Pro stabilnejsi pripojeni muzete zkusit nizsi hodnoty (30-35), ale nektere rychle efekty mohou byt mene plynule.

##  Reseni problemu

### Aplikace se nepripoji k Art-Net

**Checklist:**
1.  Je Art-Net node zapnuta?
2.  Je mobil ve stejne siti jako node?
3.  Je IP adresa spravna?
4.  Je firewall vypnuty nebo ma vyjimku?
5.  Je port 6454 otevreny?

**Reseni:**
- Pingnete IP adresu node z mobilu
- Zkuste jine zarizeni ve stejne siti
- Restartujte Art-Net node
- Zkontrolujte sitove nastaveni

### Svetla nereaguji na zmeny

**Mozne priciny:**
1. **Spatna DMX adresa** - Zkontrolujte fixture setup
2. **Nespravny universe** - Overte universe cislo
3. **Odpojeno od site** - Zkontrolujte connection status
4. **Fixture vypnuto** - Zkontrolujte napajeni fixtures

### Aplikace je pomala

**Optimalizace:**
- Snizte pocet fixtures (idealne pod 40 na mobilu)
- Vypnete nepouzivane efekty
- Zavrete jine aplikace
- Snizte send rate v pripojeni
- Pouzijte silnejsi WiFi signal

### Efekty nejsou plynule

**Priciny a reseni:**
- **Nizky send rate**  Zvyste na 40-44 Hz
- **Slaby WiFi**  Presunte se bliz k routeru nebo pouzijte kabel
- **Pretizeny mobil**  Zavrete jine aplikace
- **Prilis mnoho fixtures**  Rozdelte do vice univerzi

### Data se ztratila po update

Data jsou ulozena v browseru. Pokud:
- Vymazali jste cache prohlizece  Data jsou pryc
- Odinstalovali aplikaci  Data zustavaji (pouze ikona zmizi)
- Presli na jiny prohlizec  Data jsou oddelena

**Prevence:** V budoucnu pridame export/import funkcionalitu.

### Joystick nereaguje spravne

**Mozne problemy:**
1. **Fixture neni moving head**  Zkontrolujte typ fixture
2. **Spatne channel mapovani**  Overte Pan/Tilt kanaly
3. **Touchscreen kalibrace**  Zkuste jiny joystick size

## Rocket Pokrocile funkce

### Muzu ovladat aplikaci pomoci MIDI kontroleru?

Momentalne ne, ale je to v roadmape. Planovana podpora pro:
- MIDI note mapping
- MIDI CC (Control Change) pro faders
- MIDI clock sync

### Podporuje aplikace timecode sync?

Zatim ne, ale je to planovane:
- SMPTE timecode
- Art-Net timecode
- OSC timecode
- Cue list s timecode triggers

### Mohu vytvorit cue list?

Momentalne ne, ale muzete pouzit:
- **Sceny** - Manualni triggering
- **Block program efekty** - Sekvence s wait bloky
- **Budouci feature** - Plna cue list s fade times

### Jak muzu spolupracovat s vice operatory?

Single-user rezim je aktualni. Pro multi-user:
- **Workaround**: Export/import konfigurace (planovano)
- **Budoucnost**: Server-based multi-user mode
- **Alternative**: Kazdy operator ma vlastni universe

### Podporuje aplikace fixture library?

Zatim ne - musite manualne nastavit DMX adresy a kanaly. Planujeme:
- Fixture library s predpripravenymi profily
- Import fixture profiles (GDTF, MVR)
- Community fixture library

### Muzu integrovat aplikaci s jinym software?

Planovane integrace:
- **OSC protocol** - Remote control
- **Web API** - REST API pro externi kontrolu
- **Webhooks** - Triggering z jinych systemu

##  Tipy a triky

### Jak organizovat velke mnozstvi fixtures?

**Best practices:**
1. Pojmenujte fixtures logicky ("Par 1 Stage Left")
2. Pouzivejte emoji v nazvech ( Par Red,  Par Blue)
3. Seskupte do scen podle ucelu
4. Vytvorte "Master" sceny pro zakladni stavy

### Jak vytvorit efektivni workflow?

**Doporuceny workflow:**
1. Setup (pridat vsechny fixtures)
2. Test (projit vsechny kanaly)
3. Sceny (vytvorit zakladni looks)
4. Efekty (programovat specialni momenty)
5. Show mode (pouzivat sceny a efekty)

### Jak minimalizovat latenci?

1. Pouzivejte kabelove pripojeni (Ethernet adapter)
2. 5GHz WiFi misto 2.4GHz
3. Dedicated WiFi sit pro DMX
4. Vysoky send rate (44 Hz)
5. Minimalni pocet fixtures na universe

##  Potrebujete dalsi pomoc?

- Book [User Guide](USER_GUIDE.md) - Kompletni navod
- Build [Architecture](ARCHITECTURE.md) - Technicke detaily
- Computer [API Reference](API.md) - Pro vyvojare
- Bug [Report Issue](https://github.com/atrep123/dmx-512-controller/issues) - Nahlasit problem
- Chat [Discussions](https://github.com/atrep123/dmx-512-controller/discussions) - Komunita

---

**FAQ pro DMX 512 Kontroler**  
Posledni aktualizace: 2024-11-01  
Mate dalsi otazku? [Otevrete issue!](https://github.com/atrep123/dmx-512-controller/issues/new)
