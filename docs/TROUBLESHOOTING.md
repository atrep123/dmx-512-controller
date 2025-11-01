# Troubleshooting Guide

Řešení nejčastějších problémů a chyb v DMX 512 Kontrolér aplikaci.

## 📋 Obsah

- [Instalace a PWA](#instalace-a-pwa)
- [Připojení k síti](#připojení-k-síti)
- [Ovládání světel](#ovládání-světel)
- [Výkon a rychlost](#výkon-a-rychlost)
- [Data a ukládání](#data-a-ukládání)
- [Efekty a scény](#efekty-a-scény)
- [Browser problémy](#browser-problémy)

## 📱 Instalace a PWA

### Problém: Instalační prompt se nezobrazuje

**Možné příčiny:**
1. Aplikace není na HTTPS
2. PWA už je nainstalovaná
3. Prohlížeč nepodporuje PWA
4. Service Worker selhalo

**Řešení:**

**Krok 1: Zkontroluj HTTPS**
```
URL musí začínat https:// (ne http://)
```

**Krok 2: Manuální instalace**
- Chrome: Menu (⋮) → "Přidat na plochu" nebo "Instalovat aplikaci"
- Safari (iOS): Share → "Add to Home Screen"
- Edge: Menu (⋮) → "Apps" → "Install this site as an app"

**Krok 3: Zkontroluj Service Worker**
1. Otevři DevTools (F12)
2. Application tab → Service Workers
3. Mělo by být "activated and is running"

**Krok 4: Vymaž cache a zkus znovu**
```javascript
// V console (F12)
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister())
})
// Pak refresh (Ctrl+R)
```

### Problém: Aplikace se po instalaci neotevírá

**Příčiny:**
- Chybný manifest
- Service Worker crashed
- Browser cache issue

**Řešení:**

1. **Odinstaluj a znovu nainstaluj:**
   - Dlouhé držení ikony → Odinstalovat
   - Otevři v browseru znovu
   - Instaluj znovu

2. **Vymaž browser data:**
   - Chrome: Settings → Privacy → Clear browsing data
   - Zaškrtni: Cached images, Site data
   - Nemazat: Cookies (ztratíte data!)

3. **Zkus jiný prohlížeč:**
   - Chrome (doporučeno)
   - Edge
   - Samsung Internet

### Problém: Ikona aplikace vypadá špatně

**Příčiny:**
- Chybějící ikony pro váš device
- Cache problém
- Android adaptive icons

**Řešení:**

1. **Vymaž cache ikony:**
   - Android: Settings → Apps → [Browser] → Storage → Clear cache
   - iOS: Smaž ikonu a reinstaluj

2. **Počkej na refresh:**
   - Android někdy trvá až 24h než se ikona aktualizuje

3. **Zkontroluj manifest:**
   ```
   DevTools → Application → Manifest
   Zkontroluj že "icons" obsahuje různé velikosti
   ```

## 🌐 Připojení k síti

### Problém: Nepřipojí se k Art-Net node

**Diagnostika:**

**Krok 1: Základní kontrola**
```
✓ Je Art-Net node zapnutá? (kontrolka svítí)
✓ Je mobil ve stejné síti? (stejné WiFi)
✓ Je IP adresa správná?
```

**Krok 2: Otestuj síťové připojení**

Použij ping app nebo terminal:
```bash
# Android (Termux app)
ping 192.168.1.100

# Nebo použij "Network Analyzer" app
```

Měl by odpovídat. Pokud ne:
- Node není dostupná
- Firewall blokuje
- Špatná IP adresa

**Krok 3: Zkontroluj port**
```
Art-Net používá port 6454 (UDP)
Firewall musí tento port povolit
```

**Krok 4: Zkontroluj universe číslo**
```
Art-Net universe 0 = DMX universe 1
Některé node používají 0-based indexing
```

**Řešení:**

1. **Restart Art-Net node**
   - Vypni a zapni napájení
   - Počkej 30 sekund
   - Zkus připojit znovu

2. **Zkontroluj IP v node manuálu**
   - Výchozí IP bývá:
     - 2.x.x.x (Art-Net default)
     - 192.168.1.x (home router)
     - 10.x.x.x (pro sítě)

3. **Použij broadcast mode**
   - Některé nodes podporují broadcast
   - IP adresa: 2.255.255.255 nebo 255.255.255.255

4. **Zkus lower send rate**
   - Sniž na 30-35 packets/sec
   - Může pomoct s nestabilním WiFi

### Problém: Připojení je nestabilní (odpojuje se)

**Příčiny:**
- Slabý WiFi signál
- Interference
- Přetížená síť
- Node má problémy

**Řešení:**

1. **Zlepši WiFi signál:**
   - Přesuň se blíž k routeru/access pointu
   - Použij 5GHz WiFi místo 2.4GHz
   - Eliminuj překážky mezi zařízeními

2. **Dedicated WiFi síť:**
   - Ideálně samostatná WiFi jen pro DMX
   - Žádné jiné zařízení na síti
   - Vypni internet sharing

3. **Použij kabelové připojení:**
   - USB-C to Ethernet adapter
   - Přímý kabel do Art-Net node
   - Nejstabilnější řešení

4. **Zkontroluj node:**
   - Může být přehřátá
   - Firmware update
   - Testuj s jiným zařízením

### Problém: Vysoká latence (zpoždění)

**Diagnostika:**

Měř latenci:
- Pohni sliderem
- Počkej na změnu světla
- Mělo by být < 50ms

**Příčiny latence:**
- WiFi latency (20-100ms)
- Přetížená síť
- Node processing delay
- Příliš mnoho fixtures

**Řešení:**

1. **Optimalizuj síť:**
   ```
   WiFi: 5GHz místo 2.4GHz
   Kabel: Vždy lepší než WiFi
   Router: Blízko node i mobilu
   ```

2. **Sniž send rate:**
   ```
   44 Hz → 30 Hz může snížit latenci
   Méně packets = méně congestion
   ```

3. **Omez fixtures:**
   ```
   < 50 fixtures per universe
   Rozděl do více univerzí
   ```

4. **Quality of Service (QoS):**
   ```
   Router nastavení:
   Prioritizuj DMX traffic (port 6454)
   ```

## 💡 Ovládání světel

### Problém: Světla nereagují na změny

**Checklist:**

```
✓ Je připojení aktivní? (zelená tečka v Connection)
✓ Je správná DMX adresa? (ověř v fixture setup)
✓ Je správné universe? (ověř v Setup)
✓ Je fixture zapnuto? (napájení)
✓ Jsou DMX kabely zapojené správně?
```

**Diagnostika:**

1. **Testuj jednoduché světlo:**
   - Nastav simple dimmer fixture
   - DMX adresa 1, 1 kanál
   - Pohni sliderem 0-255
   - Mělo by reagovat

2. **Zkontroluj packet counter:**
   ```
   Connection view → "Packets sent: XXX"
   Mělo by se zvyšovat když pohybuješ sliderem
   ```

3. **Zkontroluj DMX addressing:**
   ```
   Fixture na DMX 10 s 4 kanály zabírá:
   Kanály 10, 11, 12, 13
   Nesmí se překrývat s jiným fixture!
   ```

**Řešení:**

1. **Reset fixture DMX adresy:**
   - Zkontroluj fixture manuál
   - Nastav na jednoduchou adresu (1, 10, 100)
   - Otestuj

2. **Zkontroluj DMX řetěz:**
   ```
   Controller → Node → Fixture 1 → Fixture 2 → ...
   Každé fixture musí být v řetězu
   Poslední fixture: DMX terminator (120Ω)
   ```

3. **Testuj mimo aplikaci:**
   - Použij jinou DMX kontrolu
   - Ověř že fixture funguje
   - Vyluč hardware problém

### Problém: Některé kanály nefungují

**Příčiny:**
- Špatné channel mapping
- Fixture má jiný channel layout
- Firmware verze fixture

**Řešení:**

1. **Zkontroluj fixture manuál:**
   ```
   Najdi správný DMX channel layout
   Některé fixtures mají multiple modes:
   - 3-channel mode (RGB)
   - 4-channel mode (RGBW)
   - 7-channel mode (RGB + dimmer + special)
   ```

2. **Přenastavit fixture mode:**
   - Obvykle v fixture menu
   - Vyber mode který odpovídá channel count v aplikaci

3. **Manually test channels:**
   ```
   Fixtures view → Vyberte fixture
   Postupně zkoušej jednotlivé kanály
   Sleduj co se děje na fixture
   ```

### Problém: Barvy nevypadají správně

**Příčiny:**
- Špatné RGB channel pořadí
- RGBW vs RGB mode
- Color calibration

**Řešení:**

1. **Zkontroluj channel order:**
   ```
   Některé fixtures používají:
   - RGB (standard)
   - RBG
   - GRB (méně časté)
   
   Zkus swapnout kanály v Setup
   ```

2. **Calibrate color:**
   ```
   Red   = 255, 0, 0   (mělo být čistě červená)
   Green = 0, 255, 0   (mělo být čistě zelená)
   Blue  = 0, 0, 255   (mělo být čistě modrá)
   
   Pokud ne, channels jsou špatně namapované
   ```

3. **Zkontroluj fixture mode:**
   ```
   RGB vs RGBW mode v fixture
   Musí odpovídat typu v aplikaci
   ```

## ⚡ Výkon a rychlost

### Problém: Aplikace je pomalá

**Symptomy:**
- Dlouhé načítání
- Laggy slidery
- Zpoždění UI

**Diagnostika:**

Otevři DevTools (F12):
```
Performance tab → Nahraj session
Hledej dlouhé tasks (> 50ms)
```

**Řešení:**

1. **Omez počet fixtures:**
   ```
   Doporučeno:
   - Mobil: < 40 fixtures
   - Tablet: < 60 fixtures
   - Desktop: unlimited
   ```

2. **Vypni nepoužívané efekty:**
   ```
   Běžící efekty používají CPU
   Effects view → Vypni všechny
   ```

3. **Restart aplikaci:**
   ```
   Zavři a otevři znovu
   Vymaže memory leaks
   ```

4. **Vymaž stará data:**
   ```
   Setup → Smaž nepoužívané:
   - Fixtures
   - Scenes
   - Effects
   ```

5. **Update prohlížeč:**
   ```
   Chrome/Edge na nejnovější verzi
   Starší verze mohou být pomalejší
   ```

### Problém: Efekty nejsou plynulé

**Příčiny:**
- Nízký send rate
- Slabý WiFi
- CPU overload
- Příliš mnoho fixtures v efektu

**Řešení:**

1. **Zvyš send rate:**
   ```
   Connection → Send Rate: 44 Hz
   Vyšší = plynulejší (ale více bandwidth)
   ```

2. **Sniž effect speed:**
   ```
   Pomalejší efekty = méně updates
   Vypadá plynuleji
   ```

3. **Omez fixtures v efektu:**
   ```
   Chase efekt na 50 fixtures = laggy
   Rozdel do 2 efektů po 25 fixtures
   ```

4. **Použij jednodušší efekty:**
   ```
   Rainbow effect je CPU intensive
   Chase effect je lehký
   ```

## 💾 Data a ukládání

### Problém: Data se ztratila

**Kde se data ukládají:**
```
Browser → IndexedDB → "spark-kv" database
Samostatné pro každý prohlížeč
```

**Možné příčiny:**
- Vymazaná cache browseru
- Browser reinstalace
- Přechod na jiný browser
- Storage quota exceeded

**Prevention:**

⚠️ **DŮLEŽITÉ:**
```
"Clear browsing data" → NEMAZAT "Site data"!
Pouze "Cached images and files" je safe
```

**Budoucnost:** Export/import bude v V1.2

### Problém: "Quota exceeded" error

**Příčina:**
Browser má limit storage (obvykle 50-100MB).

**Řešení:**

1. **Zkontroluj usage:**
   ```javascript
   // V console (F12)
   navigator.storage.estimate().then(console.log)
   ```

2. **Vymaž stará data:**
   - Smaž nepoužívané fixtures
   - Smaž staré scenes
   - Smaž staré effects

3. **Request více storage:**
   ```javascript
   // V console (F12)
   navigator.storage.persist().then(console.log)
   ```

## 🎬 Efekty a scény

### Problém: Scéna se neaplikuje správně

**Diagnostika:**

```
✓ Je scéna uložená? (zkontroluj v Scenes)
✓ Obsahuje fixtures které existují?
✓ Jsou fixtures připojené?
```

**Řešení:**

1. **Znovu ulož scénu:**
   ```
   Nastav světla
   Save Scene → Overwrite existující
   ```

2. **Zkontroluj deleted fixtures:**
   ```
   Scéna obsahuje fixtures které už neexistují?
   Smaž a vytvoř znovu
   ```

### Problém: Effect se nespustí

**Checklist:**

```
✓ Je vybraný nějaký fixture?
✓ Fixtures existují?
✓ Effect speed > 0?
✓ Je připojení aktivní?
```

**Řešení:**

1. **Zkontroluj fixture selection:**
   ```
   Effect edit → Fixtures list
   Musí být minimálně 1 zaškrtnutý
   ```

2. **Restart effect:**
   ```
   Stop → Wait 2 sec → Start
   ```

3. **Smaž a vytvoř znovu:**
   ```
   Někdy se corrupted state
   Delete effect → Create new
   ```

## 🌐 Browser problémy

### Chrome

**"Site can't be reached"**
- Zkontroluj internet
- Zkus v incognito mode
- Disable extensions

**Slow performance**
- Vymaž cache (ne site data!)
- Disable heavy extensions
- Update Chrome

### Safari (iOS)

**PWA features limited**
- Safari má horší PWA support
- Některé funkce nemusí fungovat
- Preferuj Chrome na iOS pokud možné

**Refresh issues**
- Pull-to-refresh disabled
- Ruční refresh: Close a znovu otevři

### Firefox

**Partial PWA support**
- Firefox nepodporuje instalaci
- Můžeš použít jako web app
- Některé PWA features chybí

## 🆘 Stále nefunguje?

### Získej help

1. **GitHub Issues:**
   ```
   https://github.com/atrep123/dmx-512-controller/issues
   
   Include:
   - Device (Samsung S21, iPhone 13, etc.)
   - OS (Android 13, iOS 17, etc.)
   - Browser (Chrome 119, Safari 17, etc.)
   - Steps to reproduce
   - Screenshots
   - Console errors (F12 → Console)
   ```

2. **GitHub Discussions:**
   ```
   Pro obecné otázky a pomoc komunity
   https://github.com/atrep123/dmx-512-controller/discussions
   ```

3. **Console errors:**
   ```
   F12 → Console tab
   Screenshot errors (červeně)
   Include v issue reportu
   ```

### Debug mode

Pro detailní diagnostiku:
```javascript
// V console (F12)
localStorage.setItem('debug', 'true')
// Refresh page
// Vidíš debug logs v console
```

---

**Troubleshooting Guide pro DMX 512 Kontrolér**  
Poslední aktualizace: 2024-11-01  
Nenašli jste řešení? [Vytvořte issue!](https://github.com/atrep123/dmx-512-controller/issues/new?template=bug_report.yml)
