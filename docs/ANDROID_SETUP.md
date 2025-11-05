# DMX 512 Kontroler - Android PWA Instalace

## Prehled
DMX 512 Kontroler je Progressive Web App (PWA) optimalizovana pro Android zarizeni. Aplikace muze bezet jako nativni aplikace po instalaci.

## Pozadavky na Android
- **Minimalni verze**: Android 5.0 (Lollipop) nebo vyssi
- **Doporucena verze**: Android 8.0 (Oreo) nebo vyssi
- **Prohlizec**: Chrome 80+ nebo Edge 80+
- **Pamet**: Minimalne 2GB RAM
- **Rozliseni**: 360x640 nebo vyssi

## Instalace na Android

### Metoda 1: Pres Chrome
1. Otevrete aplikaci v Chrome prohlizeci
2. Kliknete na menu () v pravem hornim rohu
3. Vyberte "Pridat na plochu" nebo "Nainstalovat aplikaci"
4. Potvrdte instalaci
5. Ikona aplikace se objevi na domovske obrazovce

### Metoda 2: Pres in-app banner
1. Otevrete aplikaci ve webovem prohlizeci
2. Pockejte na automaticky instalacni prompt
3. Kliknete na "Pridat" nebo "Instalovat"
4. Aplikace bude pridana na domovskou obrazovku

### Metoda 3: Sdileni
1. Otevrete aplikaci v prohlizeci
2. Kliknete na tlacitko "Sdilet"
3. Vyberte "Pridat na plochu"

## Funkce PWA

### Offline podpora
- Service Worker zajistuje zakladni funkcionalitu offline
- Data jsou ukladana lokalne pomoce IndexedDB
- Automaticka synchronizace pri obnoveni pripojeni

### Instalace ikon
Aplikace obsahuje kompletni sadu ikon pro Android:
- 72x72 (ldpi)
- 96x96 (mdpi)
- 128x128 (hdpi)
- 144x144 (xhdpi)
- 152x152 (xxhdpi)
- 192x192 (xxxhdpi)
- 384x384 (4x)
- 512x512 (maximalni)

### Maskable Icons
Specialni ikony pro Android adaptivni ikony s ochrannou zonou

### App Shortcuts
Rychle zkratky z dlouheho drzeni ikony:
- Ziva Kontrola
- Sceny

## Optimalizace pro mobilni zarizeni

### Dotykove ovladani
- Velke dotykove oblasti (min. 44x44px)
- Gesture podpora pro joysticky
- Pull-to-refresh zakazan pro lepsi UX

### Responzivni design
- Mobile-first pristup
- Optimalizovane layouty pro male obrazovky
- Dynamicke font velikosti

### Vykon
- Lazy loading komponent
- Optimalizovane animace (60fps)
- Minimalni velikost bundle

## Testovani PWA

### Kontrolni seznam
- [ ] Manifest.json je validni
- [ ] Service Worker se registruje spravne
- [ ] HTTPS je povoleno (povinne pro PWA)
- [ ] Vsechny ikony jsou dostupne
- [ ] Aplikace je pouzitelna offline
- [ ] Meta tagy jsou spravne nastavene

### Lighthouse Audit
Spustte v Chrome DevTools:
1. Otevrete DevTools (F12)
2. Prejdete na zalozku "Lighthouse"
3. Vyberte "Progressive Web App"
4. Kliknete na "Generate report"
5. Cilove skore: 90+

## Zname problemy a reseni

### PWA se neinstaluje
**Problem**: Tlacitko instalace se nezobrazuje
**Reseni**:
- Zkontrolujte, ze stranka bezi na HTTPS
- Overte, ze manifest.json je pristupny
- Zkontrolujte konzoli pro chyby Service Workeru

### Aplikace nefunguje offline
**Problem**: Aplikace vyzaduje pripojeni
**Reseni**:
- Zkontrolujte, ze Service Worker je aktivni (chrome://serviceworker-internals)
- Vymazte cache a znovu nactete
- Overte, ze potrebne soubory jsou v cache

### Ikona se nezobrazuje spravne
**Problem**: Ikona je oriznuta nebo rozmazana
**Reseni**:
- Pouzijte maskable ikony pro Android 8+
- Overte rozmery ikon (musi byt presne)
- Vymazte cache aplikace v nastaveni Android

## Distribuce

### Moznosti distribuce
1. **Hosting na webu**: Nejjednodussi, uzivatele instaluji pres prohlizec
2. **TWA (Trusted Web Activity)**: Publikace v Google Play Store
3. **PWABuilder**: Generovani Android APK z PWA

### TWA (Trusted Web Activity)
Pro publikaci v Google Play Store:
1. Pouzijte [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap)
2. Nakonfigurujte Digital Asset Links
3. Vytvorte podpisovy klic
4. Buildujte APK/AAB
5. Nahrajte do Google Play Console

## Udrzba

### Aktualizace aplikace
- Service Worker automaticky kontroluje aktualizace
- Nova verze se stahne na pozadi
- Pri pristim spusteni se pouzije nova verze

### Cache management
```javascript
// Vymazani cache
caches.delete('dmx-512-v1')

// Seznam vsech caches
caches.keys().then(console.log)
```

## Podpora

### Kompatibilita prohlizecu (Android)
- [x] Chrome 80+
- [x] Edge 80+
- [x] Samsung Internet 12+
-  Firefox 85+ (castecna podpora)
- X Opera Mini (nepodporovano)

### Testovane zarizeni
- Samsung Galaxy S10+
- Google Pixel 5
- OnePlus 9 Pro
- Xiaomi Redmi Note 10

## Dalsi zdroje
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Android PWA Guide](https://developer.android.com/guide/webapps/pwa)
- [Manifest Generator](https://www.simicart.com/manifest-generator.html/)
- [Icon Generator](https://www.pwabuilder.com/)
