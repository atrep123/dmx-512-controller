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

### Mohu používat aplikaci na více zařízeních?

Ano, ale data se automaticky nesynchronizují. Každé zařízení má vlastní lokální kopii dat. V budoucnu plánujeme přidat export/import funkcionalitu.

### Jak aktualizuji aplikaci na novou verzi?

PWA se aktualizuje automaticky na pozadí. Při příštím spuštění se načte nová verze. Případně můžete obnovit stránku (refresh).

## 🎮 Používání aplikace

### Kolik fixtures mohu přidat?

Technicky není limit, ale doporučujeme:
- **Mobil**: Max 30-40 fixtures pro optimální výkon
- **Tablet**: Max 50-60 fixtures
- **Desktop**: 100+ fixtures

### Mohu ovládat více univerzí současně?

Ano! Můžete přidat neomezený počet univerzí. Každé universe má 512 DMX kanálů.

### Jak vytvořím vlastní efekt?

Máte dvě možnosti:

**1. Přednastavené efekty:**
- Vyberte typ (chase, strobe, atd.)
- Nastavte rychlost a intenzitu
- Vyberte fixtures

**2. Blokové programování:**
- Vytvořte efekt typu "Block Program"
- Přetahujte bloky (barvy, pohyb, čekání)
- Sestavte sekvenci
- Spusťte

Návod: [User Guide - Efekty](USER_GUIDE.md#efekty)

### Můžu spustit více efektů najednou?

Ano! Můžete spustit více efektů současně. Efekty na různých fixtures běží nezávisle. Pokud se efekty překrývají na stejných fixtures, výsledek závisí na pořadí aplikace.

### Jak uložím aktuální nastavení?

Použijte funkci **Scény**:
1. Nastavte všechna světla
2. Záložka "Scény" → "Uložit novou scénu"
3. Pojmenujte scénu
4. Klikněte "Uložit"

### Co je rozdíl mezi RGB a RGBW?

- **RGB**: 3 kanály (Red, Green, Blue) - barevné světlo
- **RGBW**: 4 kanály (Red, Green, Blue, White) - barevné světlo + čistě bílý kanál pro vyšší intenzitu

## 🌐 DMX a hardware

### Jaké DMX rozhraní potřebuji?

Podporujeme:
- **Art-Net**: Ethernet DMX interface (nejčastější)
- **sACN (E1.31)**: Profesionální streaming ACN
- **USB DMX**: USB DMX interface (v přípravě)

### Jak připojím Art-Net interface?

1. Připojte Art-Net node k síti (Ethernet/WiFi)
2. Zjistěte IP adresu node (obvykle 192.168.x.x nebo 2.x.x.x)
3. V aplikaci: Připojení → Art-Net → Zadejte IP
4. Nastavte universe číslo
5. Klikněte "Připojit"

### Jakou IP adresu mám zadat?

IP adresa závisí na vašem Art-Net zařízení:
- Zkontrolujte manuál zařízení
- Obvykle 192.168.1.x nebo 2.x.x.x
- Můžete použít aplikaci pro skenování sítě
- Některá zařízení mají displej s IP adresou

### Funguje aplikace s DMX512 kabely?

Aplikace sama nepodporuje přímé DMX512 připojení. Potřebujete:
- **Art-Net nebo sACN node** - převádí Ethernet na DMX512
- **USB DMX interface** - převádí USB na DMX512 (v přípravě)

### Jaký je doporučený send rate pro Art-Net?

**Standardní**: 40-44 packets/second (DMX standard je 44 Hz)

Pro stabilnější připojení můžete zkusit nižší hodnoty (30-35), ale některé rychlé efekty mohou být méně plynulé.

## 🔧 Řešení problémů

### Aplikace se nepřipojí k Art-Net

**Checklist:**
1. ✓ Je Art-Net node zapnutá?
2. ✓ Je mobil ve stejné síti jako node?
3. ✓ Je IP adresa správná?
4. ✓ Je firewall vypnutý nebo má výjimku?
5. ✓ Je port 6454 otevřený?

**Řešení:**
- Pingněte IP adresu node z mobilu
- Zkuste jiné zařízení ve stejné síti
- Restartujte Art-Net node
- Zkontrolujte síťové nastavení

### Světla nereagují na změny

**Možné příčiny:**
1. **Špatná DMX adresa** - Zkontrolujte fixture setup
2. **Nesprávný universe** - Ověřte universe číslo
3. **Odpojeno od sítě** - Zkontrolujte connection status
4. **Fixture vypnuto** - Zkontrolujte napájení fixtures

### Aplikace je pomalá

**Optimalizace:**
- Snižte počet fixtures (ideálně pod 40 na mobilu)
- Vypněte nepoužívané efekty
- Zavřete jiné aplikace
- Snižte send rate v připojení
- Použijte silnější WiFi signál

### Efekty nejsou plynulé

**Příčiny a řešení:**
- **Nízký send rate** → Zvyšte na 40-44 Hz
- **Slabý WiFi** → Přesuňte se blíž k routeru nebo použijte kabel
- **Přetížený mobil** → Zavřete jiné aplikace
- **Příliš mnoho fixtures** → Rozdělte do více univerzí

### Data se ztratila po update

Data jsou uložená v browseru. Pokud:
- Vymazali jste cache prohlížeče → Data jsou pryč
- Odinstalovali aplikaci → Data zůstávají (pouze ikona zmizí)
- Přešli na jiný prohlížeč → Data jsou oddělená

**Prevence:** V budoucnu přidáme export/import funkcionalitu.

### Joystick nereaguje správně

**Možné problémy:**
1. **Fixture není moving head** → Zkontrolujte typ fixture
2. **Špatné channel mapování** → Ověřte Pan/Tilt kanály
3. **Touchscreen kalibrace** → Zkuste jiný joystick size

## 🚀 Pokročilé funkce

### Můžu ovládat aplikaci pomocí MIDI kontroléru?

Momentálně ne, ale je to v roadmapě. Plánovaná podpora pro:
- MIDI note mapping
- MIDI CC (Control Change) pro faders
- MIDI clock sync

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

Single-user režim je aktuální. Pro multi-user:
- **Workaround**: Export/import konfigurace (plánováno)
- **Budoucnost**: Server-based multi-user mode
- **Alternative**: Každý operátor má vlastní universe

### Podporuje aplikace fixture library?

Zatím ne - musíte manuálně nastavit DMX adresy a kanály. Plánujeme:
- Fixture library s předpřipravenými profily
- Import fixture profiles (GDTF, MVR)
- Community fixture library

### Můžu integrovat aplikaci s jiným software?

Plánované integrace:
- **OSC protocol** - Remote control
- **Web API** - REST API pro externí kontrolu
- **Webhooks** - Triggering z jiných systémů

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
