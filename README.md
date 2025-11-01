# DMX 512 Kontrolér

> Profesionální mobilní ovládání osvětlení a motorů přes DMX 512 protokol

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-blue)](https://reactjs.org/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-green)](https://web.dev/progressive-web-apps/)

## 🎭 O projektu

DMX 512 Kontrolér je mobilní Progressive Web App (PWA) pro profesionální řízení stage osvětlení, stepper motorů a servomotorů pomocí DMX 512 protokolu. Aplikace poskytuje intuitivní dotykové rozhraní optimalizované pro Android a iOS zařízení s možností práce offline.

### ✨ Klíčové funkce

- 🎨 **Ovládání světel** - Řízení jednotlivých DMX kanálů, RGB/RGBW barevný picker
- 🎬 **Scény** - Ukládání a okamžité vyvolání kompletních stavů osvětlení
- ⚡ **Efekty** - 14 vestavěných efektů (chase, strobe, rainbow, fade, sweep, atd.)
- 🧩 **Blokové programování** - Vizuální tvorba vlastních efektů pomocí bloků
- 🎮 **Joystick kontrola** - Živé ovládání Pan/Tilt pomocí virtuálního joysticku
- 🔧 **Motory a serva** - Přesné polohování stepper motorů (16-bit) a servomotorů (0-180°)
- 🌐 **Síťové připojení** - Podpora Art-Net, sACN, USB DMX rozhraní
- 📱 **PWA podpora** - Instalace jako nativní aplikace, offline režim
- 🎯 **Vlastní stránky** - Vytváření vlastních ovládacích panelů z UI bloků

### 🎯 Pro koho je aplikace určena

- Lighting designéři a operátoři
- DJ's a VJ's
- Event technici
- Divadelní technici
- Hobbyisté pracující s DMX osvětlením
- Integrátory a instalatéry osvětlení

## 📸 Screenshoty

```
TODO: Přidat screenshoty aplikace
```

## 🚀 Rychlý start

### Požadavky

- Node.js 18.x nebo vyšší
- npm 9.x nebo vyšší
- Moderní webový prohlížeč (Chrome 100+, Edge 100+, Safari 15+)

### Instalace pro vývoj

```bash
# Klonování repozitáře
git clone https://github.com/atrep123/dmx-512-controller.git
cd dmx-512-controller

# Instalace závislostí
npm install

# Spuštění vývojového serveru
npm run dev
```

Aplikace bude dostupná na `http://localhost:5173`

### Build pro produkci

```bash
# Vytvoření optimalizované produkční verze
npm run build

# Náhled produkční verze
npm run preview
```

### Instalace jako PWA

1. Otevřete aplikaci v mobilním prohlížeči (Chrome/Safari)
2. Klikněte na "Instalovat" v instalačním promptu
3. Nebo použijte menu → "Přidat na plochu"
4. Aplikace se objeví na domovské obrazovce

Podrobný návod: [Android Setup Guide](docs/ANDROID_SETUP.md)

## 📚 Dokumentace

### Pro uživatele

- [Uživatelská příručka](docs/USER_GUIDE.md) - Kompletní návod k použití
- [Android Setup](docs/ANDROID_SETUP.md) - Instalace na Android zařízení
- [Quick Start Android](docs/QUICKSTART_ANDROID.md) - Rychlý start pro Android

### Pro vývojáře

- [Contributing Guide](CONTRIBUTING.md) - Jak přispívat do projektu
- [Architektura](docs/ARCHITECTURE.md) - Struktura a design aplikace
- [API Dokumentace](docs/API.md) - TypeScript typy a rozhraní
- [UI Komponenty](src/components/controls/README.md) - Dokumentace ovládacích prvků

### Pro deployment

- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Nasazení do produkce
- [Security Guide](docs/SECURITY.md) - Bezpečnostní best practices
- [Icons Guide](docs/ICONS_README.md) - Vytvoření PWA ikon

## 🏗️ Technologie

### Core Stack

- **Framework**: React 19.0 + TypeScript 5.7
- **Build Tool**: Vite 6.3
- **Styling**: Tailwind CSS 4.1 + shadcn/ui
- **State Management**: React Hooks + @github/spark KV store
- **Icons**: Phosphor Icons

### Klíčové knihovny

- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Data Visualization**: Recharts, D3
- **PWA**: Service Workers, IndexedDB

### DMX Protokoly

- Art-Net (sACN připraveno)
- USB DMX interfaces
- Maximálně 512 kanálů na universum

## 📁 Struktura projektu

```
dmx-512-controller/
├── src/
│   ├── components/          # React komponenty
│   │   ├── controls/        # Ovládací UI bloky
│   │   └── ui/              # shadcn/ui komponenty
│   ├── lib/                 # Utility funkce a typy
│   │   ├── types.ts         # TypeScript definice
│   │   ├── blockCompiler.ts # Kompilátor bloků efektů
│   │   └── utils.ts         # Pomocné funkce
│   ├── App.tsx              # Hlavní aplikace
│   └── main.tsx             # Entry point
├── public/                  # Statické soubory
│   ├── icon.svg             # PWA ikona
│   ├── sw.js                # Service Worker
│   └── pwa-install.js       # PWA instalační script
├── docs/                    # Dokumentace
└── dist/                    # Build výstup (generováno)
```

Podrobný popis: [Architecture Documentation](docs/ARCHITECTURE.md)

## 🎨 Design systém

Aplikace používá tmavý profesionální design inspirovaný lighting konzolemi:

- **Barevná paleta**: Triadic schéma (Deep Cyan + Magenta na černém pozadí)
- **Typografie**: Inter font family s tabulárními čísly
- **Komponenty**: shadcn/ui s custom styling
- **Přístupnost**: WCAG AA compliant kontrasty

Více o designu: [PRD.md](docs/PRD.md)

## 🤝 Přispívání

Vítáme příspěvky! Přečtěte si prosím [Contributing Guide](CONTRIBUTING.md) před vytvořením pull requestu.

### Rychlý checklist

- [ ] Fork repozitáře
- [ ] Vytvořte feature branch (`git checkout -b feature/AmazingFeature`)
- [ ] Commitujte změny (`git commit -m 'Add some AmazingFeature'`)
- [ ] Push do branch (`git push origin feature/AmazingFeature`)
- [ ] Otevřete Pull Request

## 🐛 Hlášení chyb

Našli jste bug? [Otevřete issue](https://github.com/atrep123/dmx-512-controller/issues) s následujícími informacemi:

- Popis problému
- Kroky k reprodukci
- Očekávané chování
- Aktuální chování
- Screenshots (pokud je to relevantní)
- Verze prohlížeče a OS

## 📝 Changelog

Všechny významné změny jsou zdokumentovány v [CHANGELOG.md](CHANGELOG.md).

## 📜 Licence

Tento projekt je licencován pod MIT licencí - viz [LICENSE](LICENSE) soubor pro detaily.

## 🙏 Poděkování

- [shadcn/ui](https://ui.shadcn.com/) - Za skvělé UI komponenty
- [Phosphor Icons](https://phosphoricons.com/) - Za krásné ikony
- [Radix UI](https://www.radix-ui.com/) - Za přístupné UI primitives
- Všem přispěvatelům!

## 📞 Kontakt

- GitHub Issues: [Report a bug](https://github.com/atrep123/dmx-512-controller/issues)
- Discussions: [Join the conversation](https://github.com/atrep123/dmx-512-controller/discussions)

## 🔗 Související projekty

- [Art-Net Protocol](https://art-net.org.uk/)
- [sACN Protocol](https://www.esta.org/ANSI_E1-31_2018)
- [Open Lighting Architecture](https://www.openlighting.org/)

---

**Vytvořeno s ❤️ pro lighting community**
