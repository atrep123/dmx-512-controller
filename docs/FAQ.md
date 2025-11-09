# Často Kladené Otázky (FAQ)

Odpovědi na nejčastější otázky o DMX 512 Kontrolér aplikaci.

## 📋 Obsah

- [Obecné](#obecné)
- [Instalace a nastavení](#instalace-a-nastavení)
- [Používání aplikace](#používání-aplikace)
- [DMX a hardware](#dmx-a-hardware)
- [Řešení problémů](#řešení-problémů)
- [Pokročilé funkce](#pokročilé-funkce)

## 🎭 Obecné

### Co je DMX 512?

DMX 512 (Digital Multiplex) je průmyslový komunikační protokol používaný pro řízení stage osvětlení a efektů. Jeden DMX "universe" může ovládat až 512 kanálů, kde každý kanál má hodnotu 0-255.

### Je aplikace zdarma?

Ano! Aplikace je open source pod MIT licencí. Můžete ji používat, upravovat a distribuovat zdarma.

### Potřebuji internetové připojení?

Ne! Aplikace funguje kompletně offline. Internet potřebujete jen při první instalaci a pro připojení k DMX síti (pokud používáte Art-Net nebo sACN).

### Na jakých zařízeních aplikace běží?

- **Android**: 5.0 (Lollipop) a vyšší
- **iOS**: Safari 15+
- **Desktop**: Chrome, Edge, Firefox, Safari
- **Nejlepší zkušenost**: Android 8+ s Chrome

### Kolik stojí provoz aplikace?

Aplikace je kompletně zdarma a nemá žádné provozní náklady. Všechna data jsou uložená lokálně na vašem zařízení.

## 📱 Instalace a nastavení

### Jak nainstaluji aplikaci?

1. Otevřete aplikaci v mobilním prohlížeči
2. Klikněte na "Instalovat" v instalačním promptu
3. Nebo Chrome menu → "Přidat na plochu"
4. Ikona se objeví na domovské obrazovce

Podrobný návod: [Android Setup Guide](ANDROID_SETUP.md)

### Proč se nezobrazuje instalační prompt?

**Možné příčiny:**
- Stránka neběží na HTTPS
- Již máte aplikaci nainstalovanou
- Prohlížeč nepodporuje PWA
- Service Worker se nenainstaloval správně

**Řešení:**
1. Ověřte HTTPS v URL
2. Zkuste v Chrome menu → "Přidat na plochu"
3. Vymažte cache prohlížeče a zkuste znovu

### Kde se ukládají moje data?

Data jsou uložená lokálně ve vašem prohlížeči pomocí IndexedDB. Nikam se neodesílají a zůstávají na vašem zařízení.

### Můžu ovládat aplikaci pomocí MIDI kontroléru?

Preview režim je dostupný: otevři **Nastavení → MIDI (preview)**, klikni na *Zapnout MIDI bridge* a Chrome (HTTPS) začne číst MIDI vstupy (loguje do konzole + událost `dmx-midi`).

1. Otevři **Nastavení → MIDI (preview)**.
2. Klikni na **"Zapnout MIDI bridge"** a v dialogu povol přístup k zařízení.
3. Panel zobrazí aktivní zařízení + poslední zprávu (hodí se pro ladění/konzoli).
4. Přejdi do sekce **MIDI mapování**, klikni na **"Zachytit MIDI zprávu"** a stiskni tlačítko nebo pohni faderem.
5. Vyber akci (DMX kanál, scéna, efekt toggle/intenzita nebo master dimmer) a klikni **"Uložit mapování"**.
6. Mapování se ukládají lokálně (IndexedDB) i do show snapshotu – bez vlastního mappingu platí fallback CC `0` → DMX kanál 1 (hodnota 0–127 se škáluje na 0–255).

Co je v roadmapě ([V1.3 - MIDI Support](ROADMAP.md#v13---midi-support), issue [`#421`](https://github.com/atrep123/dmx-512-controller/issues/421))?
- ✅ MIDI note mapping pro scény a efekt toggle (preview v Nastavení → MIDI)
- ✅ MIDI CC pro DMX kanály, efekt intenzitu a master dimmer
- 🔜 MIDI clock sync
- 🔜 MIDI learn režim pro tlačítka/LED feedback

Používáš Launchpad/APC/NanoKontrol? Sdílej nastavení v issue – hodí se mapy CC/notes i tvoje workflow.

### Podporuje aplikace timecode sync?

Zatím ne, ale je to plánované:
- SMPTE timecode
- Art-Net timecode
- OSC timecode
- Cue list s timecode triggers

### Mohu vytvořit cue list?

Momentálně ne, ale můžete použít:
- **Scény** - Manuální triggering
- **Block program efekty** - Sekvence s wait bloky
- **Budoucí feature** - Plná cue list s fade times

### Jak můžu spolupracovat s více operátory?

Aktuální verze je single-user, ale serverový režim je v roadmapě (issue #318). Do té doby:
- **Workaround**: Export/Import mezi zařízeními (sekce Data Management)
- **Alternativa**: Rozdělte universa (každý operátor vlastní universe / show stránku)
- **Zapojení**: Napiš use-case do issue – řešíme oprávnění, konflikty a sdílený backend.

### Podporuje aplikace fixture library?

Zatím ne - musíte manuálně nastavit DMX adresy a kanály. Plánujeme:
- Fixture library s předpřipravenými profily
- Import fixture profiles (GDTF, MVR)
- Community fixture library

### Můžu integrovat aplikaci s jiným software?

Plánované integrace:
- **OSC protocol** (issue #422) – vzdálené ovládání / bridge na show control konzole
- **Web API** (issue #350) – veřejné REST/WebSocket endpointy pro vlastní aplikace
- **Webhooks** – triggery z jiných systémů (DMX playback, automation)
- **Timecode** (issue #423) – SMPTE/MTC/LTC gateway

## 💡 Tipy a triky

### Jak organizovat velké množství fixtures?

**Best practices:**
1. Pojmenujte fixtures logicky ("Par 1 Stage Left")
2. Používejte emoji v názvech (🔴 Par Red, 🔵 Par Blue)
3. Seskupte do scén podle účelu
4. Vytvořte "Master" scény pro základní stavy

### Jak vytvořit efektivní workflow?

**Doporučený workflow:**
1. Setup (přidat všechny fixtures)
2. Test (projít všechny kanály)
3. Scény (vytvořit základní looks)
4. Efekty (programovat speciální momenty)
5. Show mode (používat scény a efekty)

### Jak minimalizovat latenci?

1. Používejte kabelové připojení (Ethernet adapter)
2. 5GHz WiFi místo 2.4GHz
3. Dedicated WiFi síť pro DMX
4. Vysoký send rate (44 Hz)
5. Minimální počet fixtures na universe

## 🆘 Potřebujete další pomoc?

- 📖 [User Guide](USER_GUIDE.md) - Kompletní návod
- 🏗️ [Architecture](ARCHITECTURE.md) - Technické detaily
- 💻 [API Reference](API.md) - Pro vývojáře
- 🐛 [Report Issue](https://github.com/atrep123/dmx-512-controller/issues) - Nahlásit problém
- 💬 [Discussions](https://github.com/atrep123/dmx-512-controller/discussions) - Komunita

---

**FAQ pro DMX 512 Kontrolér**  
Poslední aktualizace: 2024-11-01  
Máte další otázku? [Otevřete issue!](https://github.com/atrep123/dmx-512-controller/issues/new)
