# Troubleshooting Guide

Reseni nejcastejsich problemu a chyb v DMX 512 Kontroler aplikaci.

## Clipboard Obsah

- [Instalace a PWA](#instalace-a-pwa)
- [Pripojeni k siti](#pripojeni-k-siti)
- [Ovladani svetel](#ovladani-svetel)
- [Vykon a rychlost](#vykon-a-rychlost)
- [Data a ukladani](#data-a-ukladani)
- [Efekty a sceny](#efekty-a-sceny)
- [Browser problemy](#browser-problemy)

##  Instalace a PWA

### Problem: Instalacni prompt se nezobrazuje

**Mozne priciny:**
1. Aplikace neni na HTTPS
2. PWA uz je nainstalovana
3. Prohlizec nepodporuje PWA
4. Service Worker selhalo

**Reseni:**

**Krok 1: Zkontroluj HTTPS**
```
URL musi zacinat https:// (ne http://)
```

**Krok 2: Manualni instalace**
- Chrome: Menu ()  "Pridat na plochu" nebo "Instalovat aplikaci"
- Safari (iOS): Share  "Add to Home Screen"
- Edge: Menu ()  "Apps"  "Install this site as an app"

**Krok 3: Zkontroluj Service Worker**
1. Otevri DevTools (F12)
2. Application tab  Service Workers
3. Melo by byt "activated and is running"

**Krok 4: Vymaz cache a zkus znovu**
```javascript
// V console (F12)
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister())
})
// Pak refresh (Ctrl+R)
```

### Problem: Aplikace se po instalaci neotevira

**Priciny:**
- Chybny manifest
- Service Worker crashed
- Browser cache issue

**Reseni:**

1. **Odinstaluj a znovu nainstaluj:**
   - Dlouhe drzeni ikony  Odinstalovat
   - Otevri v browseru znovu
   - Instaluj znovu

2. **Vymaz browser data:**
   - Chrome: Settings  Privacy  Clear browsing data
   - Zaskrtni: Cached images, Site data
   - Nemazat: Cookies (ztratite data!)

3. **Zkus jiny prohlizec:**
   - Chrome (doporuceno)
   - Edge
   - Samsung Internet

### Problem: Ikona aplikace vypada spatne

**Priciny:**
- Chybejici ikony pro vas device
- Cache problem
- Android adaptive icons

**Reseni:**

1. **Vymaz cache ikony:**
   - Android: Settings  Apps  [Browser]  Storage  Clear cache
   - iOS: Smaz ikonu a reinstaluj

2. **Pockej na refresh:**
   - Android nekdy trva az 24h nez se ikona aktualizuje

3. **Zkontroluj manifest:**
   ```
   DevTools  Application  Manifest
   Zkontroluj ze "icons" obsahuje ruzne velikosti
   ```

##  Pripojeni k siti

### Problem: Nepripoji se k Art-Net node

**Diagnostika:**

**Krok 1: Zakladni kontrola**
```
 Je Art-Net node zapnuta? (kontrolka sviti)
 Je mobil ve stejne siti? (stejne WiFi)
 Je IP adresa spravna?
```

**Krok 2: Otestuj sitove pripojeni**

Pouzij ping app nebo terminal:
```bash
# Android (Termux app)
ping 192.168.1.100

# Nebo pouzij "Network Analyzer" app
```

Mel by odpovidat. Pokud ne:
- Node neni dostupna
- Firewall blokuje
- Spatna IP adresa

**Krok 3: Zkontroluj port**
```
Art-Net pouziva port 6454 (UDP)
Firewall musi tento port povolit
```

**Krok 4: Zkontroluj universe cislo**
```
Art-Net universe 0 = DMX universe 1
Nektere node pouzivaji 0-based indexing
```

**Reseni:**

1. **Restart Art-Net node**
   - Vypni a zapni napajeni
   - Pockej 30 sekund
   - Zkus pripojit znovu

2. **Zkontroluj IP v node manualu**
   - Vychozi IP byva:
     - 2.x.x.x (Art-Net default)
     - 192.168.1.x (home router)
     - 10.x.x.x (pro site)

3. **Pouzij broadcast mode**
   - Nektere nodes podporuji broadcast
   - IP adresa: 2.255.255.255 nebo 255.255.255.255

4. **Zkus lower send rate**
   - Sniz na 30-35 packets/sec
   - Muze pomoct s nestabilnim WiFi

### Problem: Pripojeni je nestabilni (odpojuje se)

**Priciny:**
- Slaby WiFi signal
- Interference
- Pretizena sit
- Node ma problemy

**Reseni:**

1. **Zlepsi WiFi signal:**
   - Presun se bliz k routeru/access pointu
   - Pouzij 5GHz WiFi misto 2.4GHz
   - Eliminuj prekazky mezi zarizenimi

2. **Dedicated WiFi sit:**
   - Idealne samostatna WiFi jen pro DMX
   - Zadne jine zarizeni na siti
   - Vypni internet sharing

3. **Pouzij kabelove pripojeni:**
   - USB-C to Ethernet adapter
   - Primy kabel do Art-Net node
   - Nejstabilnejsi reseni

4. **Zkontroluj node:**
   - Muze byt prehrata
   - Firmware update
   - Testuj s jinym zarizenim

### Problem: Vysoka latence (zpozdeni)

**Diagnostika:**

Mer latenci:
- Pohni sliderem
- Pockej na zmenu svetla
- Melo by byt < 50ms

**Priciny latence:**
- WiFi latency (20-100ms)
- Pretizena sit
- Node processing delay
- Prilis mnoho fixtures

**Reseni:**

1. **Optimalizuj sit:**
   ```
   WiFi: 5GHz misto 2.4GHz
   Kabel: Vzdy lepsi nez WiFi
   Router: Blizko node i mobilu
   ```

2. **Sniz send rate:**
   ```
   44 Hz  30 Hz muze snizit latenci
   Mene packets = mene congestion
   ```

3. **Omez fixtures:**
   ```
   < 50 fixtures per universe
   Rozdel do vice univerzi
   ```

4. **Quality of Service (QoS):**
   ```
   Router nastaveni:
   Prioritizuj DMX traffic (port 6454)
   ```

##  Ovladani svetel

### Problem: Svetla nereaguji na zmeny

**Checklist:**

```
 Je pripojeni aktivni? (zelena tecka v Connection)
 Je spravna DMX adresa? (over v fixture setup)
 Je spravne universe? (over v Setup)
 Je fixture zapnuto? (napajeni)
 Jsou DMX kabely zapojene spravne?
```

**Diagnostika:**

1. **Testuj jednoduche svetlo:**
   - Nastav simple dimmer fixture
   - DMX adresa 1, 1 kanal
   - Pohni sliderem 0-255
   - Melo by reagovat

2. **Zkontroluj packet counter:**
   ```
   Connection view  "Packets sent: XXX"
   Melo by se zvysovat kdyz pohybujes sliderem
   ```

3. **Zkontroluj DMX addressing:**
   ```
   Fixture na DMX 10 s 4 kanaly zabira:
   Kanaly 10, 11, 12, 13
   Nesmi se prekryvat s jinym fixture!
   ```

**Reseni:**

1. **Reset fixture DMX adresy:**
   - Zkontroluj fixture manual
   - Nastav na jednoduchou adresu (1, 10, 100)
   - Otestuj

2. **Zkontroluj DMX retez:**
   ```
   Controller  Node  Fixture 1  Fixture 2  ...
   Kazde fixture musi byt v retezu
   Posledni fixture: DMX terminator (120)
   ```

3. **Testuj mimo aplikaci:**
   - Pouzij jinou DMX kontrolu
   - Over ze fixture funguje
   - Vyluc hardware problem

### Problem: Nektere kanaly nefunguji

**Priciny:**
- Spatne channel mapping
- Fixture ma jiny channel layout
- Firmware verze fixture

**Reseni:**

1. **Zkontroluj fixture manual:**
   ```
   Najdi spravny DMX channel layout
   Nektere fixtures maji multiple modes:
   - 3-channel mode (RGB)
   - 4-channel mode (RGBW)
   - 7-channel mode (RGB + dimmer + special)
   ```

2. **Prenastavit fixture mode:**
   - Obvykle v fixture menu
   - Vyber mode ktery odpovida channel count v aplikaci

3. **Manually test channels:**
   ```
   Fixtures view  Vyberte fixture
   Postupne zkousej jednotlive kanaly
   Sleduj co se deje na fixture
   ```

### Problem: Barvy nevypadaji spravne

**Priciny:**
- Spatne RGB channel poradi
- RGBW vs RGB mode
- Color calibration

**Reseni:**

1. **Zkontroluj channel order:**
   ```
   Nektere fixtures pouzivaji:
   - RGB (standard)
   - RBG
   - GRB (mene caste)
   
   Zkus swapnout kanaly v Setup
   ```

2. **Calibrate color:**
   ```
   Red   = 255, 0, 0   (melo byt ciste cervena)
   Green = 0, 255, 0   (melo byt ciste zelena)
   Blue  = 0, 0, 255   (melo byt ciste modra)
   
   Pokud ne, channels jsou spatne namapovane
   ```

3. **Zkontroluj fixture mode:**
   ```
   RGB vs RGBW mode v fixture
   Musi odpovidat typu v aplikaci
   ```

##  Vykon a rychlost

### Problem: Aplikace je pomala

**Symptomy:**
- Dlouhe nacitani
- Laggy slidery
- Zpozdeni UI

**Diagnostika:**

Otevri DevTools (F12):
```
Performance tab  Nahraj session
Hledej dlouhe tasks (> 50ms)
```

**Reseni:**

1. **Omez pocet fixtures:**
   ```
   Doporuceno:
   - Mobil: < 40 fixtures
   - Tablet: < 60 fixtures
   - Desktop: unlimited
   ```

2. **Vypni nepouzivane efekty:**
   ```
   Bezici efekty pouzivaji CPU
   Effects view  Vypni vsechny
   ```

3. **Restart aplikaci:**
   ```
   Zavri a otevri znovu
   Vymaze memory leaks
   ```

4. **Vymaz stara data:**
   ```
   Setup  Smaz nepouzivane:
   - Fixtures
   - Scenes
   - Effects
   ```

5. **Update prohlizec:**
   ```
   Chrome/Edge na nejnovejsi verzi
   Starsi verze mohou byt pomalejsi
   ```

### Problem: Efekty nejsou plynule

**Priciny:**
- Nizky send rate
- Slaby WiFi
- CPU overload
- Prilis mnoho fixtures v efektu

**Reseni:**

1. **Zvys send rate:**
   ```
   Connection  Send Rate: 44 Hz
   Vyssi = plynulejsi (ale vice bandwidth)
   ```

2. **Sniz effect speed:**
   ```
   Pomalejsi efekty = mene updates
   Vypada plynuleji
   ```

3. **Omez fixtures v efektu:**
   ```
   Chase efekt na 50 fixtures = laggy
   Rozdel do 2 efektu po 25 fixtures
   ```

4. **Pouzij jednodussi efekty:**
   ```
   Rainbow effect je CPU intensive
   Chase effect je lehky
   ```

##  Data a ukladani

### Problem: Data se ztratila

**Kde se data ukladaji:**
```
Browser  IndexedDB  "spark-kv" database
Samostatne pro kazdy prohlizec
```

**Mozne priciny:**
- Vymazana cache browseru
- Browser reinstalace
- Prechod na jiny browser
- Storage quota exceeded

**Prevention:**

 **DULEZITE:**
```
"Clear browsing data"  NEMAZAT "Site data"!
Pouze "Cached images and files" je safe
```

**Budoucnost:** Export/import bude v V1.2

### Problem: "Quota exceeded" error

**Pricina:**
Browser ma limit storage (obvykle 50-100MB).

**Reseni:**

1. **Zkontroluj usage:**
   ```javascript
   // V console (F12)
   navigator.storage.estimate().then(console.log)
   ```

2. **Vymaz stara data:**
   - Smaz nepouzivane fixtures
   - Smaz stare scenes
   - Smaz stare effects

3. **Request vice storage:**
   ```javascript
   // V console (F12)
   navigator.storage.persist().then(console.log)
   ```

##  Efekty a sceny

### Problem: Scena se neaplikuje spravne

**Diagnostika:**

```
 Je scena ulozena? (zkontroluj v Scenes)
 Obsahuje fixtures ktere existuji?
 Jsou fixtures pripojene?
```

**Reseni:**

1. **Znovu uloz scenu:**
   ```
   Nastav svetla
   Save Scene  Overwrite existujici
   ```

2. **Zkontroluj deleted fixtures:**
   ```
   Scena obsahuje fixtures ktere uz neexistuji?
   Smaz a vytvor znovu
   ```

### Problem: Effect se nespusti

**Checklist:**

```
 Je vybrany nejaky fixture?
 Fixtures existuji?
 Effect speed > 0?
 Je pripojeni aktivni?
```

**Reseni:**

1. **Zkontroluj fixture selection:**
   ```
   Effect edit  Fixtures list
   Musi byt minimalne 1 zaskrtnuty
   ```

2. **Restart effect:**
   ```
   Stop  Wait 2 sec  Start
   ```

3. **Smaz a vytvor znovu:**
   ```
   Nekdy se corrupted state
   Delete effect  Create new
   ```

##  Browser problemy

### Chrome

**"Site can't be reached"**
- Zkontroluj internet
- Zkus v incognito mode
- Disable extensions

**Slow performance**
- Vymaz cache (ne site data!)
- Disable heavy extensions
- Update Chrome

### Safari (iOS)

**PWA features limited**
- Safari ma horsi PWA support
- Nektere funkce nemusi fungovat
- Preferuj Chrome na iOS pokud mozne

**Refresh issues**
- Pull-to-refresh disabled
- Rucni refresh: Close a znovu otevri

### Firefox

**Partial PWA support**
- Firefox nepodporuje instalaci
- Muzes pouzit jako web app
- Nektere PWA features chybi

##  Stale nefunguje?

### Ziskej help

1. **GitHub Issues:**
   ```
   https://github.com/atrep123/dmx-512-controller/issues
   
   Include:
   - Device (Samsung S21, iPhone 13, etc.)
   - OS (Android 13, iOS 17, etc.)
   - Browser (Chrome 119, Safari 17, etc.)
   - Steps to reproduce
   - Screenshots
   - Console errors (F12  Console)
   ```

2. **GitHub Discussions:**
   ```
   Pro obecne otazky a pomoc komunity
   https://github.com/atrep123/dmx-512-controller/discussions
   ```

3. **Console errors:**
   ```
   F12  Console tab
   Screenshot errors (cervene)
   Include v issue reportu
   ```

### Debug mode

Pro detailni diagnostiku:
```javascript
// V console (F12)
localStorage.setItem('debug', 'true')
// Refresh page
// Vidis debug logs v console
```

---

**Troubleshooting Guide pro DMX 512 Kontroler**  
Posledni aktualizace: 2024-11-01  
Nenasli jste reseni? [Vytvorte issue!](https://github.com/atrep123/dmx-512-controller/issues/new?template=bug_report.yml)
