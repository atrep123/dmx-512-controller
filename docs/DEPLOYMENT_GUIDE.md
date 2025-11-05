# DMX 512 Kontrolér - Kompletní průvodce nasazením pro Android

## 📱 Přehled

Aplikace DMX 512 Kontrolér je nyní připravena jako Progressive Web App (PWA) pro Android. Tento dokument obsahuje vše, co potřebujete k nasazení aplikace.

## ✅ Co je hotové

### 1. PWA Konfigurace
- ✅ `manifest.json` - kompletní PWA manifest s českými texty
- ✅ `browserconfig.xml` - konfigurace pro Windows/Edge
- ✅ Service Worker (`public/sw.js`) - offline podpora
- ✅ PWA install script (`public/pwa-install.js`)
- ✅ HTML meta tagy pro Android/iOS
- ✅ SVG ikona aplikace (`public/icon.svg`)

### 2. UI Komponenty
- ✅ `PWAInstallPrompt.tsx` - instalační prompt v aplikaci
- ✅ Integrace promptu do hlavní aplikace
- ✅ Responsivní design pro mobilní zařízení

### 3. Dokumentace
- ✅ `ANDROID_SETUP.md` - kompletní návod pro Android
- ✅ `ICONS_README.md` - průvodce tvorbou ikon
- ✅ Tento soubor - deployment guide

## 🚀 Jak nasadit aplikaci

### Krok 1: Hosting (POVINNÉ)

PWA vyžaduje HTTPS. Nahrajte aplikaci na:

**Možnost A: Vercel (Doporučeno)**
```bash
# Instalace Vercel CLI
npm install -g vercel

# Nasazení
vercel

# Produkční nasazení
vercel --prod
```

**Možnost B: Netlify**
```bash
# Instalace Netlify CLI
npm install -g netlify-cli

# Nasazení
netlify deploy

# Produkční nasazení
netlify deploy --prod
```

**Možnost C: GitHub Pages**
1. Push kódu na GitHub
2. Jděte do Settings → Pages
3. Vyberte branch `main` a složku `/root`
4. GitHub automaticky vytvoří HTTPS URL

**Možnost D: Docker Compose (UI + server)**
```bash
cd infra
docker-compose up --build
```
- `ui` publikuje build na portu `5173`
- `server` naslouchá na `8080` (REST + WS)
- `broker` poskytuje MQTT pro DMX zařízení
- `infra/Caddyfile` přeposílá `/rgb*`, `/metrics`, aj. na `server:8080` a `/ws` s korektními `Upgrade/Connection` hlavičkami.
- Frontend používá relativní `VITE_WS_URL=/ws`, takže UI i backend běží pod jedním originem.

### Krok 2: Build aplikace

```bash
# Instalace závislostí (pokud ještě není)
npm ci

# Build pro produkci
npm run build

# Výsledek je ve složce `dist/`
```

### Krok 3: Testování PWA

Po nasazení otevřete aplikaci v Chrome na Android a zkontrolujte:

1. **Manifest**
   - DevTools → Application → Manifest
   - Všechna pole by měla být vyplněná

2. **Service Worker**
   - DevTools → Application → Service Workers
   - Status: "activated and running"

3. **Lighthouse Audit**
   - DevTools → Lighthouse
   - Spusťte PWA audit
   - Cílové skóre: 90+

### Krok 4: Instalace na Android

**Pro koncové uživatele:**
1. Otevřete aplikaci v Chrome
2. Měl by se objevit instalační prompt (nebo klikněte na tlačítko "Instalovat")
3. Případně: Chrome menu (⋮) → "Přidat na plochu"

## 🎨 Vytvoření ikon (Důležité!)

Aplikace momentálně používá SVG ikonu jako placeholder. Pro produkční použití vytvořte PNG ikony:

### Online nástroje (Nejjednodušší)
1. Jděte na [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
2. Nahrajte 512x512 zdrojovou ikonu
3. Stáhněte všechny vygenerované ikony
4. Zkopírujte je do složky `public/`
5. Aktualizujte `manifest.json` odkazy na PNG místo SVG

### Doporučený design ikony
- **Pozadí**: Tmavě šedé (#262626)
- **Hlavní barva**: Modrá (#5B9FD8) - světelné paprsky
- **Akcentová barva**: Růžová (#C97FB8) - světla/kontroly
- **Motiv**: DMX konektor, světelné paprsky, nebo kontrolní panel

Více detailů v `ICONS_README.md`.

## 📋 Kontrolní seznam před spuštěním

- [ ] Aplikace běží na HTTPS
- [ ] Build byl úspěšný (`npm run build`)
- [ ] Manifest.json je dostupný na `/manifest.json`
- [ ] Service Worker se registruje bez chyb
- [ ] Ikony jsou vytvořené a nahrané (nebo SVG funguje)
- [ ] PWA instalace funguje na Android Chrome
- [ ] Aplikace funguje offline
- [ ] Lighthouse PWA skóre je 90+

## 🔧 Pokročilé možnosti

### Publikace do Google Play Store

Pro distribuci přes Google Play použijte **TWA (Trusted Web Activity)**:

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

4. **Nahrání do Play Store**
   - Vytvořte účet Google Play Developer ($25 jednorázový poplatek)
   - Vyplňte metadata aplikace
   - Nahrajte APK/AAB soubor
   - Projděte review procesem

Více na [Bubblewrap dokumentaci](https://github.com/GoogleChromeLabs/bubblewrap).

### Vlastní doména

Pro profesionální vzhled doporučujeme vlastní doménu:

1. Zakupte doménu (např. GoDaddy, Namecheap)
2. Nastavte DNS na váš hosting provider
3. Aktualizujte `start_url` v `manifest.json`
4. SSL certifikát je obvykle zdarma (Let's Encrypt)

## 🐛 Řešení problémů

### PWA se neinstaluje
**Příčina**: Chybějící HTTPS nebo nevalidní manifest
**Řešení**:
- Zkontrolujte, že URL začína `https://`
- Otevřete DevTools → Console a hledejte chyby
- Validujte manifest na [Web Manifest Validator](https://manifest-validator.appspot.com/)

### Service Worker nefunguje
**Příčina**: Chyba v registraci nebo cache
**Řešení**:
```javascript
// Odregistrujte všechny service workery
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister())
})
```
Pak obnovte stránku.

### Aplikace nezobrazuje offline data
**Příčina**: IndexedDB není naplněna nebo vypnutá
**Řešení**:
- Zkontrolujte DevTools → Application → Storage → IndexedDB
- Data by měla být pod `spark-kv`
- Zkuste přidat nějaká data online a pak přejděte offline

### Ikona vypadá špatně na Android 8+
**Příčina**: Chybějící maskable ikony
**Řešení**:
- Vytvořte maskable verze ikon se safe zonou
- Použijte [Maskable.app Editor](https://maskable.app/editor)
- Aktualizujte manifest s `"purpose": "maskable"`

## 📊 Metriky úspěchu

Po spuštění sledujte:

1. **Instalační míra**
   - Kolik uživatelů nainstaluje PWA vs. jen prohlíží web
   - Cíl: 20-30% návštěvníků

2. **Engagement**
   - Doba strávená v aplikaci
   - Frekvence používání
   - Návratnost uživatelů

3. **Výkon**
   - Lighthouse skóre: Performance, PWA, Accessibility
   - Cíl: Všechny kategorie 90+

4. **Retention**
   - 7-denní retention rate
   - 30-denní retention rate

## 🔐 Bezpečnost

### HTTPS
- **POVINNÉ** pro PWA
- Většina hostingů poskytuje SSL zdarma
- Never hostovat na HTTP

### Content Security Policy
Přidejte do `index.html` pro lepší bezpečnost:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline' fonts.googleapis.com;
               font-src 'self' fonts.gstatic.com;">
```

### Data Privacy
- Všechna data jsou uložená lokálně v prohlížeči
- Žádná data nejsou posílána na server
- Uživatelé mohou smazat data přes browser settings

## 📱 Testování na reálných zařízeních

Doporučená zařízení pro testování:
- **Budget**: Xiaomi Redmi Note (Android 11)
- **Mid-range**: Samsung Galaxy A-series (Android 12)
- **Flagship**: Samsung Galaxy S (Android 13+)
- **Google**: Pixel 6/7 (čistý Android)

Test matrix:
- ✅ Chrome 100+
- ✅ Samsung Internet
- ✅ Edge mobile
- ⚠️ Firefox (částečná PWA podpora)

## 🎉 Gratulujeme!

Vaše aplikace je připravená pro Android! Po dokončení výše uvedených kroků budou uživatelé moci:

1. Instalovat aplikaci na domovskou obrazovku
2. Používat ji offline
3. Získat native-like zážitek
4. Rychlý přístup přes app shortcuts

Pro další pomoc se podívejte na:
- `ANDROID_SETUP.md` - technické detaily
- `ICONS_README.md` - tvorba ikon
- [PWA dokumentace](https://web.dev/progressive-web-apps/)

---

**Vytvořeno pro DMX 512 Kontrolér**  
Verze: 1.0  
Datum: 2024
