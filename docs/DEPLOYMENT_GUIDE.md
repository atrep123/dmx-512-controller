# DMX 512 Kontroler - Kompletni pruvodce nasazenim pro Android

##  Prehled

Aplikace DMX 512 Kontroler je nyni pripravena jako Progressive Web App (PWA) pro Android. Tento dokument obsahuje vse, co potrebujete k nasazeni aplikace.

## [x] Co je hotove

### 1. PWA Konfigurace
- [x] `manifest.json` - kompletni PWA manifest s ceskymi texty
- [x] `browserconfig.xml` - konfigurace pro Windows/Edge
- [x] Service Worker (`public/sw.js`) - offline podpora
- [x] PWA install script (`public/pwa-install.js`)
- [x] HTML meta tagy pro Android/iOS
- [x] SVG ikona aplikace (`public/icon.svg`)

### 2. UI Komponenty
- [x] `PWAInstallPrompt.tsx` - instalacni prompt v aplikaci
- [x] Integrace promptu do hlavni aplikace
- [x] Responsivni design pro mobilni zarizeni

### 3. Dokumentace
- [x] `ANDROID_SETUP.md` - kompletni navod pro Android
- [x] `ICONS_README.md` - pruvodce tvorbou ikon
- [x] Tento soubor - deployment guide

## Rocket Jak nasadit aplikaci

### Krok 1: Hosting (POVINNE)

PWA vyzaduje HTTPS. Nahrajte aplikaci na:

**Moznost A: Vercel (Doporuceno)**
```bash
# Instalace Vercel CLI
npm install -g vercel

# Nasazeni
vercel

# Produkcni nasazeni
vercel --prod
```

**Moznost B: Netlify**
```bash
# Instalace Netlify CLI
npm install -g netlify-cli

# Nasazeni
netlify deploy

# Produkcni nasazeni
netlify deploy --prod
```

**Moznost C: GitHub Pages**
1. Push kodu na GitHub
2. Jdete do Settings  Pages
3. Vyberte branch `main` a slozku `/root`
4. GitHub automaticky vytvori HTTPS URL

**Moznost D: Docker Compose (UI + server)**
```bash
cd infra
docker compose up --build
```
- `ui` publikuje build na portu `5173`
- `server` nasloucha na `8080` (REST + WS)
- `broker` poskytuje MQTT pro DMX zarizeni
- `infra/Caddyfile` preposila `/rgb*`, `/metrics`, aj. na `server:8080` a `/ws` s korektnimi `Upgrade/Connection` hlavickami.
- Frontend pouziva relativni `VITE_WS_URL=/ws`, takze UI i backend bezi pod jednim originem.

### Krok 2: Build aplikace

```bash
# Instalace zavislosti (pokud jeste neni)
npm ci

# Build pro produkci
npm run build

# Vysledek je ve slozce `dist/`
```

### Krok 3: Testovani PWA

Po nasazeni otevrete aplikaci v Chrome na Android a zkontrolujte:

1. **Manifest**
   - DevTools  Application  Manifest
   - Vsechna pole by mela byt vyplnena

2. **Service Worker**
   - DevTools  Application  Service Workers
   - Status: "activated and running"

3. **Lighthouse Audit**
   - DevTools  Lighthouse
   - Spustte PWA audit
   - Cilove skore: 90+

### Krok 4: Instalace na Android

**Pro koncove uzivatele:**
1. Otevrete aplikaci v Chrome
2. Mel by se objevit instalacni prompt (nebo kliknete na tlacitko "Instalovat")
3. Pripadne: Chrome menu ()  "Pridat na plochu"

##  Vytvoreni ikon (Dulezite!)

Aplikace momentalne pouziva SVG ikonu jako placeholder. Pro produkcni pouziti vytvorte PNG ikony:

### Online nastroje (Nejjednodussi)
1. Jdete na [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
2. Nahrajte 512x512 zdrojovou ikonu
3. Stahnete vsechny vygenerovane ikony
4. Zkopirujte je do slozky `public/`
5. Aktualizujte `manifest.json` odkazy na PNG misto SVG

### Doporuceny design ikony
- **Pozadi**: Tmave sede (#262626)
- **Hlavni barva**: Modra (#5B9FD8) - svetelne paprsky
- **Akcentova barva**: Ruzova (#C97FB8) - svetla/kontroly
- **Motiv**: DMX konektor, svetelne paprsky, nebo kontrolni panel

Vice detailu v `ICONS_README.md`.

## Clipboard Kontrolni seznam pred spustenim

- [ ] Aplikace bezi na HTTPS
- [ ] Build byl uspesny (`npm run build`)
- [ ] Manifest.json je dostupny na `/manifest.json`
- [ ] Service Worker se registruje bez chyb
- [ ] Ikony jsou vytvorene a nahrane (nebo SVG funguje)
- [ ] PWA instalace funguje na Android Chrome
- [ ] Aplikace funguje offline
- [ ] Lighthouse PWA skore je 90+

##  Pokrocile moznosti

### Publikace do Google Play Store

Pro distribuci pres Google Play pouzijte **TWA (Trusted Web Activity)**:

1. **Instalace Bubblewrap**
   ```bash
   npm i -g @bubblewrap/cli
   ```

2. **Inicializace TWA**
   ```bash
   bubblewrap init --manifest https://vase-domena.com/manifest.json
   ```

3. **Build APK**
   ```bash
   bubblewrap build
   ```

4. **Nahrani do Play Store**
   - Vytvorte ucet Google Play Developer ($25 jednorazovy poplatek)
   - Vyplnte metadata aplikace
   - Nahrajte APK/AAB soubor
   - Projdete review procesem

Vice na [Bubblewrap dokumentaci](https://github.com/GoogleChromeLabs/bubblewrap).

### Vlastni domena

Pro profesionalni vzhled doporucujeme vlastni domenu:

1. Zakupte domenu (napr. GoDaddy, Namecheap)
2. Nastavte DNS na vas hosting provider
3. Aktualizujte `start_url` v `manifest.json`
4. SSL certifikat je obvykle zdarma (Let's Encrypt)

## Bug Reseni problemu

### PWA se neinstaluje
**Pricina**: Chybejici HTTPS nebo nevalidni manifest
**Reseni**:
- Zkontrolujte, ze URL zacina `https://`
- Otevrete DevTools  Console a hledejte chyby
- Validujte manifest na [Web Manifest Validator](https://manifest-validator.appspot.com/)

### Service Worker nefunguje
**Pricina**: Chyba v registraci nebo cache
**Reseni**:
```javascript
// Odregistrujte vsechny service workery
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister())
})
```
Pak obnovte stranku.

### Aplikace nezobrazuje offline data
**Pricina**: IndexedDB neni naplnena nebo vypnuta
**Reseni**:
- Zkontrolujte DevTools  Application  Storage  IndexedDB
- Data by mela byt pod `spark-kv`
- Zkuste pridat nejaka data online a pak prejdete offline

### Ikona vypada spatne na Android 8+
**Pricina**: Chybejici maskable ikony
**Reseni**:
- Vytvorte maskable verze ikon se safe zonou
- Pouzijte [Maskable.app Editor](https://maskable.app/editor)
- Aktualizujte manifest s `"purpose": "maskable"`

##  Metriky uspechu

Po spusteni sledujte:

1. **Instalacni mira**
   - Kolik uzivatelu nainstaluje PWA vs. jen prohlizi web
   - Cil: 20-30% navstevniku

2. **Engagement**
   - Doba stravena v aplikaci
   - Frekvence pouzivani
   - Navratnost uzivatelu

3. **Vykon**
   - Lighthouse skore: Performance, PWA, Accessibility
   - Cil: Vsechny kategorie 90+

4. **Retention**
   - 7-denni retention rate
   - 30-denni retention rate

##  Bezpecnost

### HTTPS
- **POVINNE** pro PWA
- Vetsina hostingu poskytuje SSL zdarma
- Never hostovat na HTTP

### Content Security Policy
Pridejte do `index.html` pro lepsi bezpecnost:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline' fonts.googleapis.com;
               font-src 'self' fonts.gstatic.com;">
```

### Data Privacy
- Vsechna data jsou ulozena lokalne v prohlizeci
- Zadna data nejsou posilana na server
- Uzivatele mohou smazat data pres browser settings

##  Testovani na realnych zarizenich

Doporucena zarizeni pro testovani:
- **Budget**: Xiaomi Redmi Note (Android 11)
- **Mid-range**: Samsung Galaxy A-series (Android 12)
- **Flagship**: Samsung Galaxy S (Android 13+)
- **Google**: Pixel 6/7 (cisty Android)

Test matrix:
- [x] Chrome 100+
- [x] Samsung Internet
- [x] Edge mobile
-  Firefox (castecna PWA podpora)

##  Gratulujeme!

Vase aplikace je pripravena pro Android! Po dokonceni vyse uvedenych kroku budou uzivatele moci:

1. Instalovat aplikaci na domovskou obrazovku
2. Pouzivat ji offline
3. Ziskat native-like zazitek
4. Rychly pristup pres app shortcuts

Pro dalsi pomoc se podivejte na:
- `ANDROID_SETUP.md` - technicke detaily
- `ICONS_README.md` - tvorba ikon
- [PWA dokumentace](https://web.dev/progressive-web-apps/)

---

**Vytvoreno pro DMX 512 Kontroler**  
Verze: 1.0  
Datum: 2024
