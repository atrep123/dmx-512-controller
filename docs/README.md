# Dokumentace DMX 512 Kontroler

Vitejte v dokumentaci DMX 512 Kontroler projektu! Zde najdete veskere informace potrebne k pouzivani, vyvoji a nasazeni aplikace.

##  Prehled dokumentace

### Pro uzivatele

| Dokument | Popis | Uroven |
|----------|-------|--------|
| [**User Guide**](USER_GUIDE.md) | Kompletni navod k pouziti aplikace | Zacatecnik |
| [**Quick Start Android**](QUICKSTART_ANDROID.md) | Rychly start pro Android zarizeni | Zacatecnik |
| [**Android Setup**](ANDROID_SETUP.md) | Detailni instalace na Android | Pokrocily |
| [**FAQ**](FAQ.md) | Casto kladene otazky | Vsichni |
| [**Troubleshooting**](TROUBLESHOOTING.md) | Reseni problemu | Vsichni |
| [**Glossary**](GLOSSARY.md) | Vysvetleni pojmu a terminologie | Zacatecnik |

### Pro vyvojare

| Dokument | Popis | Uroven |
|----------|-------|--------|
| [**Contributing Guide**](../CONTRIBUTING.md) | Jak prispet do projektu | Zacatecnik |
| [**Architecture**](ARCHITECTURE.md) | Architektura a design aplikace | Stredne pokrocily |
| [**API Reference**](API.md) | TypeScript typy a rozhrani | Stredne pokrocily |
| [**PRD**](PRD.md) | Product Requirements Document | Pokrocily |

### Pro deployment

| Dokument | Popis | Uroven |
|----------|-------|--------|
| [**Deployment Guide**](DEPLOYMENT_GUIDE.md) | Nasazeni do produkce | Stredne pokrocily |
| [**Icons Guide**](ICONS_README.md) | Vytvoreni PWA ikon | Zacatecnik |
| [**Security Guide**](SECURITY.md) | Bezpecnostni best practices | Pokrocily |

### Planovani a vize

| Dokument | Popis | Uroven |
|----------|-------|--------|
| [**Roadmap**](ROADMAP.md) | Planovane funkce a timeline | Vsichni |

## Rocket Rychle odkazy

### Zacinam s aplikaci
1.  [Instalace na Android](QUICKSTART_ANDROID.md)
2.  [Prvni kroky](USER_GUIDE.md#zaciname)
3.  [Zakladni nastaveni](USER_GUIDE.md#nastaveni)

### Zacinam s vyvojem
1. Handshake [Contributing Guide](../CONTRIBUTING.md)
2. Computer [Vyvojove prostredi](../CONTRIBUTING.md#vyvojove-prostredi)
3. Build [Architektura prehled](ARCHITECTURE.md#prehled)

### Nasazeni aplikace
1. Rocket [Deployment kroky](DEPLOYMENT_GUIDE.md#jak-nasadit-aplikaci)
2.  [Vytvoreni ikon](ICONS_README.md)
3. [x] [Kontrolni seznam](DEPLOYMENT_GUIDE.md#kontrolni-seznam-pred-spustenim)

## Book Pruvodce podle role

### Theater Jsem lighting designer / operator

**Co potrebuji:**
1. [User Guide](USER_GUIDE.md) - Naucte se ovladat aplikaci
2. [Quick Start](QUICKSTART_ANDROID.md) - Instalace na mobil
3. [User Guide - Sceny](USER_GUIDE.md#sceny) - Prace se scenami
4. [User Guide - Efekty](USER_GUIDE.md#efekty) - Vytvareni efektu

**Nejcastejsi ukoly:**
- [Pridani fixtures](USER_GUIDE.md#pridani-fixture-svetla)
- [Vytvoreni sceny](USER_GUIDE.md#vytvoreni-sceny)
- [Spusteni efektu](USER_GUIDE.md#spusteni-efektu)
- [Pripojeni k DMX](USER_GUIDE.md#konfigurace-art-net)

### Computer Jsem vyvojar

**Co potrebuji:**
1. [Contributing Guide](../CONTRIBUTING.md) - Zacnete zde
2. [Architecture](ARCHITECTURE.md) - Pochopte strukturu
3. [API Reference](API.md) - TypeScript typy
4. [README](../README.md) - Tech stack a setup

**Nejcastejsi ukoly:**
- [Setup vyvojoveho prostredi](../CONTRIBUTING.md#setup)
- [Pridani nove komponenty](../CONTRIBUTING.md#struktura-projektu)
- [Vytvoreni Pull Requestu](../CONTRIBUTING.md#pull-request-process)
- [Code review](../CONTRIBUTING.md#review-proces)

### Rocket Jsem DevOps / deployer

**Co potrebuji:**
1. [Deployment Guide](DEPLOYMENT_GUIDE.md) - Nasazeni
2. [Security Guide](SECURITY.md) - Bezpecnost
3. [Icons Guide](ICONS_README.md) - PWA ikony
4. [Android Setup](ANDROID_SETUP.md) - Testovani

**Nejcastejsi ukoly:**
- [Build aplikace](DEPLOYMENT_GUIDE.md#krok-2-build-aplikace)
- [Hosting setup](DEPLOYMENT_GUIDE.md#krok-1-hosting-povinne)
- [PWA testovani](DEPLOYMENT_GUIDE.md#krok-3-testovani-pwa)
- [Google Play publishing](DEPLOYMENT_GUIDE.md#publikace-do-google-play-store)

###  Jsem designer

**Co potrebuji:**
1. [PRD](PRD.md) - Design direction
2. [Architecture - Design](ARCHITECTURE.md#-pwa-architektura)
3. [Icons Guide](ICONS_README.md) - Ikony
4. [PRD - Design](PRD.md#design-direction)

**Nejcastejsi ukoly:**
- [Barevne schema](PRD.md#color-selection)
- [Typografie](PRD.md#font-selection)
- [Komponenty](PRD.md#component-selection)
- [Animace](PRD.md#animations)

## Target Pruvodce podle ukolu

### Ovladani svetel
 [User Guide - Ovladani svetel](USER_GUIDE.md#ovladani-svetel)

### Vytvareni efektu
 [User Guide - Efekty](USER_GUIDE.md#efekty)

### Pridani nove funkce
 [Contributing Guide - Feature Development](../CONTRIBUTING.md#feature-development-guidelines)

### Oprava bugu
 [Contributing Guide - Bug Fix](../CONTRIBUTING.md#bug-fix-guidelines)

### Nasazeni na web
 [Deployment Guide](DEPLOYMENT_GUIDE.md)

### Publikace do Google Play
 [Deployment Guide - TWA](DEPLOYMENT_GUIDE.md#publikace-do-google-play-store)

##  Dokumentace podle priority

###  Must Read (Povinne)

Pro uzivatele:
- [User Guide](USER_GUIDE.md)

Pro vyvojare:
- [Contributing Guide](../CONTRIBUTING.md)
- [Architecture](ARCHITECTURE.md)

Pro deployment:
- [Deployment Guide](DEPLOYMENT_GUIDE.md)

###  Should Read (Doporucene)

- [API Reference](API.md)
- [Android Setup](ANDROID_SETUP.md)
- [Security Guide](SECURITY.md)

###  Nice to Read (Uzitecne)

- [PRD](PRD.md)
- [Icons Guide](ICONS_README.md)
- [Quick Start](QUICKSTART_ANDROID.md)

##  Hledani v dokumentaci

### Podle klicovych slov

**DMX**
- [DMX typy](API.md#fixture)
- [DMX hodnoty](API.md#dmx-value-utilities)
- [DMX universa](USER_GUIDE.md#vytvoreni-universe)

**Fixtures**
- [Fixture typy](API.md#fixture)
- [Pridani fixture](USER_GUIDE.md#pridani-fixture-svetla)
- [Fixture komponenta](ARCHITECTURE.md#view-komponenty)

**Sceny**
- [Scene type](API.md#scene)
- [Prace se scenami](USER_GUIDE.md#sceny)
- [Scene management](ARCHITECTURE.md#state-management)

**Efekty**
- [Effect types](API.md#effect)
- [Vytvareni efektu](USER_GUIDE.md#efekty)
- [Block programming](USER_GUIDE.md#vizualni-blokove-programovani)

**PWA**
- [PWA architektura](ARCHITECTURE.md#-pwa-architektura)
- [PWA instalace](USER_GUIDE.md#prvni-spusteni)
- [Service Worker](ARCHITECTURE.md#service-worker)

##  Potrebujete pomoc?

### Nenasli jste odpoved?

1.  **Prohledejte dokumentaci** - Pouzijte Ctrl+F
2. Chat **GitHub Discussions** - [Zeptejte se komunity](https://github.com/atrep123/dmx-512-controller/discussions)
3. Bug **GitHub Issues** - [Nahlaste problem](https://github.com/atrep123/dmx-512-controller/issues)
4. Email **Kontaktujte maintainers** - Viz README

### Casto kladene otazky

Nejcastejsi otazky najdete v:
- [User Guide - FAQ](USER_GUIDE.md#casto-kladene-otazky)
- [Deployment Guide - Troubleshooting](DEPLOYMENT_GUIDE.md#reseni-problemu)
- [Android Setup - Zname problemy](ANDROID_SETUP.md#zname-problemy-a-reseni)

## Refresh Aktualizace dokumentace

Dokumentace je zivy dokument a je pravidelne aktualizovana.

**Posledni velka aktualizace**: 2024-11-01

**Co je noveho:**
- [x] Kompletni restructuring dokumentace
- [x] Novy User Guide
- [x] Architecture dokumentace
- [x] API Reference
- [x] Contributing Guide
- [x] Tento index

### Jak prispet do dokumentace

1. Nasli jste chybu nebo chybejici informaci?
2. Otevrete Pull Request s opravou
3. Prectete si [Contributing Guide](../CONTRIBUTING.md)

## Clipboard Checklist pro nove uzivatele

Pro uzivatele aplikace:
- [ ] Precist [Quick Start](QUICKSTART_ANDROID.md)
- [ ] Nainstalovat aplikaci na mobil
- [ ] Projit [User Guide - Zaciname](USER_GUIDE.md#zaciname)
- [ ] Vytvorit prvni fixture
- [ ] Ulozit prvni scenu

Pro vyvojare:
- [ ] Precist [Contributing Guide](../CONTRIBUTING.md)
- [ ] Setup vyvojoveho prostredi
- [ ] Pochopit [Architecture](ARCHITECTURE.md)
- [ ] Prohlednout [API Reference](API.md)
- [ ] Vytvorit testovaci branch

Pro deployers:
- [ ] Precist [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [ ] Setup hosting (Vercel/Netlify)
- [ ] Vytvorit PWA ikony
- [ ] Testovat na realnych zarizenich
- [ ] Projit [Security Guide](SECURITY.md)

##  Doporucene dalsi kroky

Po precteni relevantni dokumentace:

**Pro uzivatele:**
 Zacnete pouzivat aplikaci!  
 Podelte se o feedback v [Discussions](https://github.com/atrep123/dmx-512-controller/discussions)

**Pro vyvojare:**
 Najdete [good first issue](https://github.com/atrep123/dmx-512-controller/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)  
 Pripojte se k vyvoji!

**Pro deployers:**
 Nasadte testovaci instanci  
 Sdilejte zkusenosti s komunitou

---

**Dokumentacni hub pro DMX 512 Kontroler**  
Vytvoreno s  pro lighting community  
Posledni aktualizace: 2024-11-01
