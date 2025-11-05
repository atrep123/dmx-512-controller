#  Rychly start - Android PWA

##  TL;DR

DMX 512 Kontroler je nyni pripraveny jako Android PWA aplikace!

## [x] Co funguje hned ted

1. **PWA instalace** - Uzivatele mohou pridat app na plochu
2. **Offline rezim** - Zakladni funkcionalita i bez internetu
3. **Native feel** - Fullscreen rezim, smooth animace
4. **Auto-sync** - Data se ukladaji lokalne automaticky

## Rocket Nasazeni za 5 minut

```bash
# 1. Build
npm run build

# 2. Deploy (Vercel)
npx vercel --prod

# 3. Hotovo! *
```

##  Instalace na Android

**Uzivatele:**
1. Otevri v Chrome
2. Klikni na tlacitko "Instalovat" v aplikaci
3. Nebo: Chrome menu ()  "Pridat na plochu"

##  TODO pred spustenim

- [ ] Vytvorit PNG ikony (nebo nechat SVG)
- [ ] Nasadit na HTTPS hosting
- [ ] Otestovat na realnem Android zarizeni

## Book Detailni dokumentace

- `DEPLOYMENT_GUIDE.md` - Kompletni pruvodce
- `ANDROID_SETUP.md` - Android specifika
- `ICONS_README.md` - Jak vytvorit ikony

##  Soubory PWA

```
/public
   sw.js                 # Service Worker (offline)
   pwa-install.js        # Install handler
   icon.svg              # Ikona aplikace

/manifest.json              # PWA manifest
/browserconfig.xml          # Windows/Edge config
/index.html                 # Meta tagy pro mobile

/src/components
   PWAInstallPrompt.tsx  # In-app install prompt
```

##  Tipy

**Pro testovani:**
- Chrome DevTools  Lighthouse  PWA Audit
- Nebo: Chrome DevTools  Application  Manifest

**Pro deployment:**
- Vercel/Netlify = nejjednodussi (auto HTTPS)
- GitHub Pages = zdarma (auto HTTPS)
- Vlastni server = potreba SSL certifikat

**Pro Google Play:**
- Pouzij Bubblewrap pro TWA
- Detail v `DEPLOYMENT_GUIDE.md`

##  Dulezite

1. **HTTPS je POVINNE** - PWA nefunguje na HTTP
2. **Ikony** - SVG funguje, ale PNG jsou lepsi
3. **Testuj** - Na realnem Android zarizeni pred spustenim

##  Vysledek

Po instalaci uzivatele dostanou:
- [x] Ikonu na domovske obrazovce
- [x] Fullscreen aplikaci bez browser UI
- [x] Rychly start (cached)
- [x] Offline pristup k datum
- [x] App shortcuts (dlouhe drzeni ikony)

---

**Dalsi kroky:** Viz `DEPLOYMENT_GUIDE.md` Book
