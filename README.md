# Theater DMX 512 Controller

> Profesionalni DMX 512 svetelny a motion kontroler optimalizovany pro mobilni zarizeni

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-success.svg)](manifest.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://reactjs.org/)

Mobilni aplikace pro rizeni DMX 512 stage osvetleni, stepper motoru a serv. Navrzeno jako Progressive Web App (PWA) s intuitivnim touch rozhranim pro profesionalni pouziti na Android a iOS zarizenich.

---

## Klicove funkce

### Pokrocile rizeni osvetleni
- **Individualni DMX kanaly** - Fadery 0-255 pro kazdy parametr svetel
- **RGB Color Picker** - Vizualni vyber barev s automatickym prevodem na DMX hodnoty
- **Fixture Management** - Pridavani a konfigurace svetelnych teles s DMX adresami

### Sceny a efekty
- **Sprava scen** - Ukladani a rychle vyvolani kompletnich stavu osvetleni
- **Automatizovane efekty** - Chase, Strobe, Rainbow, Fade, Sweep s nastavitelnou rychlosti
- **Visual Block Programming** - Drag-and-drop vizualni programovani vlastnich efektu
- **Editace efektu** - Uprava a duplikace efektu behem behu

### Motion Control
- **Stepper motory** - Presne 16-bit polohovani s kontrolou rychlosti
- **Servo motory** - Uhlova kontrola 0-180 mapovana na DMX
- **Joystick control** - Intuitivni ovladani pohybu pomoci joysticku

### Sitove pripojeni
- **Art-Net protokol** - Standard pro DMX over Ethernet
- **sACN (E1.31)** - Streaming ACN protokol
- **USB DMX** - Podpora USB DMX rozhrani
- **Profily pripojeni** - Ukladani a rychle prepinani mezi misty/venues
- **Real-time monitoring** - Live packet counter a status pripojeni

### Progressive Web App
- **Instalace** - "Add to Home Screen" na Android i iOS
- **Offline rezim** - Funguje i bez internetoveho pripojeni
- **Full-screen** - Spusteni bez browser chrome jako nativni aplikace
- **Touch optimalizace** - Velke ovladaci prvky pro praci prsty

### Custom Page Builder
- **Vlastni layout** - Pretahovani UI bloku pro vytvoreni vlastniho rozhrani
- **Kontrolni bloky** - Faders, tlacitka, color pickery, pozice kontroly
- **Responzivni design** - Automaticka adaptace na velikost obrazovky

---

## Rocket Rychly start

### Predpoklady

- **Node.js** 18+ a npm
- Moderni webovy prohlizec (Chrome, Safari, Firefox)
- Pro fyzicke DMX: Art-Net nebo sACN kompatibilni hardware

### Instalace

```bash
# Klonovani repozitare
git clone https://github.com/atrep123/dmx-512-controller.git
cd dmx-512-controller

# Instalace zavislosti (respektuje package-lock.json)
npm ci
```

### Lokalni vyvoj

```bash
# PWA + proxy na backend server
npm run dev
```

- Vite server posloucha na `http://localhost:5173`.
- Proxy presmeruje `/ws`, `/rgb`, `/healthz`, `/readyz`, `/metrics`, `/version` a `/debug` na backend (`http://localhost:8080`), takze neni nutne resit CORS behem vyvoje.
- WebSocket klient posila token jako `?token=<VITE_API_KEY>`; REST pozadavky pridavaji hlavicku `x-api-key`.

#### Kontrola kodu a build

```bash
npm run lint   # ESLint (TS/JS)
npm run typecheck  # Staticka kontrola typu (tsc --noEmit)
npm run test   # Vitest + React Testing Library
npm run build  # Production bundle pres Vite
npm run preview  # Staticky nahled build artefaktu
```

### Promenne prostredi

| Nazev           | Vychozi hodnota          | Popis |
| --------------- | ------------------------ | ----- |
| `VITE_API_KEY`  | `demo-key`               | Token pripojovany k REST/WS pozadavkum z klienta. |
| `VITE_WS_URL`   | `ws://localhost:5173/ws` | URL pro WebSocket klienta  v dev rezimu prochazi pres Vite proxy. |
| `DMX_*`         | viz `server/config.py`   | Backend konfigurace (MQTT, OLA, limity). |

Pro lokalni nastaveni muzete vytvorit `.env.local` nebo exportovat promenne primo v shellu.

### Docker Compose (volitelne)

```bash
cd infra
docker compose up --build
```

- `broker`  Mosquitto MQTT broker.
- `server`  FastAPI backend (exponuje port `8080`).
- `ui`  staticky servirovana PWA (Caddy, port `5173`), build z `infra/Dockerfile.ui`.

Frontend v kontejneru ocekava, ze backend bezi jako `server:8080`; promenne lze prepsat v `docker-compose.yml`.

### Monitoring a provoz

- Sekce **Pripojeni** zobrazuje aktualni RGB stav, sekvenci a metriky (`cmds_total`, `queue_depth`, `ws_clients`, `last_ms`). Tlacitko Refresh metrics nacita `/metrics` bez cache.
- Pokud `navigator.onLine === false`, klient zobrazi offline banner; socket se pri ztrate site korektne uzavre a po obnoveni se automaticky pripoji.
- Tlacitko Testovaci prikaz odesle demo RGB prikaz; ocekavane zvyseni `seq` lze overit v metrikach.
- API key (`VITE_API_KEY`) se pouziva pouze pro podpis pozadavku (`x-api-key`, `?token=`); UI jej nikdy nevypisuje.

#### OLA vystup (volitelne)

- Zapnuti: nastavte `OUTPUT_MODE=ola` (jinak bezi `null` vystup a OLA se nevola).
- Konfigurace: `DMX_OLA_URL` (napr. `http://localhost:9090/set_dmx`), `DMX_OLA_FPS` (default 44), `PATCH_FILE` (volitelna mapa universeOLA universe, YAML).
- Debug: `GET /universes/0/frame` vrati aktualni 512kanalovy frame pro universe 0.
- Metriky: `dmx_core_ola_frames_total`, `dmx_core_ola_frames_skipped_total{reason}`, `dmx_core_ola_last_fps`, `dmx_core_ola_http_errors_total`/`_by_code`, `dmx_core_ola_queue_depth`.
- Spolehlivost: httpx.AsyncClient (pool 48), timeout ~0.5 s, failopen; pri shutdownu se provede posledni `maybe_send()` a zavre se klient.

### Smoke test (manualni)

```bash
# Compose
cd infra && docker compose up --build -d
curl -sf http://localhost:8080/healthz && echo HEALTH OK
curl -sf http://localhost:8080/readyz  && echo READY OK

# MQTT retained
mosquitto_sub -h localhost -t v1/demo/rgb/state -C 1 -v

# CMD  STATE
mosquitto_pub -h localhost -t v1/demo/rgb/cmd -q 1 \
  -m '{"schema":"demo.rgb.cmd.v1","cmdId":"smk-1","src":"cli","r":10,"g":20,"b":30}'
mosquitto_sub -h localhost -t v1/demo/rgb/state -C 1 -v

# WS
# npx wscat -c ws://localhost:5173/ws?token=demo-key
# ocekavej initial {"type":"state",...}

# Metrics
curl -s http://localhost:8080/metrics | grep -E 'dmx_core_(cmds_total|queue_depth|ws_clients|apply_latency_ms_last|ack_latency_ms|patch_size)'

# Unified REST
curl -s http://localhost:8080/state | jq
curl -s -X POST http://localhost:8080/command \
  -H 'content-type: application/json' \
  -d '{"type":"dmx.patch","id":"smk-1","ts":0,"universe":0,"patch":[{"ch":1,"val":10},{"ch":2,"val":20},{"ch":3,"val":30}]}'

# Multiuniverse priklad
curl -s -X POST http://localhost:8080/command \
  -H 'content-type: application/json' \
  -d '{"type":"dmx.patch","id":"u1","ts":0,"universe":1,"patch":[{"ch":1,"val":100},{"ch":2,"val":120}]}'
```

---

## Instalace jako PWA

### Android
1. Otevrete aplikaci v Chrome
2. Klepnete na menu ()  "Pridat na plochu"
3. Potvrdte instalaci
4. Spustte aplikaci z domovske obrazovky

### iOS
1. Otevrete aplikaci v Safari
2. Klepnete na tlacitko Sdilet ()
3. Vyberte "Pridat na plochu"
4. Potvrdte pridani
5. Spustte aplikaci z domovske obrazovky

---

## Target Pouziti

### 1. Nastaveni Universe a Fixtures

1. Prejdete na zalozku **"Nastaveni"**
2. Vytvorte nove DMX universe
3. Pridejte fixtures s DMX adresami a poctem kanalu
4. Fixture se automaticky zobrazi v kontrolnim rozhrani

### 2. Ovladani svetel

1. Zalozka **"Kontrola"** nebo **"Svitidla"**
2. Vyberte fixture
3. Pouzijte fadery pro nastaveni jednotlivych kanalu
4. Pro RGB fixtures pouzijte color picker

### 3. Vytvareni scen

1. Nastavte pozadovany stav vsech fixtures
2. Zalozka **"Sceny"**
3. Kliknete "Vytvorit scenu"
4. Pojmenujte a ulozte
5. Vyvolate kliknutim na scenu

### 4. Automatizovane efekty

**Preset efekty:**
1. Zalozka **"Efekty"**
2. Vytvorte novy efekt
3. Vyberte typ (Chase, Strobe, Rainbow...)
4. Nastavte rychlost a intenzitu
5. Vyberte fixtures
6. Spustte efekt

**Visual Block Programming:**
1. Vytvorte efekt a zvolte typ "Bloky"
2. Pretahnete bloky z knihovny do programu
3. Nastavte parametry kazdeho bloku
4. Pouzijte loops a podminky
5. Spustte vlastni efekt

### 5. Pripojeni k DMX siti

1. Zalozka **"Pripojeni"**
2. Vyberte protokol (Art-Net/sACN/USB)
3. Zadejte IP adresu a port
4. Konfigurujte universe a send rate
5. Volitelne ulozte jako profil
6. Kliknete "Pripojit"
7. Sledujte status a packet counter

### 6. Custom Page Builder

1. Zalozka **"Moje stranka"**
2. Kliknete "Upravit layout"
3. Pretahnete bloky z knihovny
4. Nastavte vazby na fixtures/kanaly
5. Ulozte vlastni rozhrani
6. Prepnete do rezimu ovladani

---

## Technologie

### Frontend Framework
- **React 19** - UI knihovna s nejnovejsimi features
- **TypeScript 5.7** - Type-safe development
- **Vite** - Rychly build tool

### UI Components
- **Radix UI** - Primitives pro pristupne komponenty
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Animace a transitions
- **Phosphor Icons** - Moderni icon set

### State Management
- **@github/spark/hooks** - KV store pro persistent state
- **React hooks** - Local state management

### PWA
- **Manifest.json** - PWA konfigurace
- **Service Worker** - Offline caching
- **Meta tags** - Mobile optimization

---

## Design system

### Barevna paleta
- **Primary**: Deep Cyan `oklch(0.65 0.15 210)` - Digitalni/DMX technologie
- **Accent**: Magenta `oklch(0.65 0.20 330)` - Divadelni osvetleni
- **Background**: Dark Charcoal `oklch(0.15 0 0)` - Tmave prostredi pro nocni videni
- **Cards**: Darker Panel `oklch(0.20 0 0)` - Vrstveni a hloubka

### Typografie
- **Font**: Inter - Technicka a citelna
- **Hierarchy**: Bold pro nadpisy, Tabular pro DMX hodnoty
- **Sizes**: 12px-24px s tight/normal/relaxed spacing

### Design principy
- **Tactile** - Responzivni a fyzicke ovladani
- **Professional** - Spolehlivost ocekavana v produkcnim prostredi
- **Intuitive** - Komplexni kontrola pristupna pres jasnou hierarchii

---

## Struktura projektu

```
dmx-512-controller/
 src/
    components/
       controls/           # Kontrolni UI bloky
       ui/                 # Radix UI komponenty
       FixturesView.tsx    # Sprava fixtures
       ScenesView.tsx      # Sprava scen
       EffectsView.tsx     # Efekty
       MotorsView.tsx      # Motory a serva
       ConnectionView.tsx  # Sitove pripojeni
       SetupView.tsx       # Konfigurace
       LiveControlView.tsx # Live kontrola
       BlockProgramming.tsx # Visual programming
       CustomPageBuilder.tsx # Page builder
    lib/
       types.ts            # TypeScript typy
    hooks/                  # Custom React hooks
    styles/                 # CSS soubory
    App.tsx                 # Hlavni aplikace
 public/
    icon.svg                # App ikona
    sw.js                   # Service Worker
    pwa-install.js          # PWA install prompt
 manifest.json               # PWA manifest
 package.json                # Dependencies
 vite.config.ts              # Vite konfigurace
```

---

## Vyvoj

### Dostupne skripty

```bash
npm run dev          # Development server s hot reload
npm run build        # Production build
npm run preview      # Preview production buildu
npm run lint         # ESLint kontrola kodu
npm run optimize     # Vite optimalizace
```

### Doporuceny workflow

1. Fork repozitare
2. Vytvoreni feature branch (`git checkout -b feature/amazing-feature`)
3. Commit zmen (`git commit -m 'Add amazing feature'`)
4. Push do branch (`git push origin feature/amazing-feature`)
5. Otevreni Pull Request

### Code Style

- **TypeScript** pro type safety
- **ESLint** pro code quality
- **Komponenty** - Funkcni komponenty s hooks
- **Naming** - PascalCase pro komponenty, camelCase pro funkce

---

## Book Dokumentace

- **[PRD.md](PRD.md)** - Product Requirements Document s kompletnim designem
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Navod na deployment
- **[ANDROID_SETUP.md](ANDROID_SETUP.md)** - Nastaveni pro Android
- **[QUICKSTART_ANDROID.md](QUICKSTART_ANDROID.md)** - Rychly start pro Android
- **[SECURITY.md](SECURITY.md)** - Security policy
- **[ICONS_README.md](ICONS_README.md)** - Dokumentace ikon

---

## Handshake Prispivani

Uvitame prispevky! Prectete si prosim nase contributing guidelines:

1. **Fork** projektu
2. **Vytvorte** feature branch
3. **Testujte** sve zmeny
4. **Dokumentujte** nove features
5. **Otevreni** Pull Request

### Oblasti pro prispeni
- Bug Bug fixes a reporty
- * Nove funkce a vylepseni
- Note Dokumentace a preklady
-  UI/UX vylepseni
- Lab Testy a quality assurance

---

## Licence

Tento projekt je licencovan pod MIT License - viz [LICENSE](LICENSE) soubor pro detaily.

Copyright GitHub, Inc.

---

## Thanks Podekovani

- **GitHub Spark** - Framework pro rapid development
- **Radix UI** - Pristupne UI primitives
- **Phosphor Icons** - Krasna sada ikon
- **Open Source komunita** - Za neuveritelne nastroje

---

## Kontakt & Podpora

- **Issues**: [GitHub Issues](https://github.com/atrep123/dmx-512-controller/issues)
- **Discussions**: [GitHub Discussions](https://github.com/atrep123/dmx-512-controller/discussions)

---

## Star History

Pokud se vam tento projekt libi, dejte mu hvezdicku! 

---

<div align="center">
  
**Vytvoreno s  pro stage lighting professionals**

[Theater Demo](https://atrep123.github.io/dmx-512-controller)  [Book Dokumentace](PRD.md)  [Bug Reportovat bug](https://github.com/atrep123/dmx-512-controller/issues)

</div>

TIP: ETag & sparse

```
etag=$(curl -sI http://localhost:8080/state | grep -i ETag | awk '{print $2}')
curl -s -H "If-None-Match: $etag" http://localhost:8080/state -o /dev/null -w "%{http_code}\n"  # ocekavame 304
curl -s "http://localhost:8080/state?sparse=1" | jq
```
