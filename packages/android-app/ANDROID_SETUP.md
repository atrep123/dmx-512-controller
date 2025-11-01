# DMX 512 Kontrolér - Android PWA Instalace

## Přehled
DMX 512 Kontrolér je Progressive Web App (PWA) optimalizovaná pro Android zařízení. Aplikace může běžet jako nativní aplikace po instalaci.

## Požadavky na Android
- **Minimální verze**: Android 5.0 (Lollipop) nebo vyšší
- **Doporučená verze**: Android 8.0 (Oreo) nebo vyšší
- **Prohlížeč**: Chrome 80+ nebo Edge 80+
- **Paměť**: Minimálně 2GB RAM
- **Rozlišení**: 360x640 nebo vyšší

## Instalace na Android

### Metoda 1: Přes Chrome
1. Otevřete aplikaci v Chrome prohlížeči
2. Klikněte na menu (⋮) v pravém horním rohu
3. Vyberte "Přidat na plochu" nebo "Nainstalovat aplikaci"
4. Potvrďte instalaci
5. Ikona aplikace se objeví na domovské obrazovce

### Metoda 2: Přes in-app banner
1. Otevřete aplikaci ve webovém prohlížeči
2. Počkejte na automatický instalační prompt
3. Klikněte na "Přidat" nebo "Instalovat"
4. Aplikace bude přidána na domovskou obrazovku

### Metoda 3: Sdílení
1. Otevřete aplikaci v prohlížeči
2. Klikněte na tlačítko "Sdílet"
3. Vyberte "Přidat na plochu"

## Funkce PWA

### Offline podpora
- Service Worker zajišťuje základní funkcionalitu offline
- Data jsou ukládána lokálně pomocě IndexedDB
- Automatická synchronizace při obnovení připojení

### Instalace ikon
Aplikace obsahuje kompletní sadu ikon pro Android:
- 72x72 (ldpi)
- 96x96 (mdpi)
- 128x128 (hdpi)
- 144x144 (xhdpi)
- 152x152 (xxhdpi)
- 192x192 (xxxhdpi)
- 384x384 (4x)
- 512x512 (maximální)

### Maskable Icons
Speciální ikony pro Android adaptivní ikony s ochrannou zónou

### App Shortcuts
Rychlé zkratky z dlouhého držení ikony:
- Živá Kontrola
- Scény

## Optimalizace pro mobilní zařízení

### Dotykové ovládání
- Velké dotykové oblasti (min. 44x44px)
- Gesture podpora pro joysticky
- Pull-to-refresh zakázán pro lepší UX

### Responzivní design
- Mobile-first přístup
- Optimalizované layouty pro malé obrazovky
- Dynamické font velikosti

### Výkon
- Lazy loading komponent
- Optimalizované animace (60fps)
- Minimální velikost bundle

## Testování PWA

### Kontrolní seznam
- [ ] Manifest.json je validní
- [ ] Service Worker se registruje správně
- [ ] HTTPS je povoleno (povinné pro PWA)
- [ ] Všechny ikony jsou dostupné
- [ ] Aplikace je použitelná offline
- [ ] Meta tagy jsou správně nastavené

### Lighthouse Audit
Spusťte v Chrome DevTools:
1. Otevřete DevTools (F12)
2. Přejděte na záložku "Lighthouse"
3. Vyberte "Progressive Web App"
4. Klikněte na "Generate report"
5. Cílové skóre: 90+

## Známé problémy a řešení

### PWA se neinstaluje
**Problém**: Tlačítko instalace se nezobrazuje
**Řešení**:
- Zkontrolujte, že stránka běží na HTTPS
- Ověřte, že manifest.json je přístupný
- Zkontrolujte konzoli pro chyby Service Workeru

### Aplikace nefunguje offline
**Problém**: Aplikace vyžaduje připojení
**Řešení**:
- Zkontrolujte, že Service Worker je aktivní (chrome://serviceworker-internals)
- Vymažte cache a znovu načtěte
- Ověřte, že potřebné soubory jsou v cache

### Ikona se nezobrazuje správně
**Problém**: Ikona je oříznutá nebo rozmazaná
**Řešení**:
- Použijte maskable ikony pro Android 8+
- Ověřte rozměry ikon (musí být přesné)
- Vymažte cache aplikace v nastavení Android

## Distribuce

### Možnosti distribuce
1. **Hosting na webu**: Nejjednodušší, uživatelé instalují přes prohlížeč
2. **TWA (Trusted Web Activity)**: Publikace v Google Play Store
3. **PWABuilder**: Generování Android APK z PWA

### TWA (Trusted Web Activity)
Pro publikaci v Google Play Store:
1. Použijte [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap)
2. Nakonfigurujte Digital Asset Links
3. Vytvořte podpisový klíč
4. Buildujte APK/AAB
5. Nahrajte do Google Play Console

## Údržba

### Aktualizace aplikace
- Service Worker automaticky kontroluje aktualizace
- Nová verze se stáhne na pozadí
- Při příštím spuštění se použije nová verze

### Cache management
```javascript
// Vymazání cache
caches.delete('dmx-512-v1')

// Seznam všech caches
caches.keys().then(console.log)
```

## Podpora

### Kompatibilita prohlížečů (Android)
- ✅ Chrome 80+
- ✅ Edge 80+
- ✅ Samsung Internet 12+
- ⚠️ Firefox 85+ (částečná podpora)
- ❌ Opera Mini (nepodporováno)

### Testované zařízení
- Samsung Galaxy S10+
- Google Pixel 5
- OnePlus 9 Pro
- Xiaomi Redmi Note 10

## Další zdroje
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Android PWA Guide](https://developer.android.com/guide/webapps/pwa)
- [Manifest Generator](https://www.simicart.com/manifest-generator.html/)
- [Icon Generator](https://www.pwabuilder.com/)
