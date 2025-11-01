# Dokumentace DMX 512 Kontrolér

Vítejte v dokumentaci DMX 512 Kontrolér projektu! Zde najdete veškeré informace potřebné k používání, vývoji a nasazení aplikace.

## 📚 Přehled dokumentace

### Pro uživatele

| Dokument | Popis | Úroveň |
|----------|-------|--------|
| [**User Guide**](USER_GUIDE.md) | Kompletní návod k použití aplikace | Začátečník |
| [**Quick Start Android**](QUICKSTART_ANDROID.md) | Rychlý start pro Android zařízení | Začátečník |
| [**Android Setup**](ANDROID_SETUP.md) | Detailní instalace na Android | Pokročilý |

### Pro vývojáře

| Dokument | Popis | Úroveň |
|----------|-------|--------|
| [**Contributing Guide**](../CONTRIBUTING.md) | Jak přispět do projektu | Začátečník |
| [**Architecture**](ARCHITECTURE.md) | Architektura a design aplikace | Středně pokročilý |
| [**API Reference**](API.md) | TypeScript typy a rozhraní | Středně pokročilý |
| [**PRD**](PRD.md) | Product Requirements Document | Pokročilý |

### Pro deployment

| Dokument | Popis | Úroveň |
|----------|-------|--------|
| [**Deployment Guide**](DEPLOYMENT_GUIDE.md) | Nasazení do produkce | Středně pokročilý |
| [**Icons Guide**](ICONS_README.md) | Vytvoření PWA ikon | Začátečník |
| [**Security Guide**](SECURITY.md) | Bezpečnostní best practices | Pokročilý |

## 🚀 Rychlé odkazy

### Začínám s aplikací
1. 📱 [Instalace na Android](QUICKSTART_ANDROID.md)
2. 👤 [První kroky](USER_GUIDE.md#začínáme)
3. ⚙️ [Základní nastavení](USER_GUIDE.md#nastavení)

### Začínám s vývojem
1. 🤝 [Contributing Guide](../CONTRIBUTING.md)
2. 💻 [Vývojové prostředí](../CONTRIBUTING.md#vývojové-prostředí)
3. 🏗️ [Architektura přehled](ARCHITECTURE.md#přehled)

### Nasazení aplikace
1. 🚀 [Deployment kroky](DEPLOYMENT_GUIDE.md#jak-nasadit-aplikaci)
2. 🎨 [Vytvoření ikon](ICONS_README.md)
3. ✅ [Kontrolní seznam](DEPLOYMENT_GUIDE.md#kontrolní-seznam-před-spuštěním)

## 📖 Průvodce podle role

### 🎭 Jsem lighting designer / operátor

**Co potřebuji:**
1. [User Guide](USER_GUIDE.md) - Naučte se ovládat aplikaci
2. [Quick Start](QUICKSTART_ANDROID.md) - Instalace na mobil
3. [User Guide - Scény](USER_GUIDE.md#scény) - Práce se scénami
4. [User Guide - Efekty](USER_GUIDE.md#efekty) - Vytváření efektů

**Nejčastější úkoly:**
- [Přidání fixtures](USER_GUIDE.md#přidání-fixture-světla)
- [Vytvoření scény](USER_GUIDE.md#vytvoření-scény)
- [Spuštění efektu](USER_GUIDE.md#spuštění-efektu)
- [Připojení k DMX](USER_GUIDE.md#konfigurace-art-net)

### 💻 Jsem vývojář

**Co potřebuji:**
1. [Contributing Guide](../CONTRIBUTING.md) - Začněte zde
2. [Architecture](ARCHITECTURE.md) - Pochopte strukturu
3. [API Reference](API.md) - TypeScript typy
4. [README](../README.md) - Tech stack a setup

**Nejčastější úkoly:**
- [Setup vývojového prostředí](../CONTRIBUTING.md#setup)
- [Přidání nové komponenty](../CONTRIBUTING.md#struktura-projektu)
- [Vytvoření Pull Requestu](../CONTRIBUTING.md#pull-request-process)
- [Code review](../CONTRIBUTING.md#review-proces)

### 🚀 Jsem DevOps / deployer

**Co potřebuji:**
1. [Deployment Guide](DEPLOYMENT_GUIDE.md) - Nasazení
2. [Security Guide](SECURITY.md) - Bezpečnost
3. [Icons Guide](ICONS_README.md) - PWA ikony
4. [Android Setup](ANDROID_SETUP.md) - Testování

**Nejčastější úkoly:**
- [Build aplikace](DEPLOYMENT_GUIDE.md#krok-2-build-aplikace)
- [Hosting setup](DEPLOYMENT_GUIDE.md#krok-1-hosting-povinné)
- [PWA testování](DEPLOYMENT_GUIDE.md#krok-3-testování-pwa)
- [Google Play publishing](DEPLOYMENT_GUIDE.md#publikace-do-google-play-store)

### 🎨 Jsem designer

**Co potřebuji:**
1. [PRD](PRD.md) - Design direction
2. [Architecture - Design](ARCHITECTURE.md#📱-pwa-architektura)
3. [Icons Guide](ICONS_README.md) - Ikony
4. [PRD - Design](PRD.md#design-direction)

**Nejčastější úkoly:**
- [Barevné schéma](PRD.md#color-selection)
- [Typografie](PRD.md#font-selection)
- [Komponenty](PRD.md#component-selection)
- [Animace](PRD.md#animations)

## 🎯 Průvodce podle úkolu

### Ovládání světel
→ [User Guide - Ovládání světel](USER_GUIDE.md#ovládání-světel)

### Vytváření efektů
→ [User Guide - Efekty](USER_GUIDE.md#efekty)

### Přidání nové funkce
→ [Contributing Guide - Feature Development](../CONTRIBUTING.md#feature-development-guidelines)

### Oprava bugu
→ [Contributing Guide - Bug Fix](../CONTRIBUTING.md#bug-fix-guidelines)

### Nasazení na web
→ [Deployment Guide](DEPLOYMENT_GUIDE.md)

### Publikace do Google Play
→ [Deployment Guide - TWA](DEPLOYMENT_GUIDE.md#publikace-do-google-play-store)

## 📊 Dokumentace podle priority

### ⭐⭐⭐ Must Read (Povinné)

Pro uživatele:
- [User Guide](USER_GUIDE.md)

Pro vývojáře:
- [Contributing Guide](../CONTRIBUTING.md)
- [Architecture](ARCHITECTURE.md)

Pro deployment:
- [Deployment Guide](DEPLOYMENT_GUIDE.md)

### ⭐⭐ Should Read (Doporučené)

- [API Reference](API.md)
- [Android Setup](ANDROID_SETUP.md)
- [Security Guide](SECURITY.md)

### ⭐ Nice to Read (Užitečné)

- [PRD](PRD.md)
- [Icons Guide](ICONS_README.md)
- [Quick Start](QUICKSTART_ANDROID.md)

## 🔍 Hledání v dokumentaci

### Podle klíčových slov

**DMX**
- [DMX typy](API.md#fixture)
- [DMX hodnoty](API.md#dmx-value-utilities)
- [DMX universa](USER_GUIDE.md#vytvoření-universe)

**Fixtures**
- [Fixture typy](API.md#fixture)
- [Přidání fixture](USER_GUIDE.md#přidání-fixture-světla)
- [Fixture komponenta](ARCHITECTURE.md#view-komponenty)

**Scény**
- [Scene type](API.md#scene)
- [Práce se scénami](USER_GUIDE.md#scény)
- [Scene management](ARCHITECTURE.md#state-management)

**Efekty**
- [Effect types](API.md#effect)
- [Vytváření efektů](USER_GUIDE.md#efekty)
- [Block programming](USER_GUIDE.md#vizuální-blokové-programování)

**PWA**
- [PWA architektura](ARCHITECTURE.md#📱-pwa-architektura)
- [PWA instalace](USER_GUIDE.md#první-spuštění)
- [Service Worker](ARCHITECTURE.md#service-worker)

## 🆘 Potřebujete pomoc?

### Nenašli jste odpověď?

1. 🔍 **Prohledejte dokumentaci** - Použijte Ctrl+F
2. 💬 **GitHub Discussions** - [Zeptejte se komunity](https://github.com/atrep123/dmx-512-controller/discussions)
3. 🐛 **GitHub Issues** - [Nahlaste problém](https://github.com/atrep123/dmx-512-controller/issues)
4. 📧 **Kontaktujte maintainers** - Viz README

### Často kladené otázky

Nejčastější otázky najdete v:
- [User Guide - FAQ](USER_GUIDE.md#často-kladené-otázky)
- [Deployment Guide - Troubleshooting](DEPLOYMENT_GUIDE.md#řešení-problémů)
- [Android Setup - Známé problémy](ANDROID_SETUP.md#známé-problémy-a-řešení)

## 🔄 Aktualizace dokumentace

Dokumentace je živý dokument a je pravidelně aktualizována.

**Poslední velká aktualizace**: 2024-11-01

**Co je nového:**
- ✅ Kompletní restructuring dokumentace
- ✅ Nový User Guide
- ✅ Architecture dokumentace
- ✅ API Reference
- ✅ Contributing Guide
- ✅ Tento index

### Jak přispět do dokumentace

1. Našli jste chybu nebo chybějící informaci?
2. Otevřete Pull Request s opravou
3. Přečtěte si [Contributing Guide](../CONTRIBUTING.md)

## 📋 Checklist pro nové uživatele

Pro uživatele aplikace:
- [ ] Přečíst [Quick Start](QUICKSTART_ANDROID.md)
- [ ] Nainstalovat aplikaci na mobil
- [ ] Projít [User Guide - Začínáme](USER_GUIDE.md#začínáme)
- [ ] Vytvořit první fixture
- [ ] Uložit první scénu

Pro vývojáře:
- [ ] Přečíst [Contributing Guide](../CONTRIBUTING.md)
- [ ] Setup vývojového prostředí
- [ ] Pochopit [Architecture](ARCHITECTURE.md)
- [ ] Prohlédnout [API Reference](API.md)
- [ ] Vytvořit testovací branch

Pro deployers:
- [ ] Přečíst [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [ ] Setup hosting (Vercel/Netlify)
- [ ] Vytvořit PWA ikony
- [ ] Testovat na reálných zařízeních
- [ ] Projít [Security Guide](SECURITY.md)

## 🌟 Doporučené další kroky

Po přečtení relevantní dokumentace:

**Pro uživatele:**
→ Začněte používat aplikaci!  
→ Podělte se o feedback v [Discussions](https://github.com/atrep123/dmx-512-controller/discussions)

**Pro vývojáře:**
→ Najděte [good first issue](https://github.com/atrep123/dmx-512-controller/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)  
→ Připojte se k vývoji!

**Pro deployers:**
→ Nasaďte testovací instanci  
→ Sdílejte zkušenosti s komunitou

---

**Dokumentační hub pro DMX 512 Kontrolér**  
Vytvořeno s ❤️ pro lighting community  
Poslední aktualizace: 2024-11-01
