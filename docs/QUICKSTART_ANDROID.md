# 📱 Rychlý start - Android PWA

## ⚡ TL;DR

DMX 512 Kontrolér je nyní připravený jako Android PWA aplikace!

## ✅ Co funguje hned teď

1. **PWA instalace** - Uživatelé mohou přidat app na plochu
2. **Offline režim** - Základní funkcionalita i bez internetu
3. **Native feel** - Fullscreen režim, smooth animace
4. **Auto-sync** - Data se ukládají lokálně automaticky

## 🚀 Nasazení za 5 minut

```bash
# 1. Build
npm run build

# 2. Deploy (Vercel)
npx vercel --prod

# 3. Hotovo! ✨
```

## 📱 Instalace na Android

**Uživatelé:**
1. Otevři v Chrome
2. Klikni na tlačítko "Instalovat" v aplikaci
3. Nebo: Chrome menu (⋮) → "Přidat na plochu"

## ✅ TODO před spuštěním

- [x] Vytvořit PNG ikony (viz `npm run pwa:icons`, výstup v `public/icons/*`)
- [x] Nasadit na HTTPS hosting (GitHub Pages workflow `Deploy PWA`)
- [x] Otestovat na reálném Android zařízení (Chrome DevTools + remote debugging)

### Ikony

1. `npm run pwa:icons` vygeneruje 192/256/384/512/1024 PNG ikony (maskable i klasické).
2. Manifest (`manifest.json`) už tyto PNG používá – při úpravě SVG spusť skript znovu.

### HTTPS hosting

- `.github/workflows/pwa-pages.yml` buildí `npm run build` s `PUBLIC_URL="/<repo>/"` a publikuje do GitHub Pages (HTTPS).
- První nasazení: Settings → Pages → GitHub Actions. Výsledná URL: `https://<org>.github.io/<repo>/`.
- Pro custom doménu přidej CNAME v repu + DNS záznamy.

### Testování na zařízení

1. `npm run build && npm run preview -- --host` spustí lokální server.
2. Připoj Android přes USB, povol USB debugging, v Chrome Desktop otevři `chrome://inspect` a klikni na stránku.
3. V telefonu otevři lokální URL, nainstaluj PWA banner, přepni do offline režimu a ověř, že UI funguje.
4. Pro rychlý audit bez zařízení spusť Lighthouse (Device: Pixel 7) a přilož report do `docs/reports/android/`.

## 📖 Detailní dokumentace

- `DEPLOYMENT_GUIDE.md` - Kompletní průvodce
- `ANDROID_SETUP.md` - Android specifika
- `ICONS_README.md` - Jak vytvořit ikony

## 🔧 Soubory PWA

```
/public
  ├── sw.js                 # Service Worker (offline)
  ├── pwa-install.js        # Install handler
  └── icon.svg              # Ikona aplikace

/manifest.json              # PWA manifest
/browserconfig.xml          # Windows/Edge config
/index.html                 # Meta tagy pro mobile

/src/components
  └── PWAInstallPrompt.tsx  # In-app install prompt
```

## 💡 Tipy

**Pro testování:**
- Chrome DevTools → Lighthouse → PWA Audit
- Nebo: Chrome DevTools → Application → Manifest

**Pro deployment:**
- Vercel/Netlify = nejjednodušší (auto HTTPS)
- GitHub Pages = zdarma (auto HTTPS)
- Vlastní server = potřeba SSL certifikát

**Pro Google Play:**
- Použij Bubblewrap pro TWA
- Detail v `DEPLOYMENT_GUIDE.md`

## ⚠️ Důležité

1. **HTTPS je POVINNÉ** - PWA nefunguje na HTTP
2. **Ikony** - SVG funguje, ale PNG jsou lepší
3. **Testuj** - Na reálném Android zařízení před spuštěním

## 🎉 Výsledek

Po instalaci uživatelé dostanou:
- ✅ Ikonu na domovské obrazovce
- ✅ Fullscreen aplikaci bez browser UI
- ✅ Rychlý start (cached)
- ✅ Offline přístup k datům
- ✅ App shortcuts (dlouhé držení ikony)

---

**Další kroky:** Viz `DEPLOYMENT_GUIDE.md` 📖
