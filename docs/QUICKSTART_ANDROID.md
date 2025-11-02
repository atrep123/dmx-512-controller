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

## 🎨 TODO před spuštěním

- [ ] Vytvořit PNG ikony (nebo nechat SVG)
- [ ] Nasadit na HTTPS hosting
- [ ] Otestovat na reálném Android zařízení

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
