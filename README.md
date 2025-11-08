# đźŽ­ DMX 512 Controller

> ProfesionĂˇlnĂ­ DMX 512 svÄ›telnĂ˝ a motion kontrolĂ©r optimalizovanĂ˝ pro mobilnĂ­ zaĹ™Ă­zenĂ­

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-success.svg)](manifest.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://reactjs.org/)

MobilnĂ­ aplikace pro Ĺ™Ă­zenĂ­ DMX 512 stage osvÄ›tlenĂ­, stepper motorĹŻ a serv. NavrĹľeno jako Progressive Web App (PWA) s intuitivnĂ­m touch rozhranĂ­m pro profesionĂˇlnĂ­ pouĹľitĂ­ na Android a iOS zaĹ™Ă­zenĂ­ch.

### AI automation (Codex / GPT)

- `docs/AI_AUTOMATION.md` popisuje, jak spouĹˇtÄ›t agentnĂ­ reĹľim OpenAI Codexu, lokĂˇlnĂ­ skript
  `npm run ai:generate` a plĂˇnovanĂ© bÄ›hy v CI nebo cron.
- `.vscode/tasks.json` obsahuje hotovĂ© tasky **AI: Generate via OpenAI API** a **AI: Codex
  full-auto** â€“ staÄŤĂ­ doplnit API key / Codex CLI.
- NovĂ© soubory generovanĂ© AI se uklĂˇdajĂ­ do `tmp/ai-output/` a metadatovĂ© logy do `tmp/ai-history/`
  (oba adresĂˇĹ™e jsou ignorovanĂ© v Gitu).

### USB DMX (Enttec DMX USB PRO)

- Backend podporuje přímý výstup přes Enttec DMX USB PRO. Zapneš jej přes `OUTPUT_MODE=enttec`
  (nebo `USB_ENABLED=true`). Pokud `USB_PORT` nevyplníš, server použije autodetekci (`USB_VENDOR_IDS`,
  `USB_PRODUCT_IDS`, defaultně FTDI 0x0403/0x6001/0x6010/0x0400).
- Konfigurace výkonu: `USB_BAUDRATE=57600`, `USB_FPS=40`, perioda skenu `USB_SCAN_INTERVAL=5s`.
- Diagnostika: endpointy `GET /usb/devices`, `POST /usb/refresh` a `POST /usb/reconnect`
  ukazují dostupné porty, vynutí nový scan nebo znovu otevřou driver bez restartu backendu.
- UI zobrazuje stav USB mostu; backend drží seznam detekovaných zařízení a driver se při výpadku
  sám pokusí znovu připojit.

### Projekty & cloud zálohy

- Aktivuj `PROJECTS_ENABLED=true` a spravuj nezávislé konfigurace pro jednotlivé show. K dispozici je REST API
  `GET/POST /projects`, přepínání (`POST /projects/{id}/select`) a metadata (název, venue, datum, poznámky).
- Data Management panel ve frontendu umožňuje projekty vytvářet, přepínat a editovat přímo v UI.
- Volitelný cloud backup (`CLOUD_BACKUP_ENABLED=true`) ukládá snapshoty na lokální disk nebo do S3 (`CLOUD_BACKUP_PROVIDER=s3`).
  Endpointy `GET/POST /projects/{id}/backups` a `POST /projects/{id}/restore` zajišťují ruční zálohy/obnovy, auto-backup
  lze zapnout přes `CLOUD_BACKUP_AUTO_INTERVAL` (minuty).
- Zálohy lze šifrovat přes `CLOUD_BACKUP_ENCRYPTION_KEY` (Fernet). Historie je dostupná v UI, včetně velikosti,
  providera a příznaku šifrování.

### ESP DMX gateway

- Ve složce `firmware/esp32-dmx-gateway/` najdeš Arduino sketch pro ESP32 + SparkFun DMX Shield.
  Čte DMX univerzum a posílá změny jako `dmx.patch` na backend (`/command`), takže DMX pulty mohou
  napojit systém bez potřeby USB driveru přímo na serveru.
- Pokud připojíš SparkFun DMX shield přímo k serveru přes USB a necháš firmware logovat řádky
  `DMX: read value from channel X: Y`, můžeš zapnout backend driver (`DMX_INPUT_ENABLED=true`,
  `DMX_INPUT_PORT=/dev/ttyUSB0`). Server bude hodnoty z prvních tří kanálů mapovat na RGB a posílat je
  do enginu bez potřeby ESP.

---

## âś¨ KlĂ­ÄŤovĂ© funkce

### đźŽšď¸Ź **PokroÄŤilĂ© Ĺ™Ă­zenĂ­ osvÄ›tlenĂ­**
- **IndividuĂˇlnĂ­ DMX kanĂˇly** - FĂˇdery 0-255 pro kaĹľdĂ˝ parametr svÄ›tel
- **RGB Color Picker** - VizuĂˇlnĂ­ vĂ˝bÄ›r barev s automatickĂ˝m pĹ™evodem na DMX hodnoty
- **Fixture Management** - PĹ™idĂˇvĂˇnĂ­ a konfigurace svÄ›telnĂ˝ch tÄ›les s DMX adresami

### đźŽ¬ **ScĂ©ny a efekty**
- **SprĂˇva scĂ©n** - UklĂˇdĂˇnĂ­ a rychlĂ© vyvolĂˇnĂ­ kompletnĂ­ch stavĹŻ osvÄ›tlenĂ­
- **AutomatizovanĂ© efekty** - Chase, Strobe, Rainbow, Fade, Sweep s nastavitelnou rychlostĂ­
- **Visual Block Programming** - Drag-and-drop vizuĂˇlnĂ­ programovĂˇnĂ­ vlastnĂ­ch efektĹŻ
- **Editace efektĹŻ** - Ăšprava a duplikace efektĹŻ bÄ›hem bÄ›hu

### âš™ď¸Ź **Motion Control**
- **Stepper motory** - PĹ™esnĂ© 16-bit polohovĂˇnĂ­ s kontrolou rychlosti
- **Servo motory** - ĂšhlovĂˇ kontrola 0-180Â° mapovanĂˇ na DMX
- **Joystick control** - IntuitivnĂ­ ovlĂˇdĂˇnĂ­ pohybu pomocĂ­ joysticku

### đźŚ **SĂ­ĹĄovĂ© pĹ™ipojenĂ­**
- **Art-Net protokol** - Standard pro DMX over Ethernet
- **sACN (E1.31)** - Streaming ACN protokol
- **USB DMX** - Podpora USB DMX rozhranĂ­
- **Profily pĹ™ipojenĂ­** - UklĂˇdĂˇnĂ­ a rychlĂ© pĹ™epĂ­nĂˇnĂ­ mezi mĂ­sty/venues
- **Real-time monitoring** - Live packet counter a status pĹ™ipojenĂ­

### đź“± **Progressive Web App**
- **Instalace** - "Add to Home Screen" na Android i iOS
- **Offline reĹľim** - Funguje i bez internetovĂ©ho pĹ™ipojenĂ­
- **Full-screen** - SpuĹˇtÄ›nĂ­ bez browser chrome jako nativnĂ­ aplikace
- **Touch optimalizace** - VelkĂ© ovlĂˇdacĂ­ prvky pro prĂˇci prsty

### đźŽ¨ **Custom Page Builder**
- **VlastnĂ­ layout** - PĹ™etahovĂˇnĂ­ UI blokĹŻ pro vytvoĹ™enĂ­ vlastnĂ­ho rozhranĂ­
- **KontrolnĂ­ bloky** - Faders, tlaÄŤĂ­tka, color pickery, pozice kontroly
- **ResponzivnĂ­ design** - AutomatickĂˇ adaptace na velikost obrazovky

---

## đźš€ RychlĂ˝ start

### PĹ™edpoklady

- **Node.js** 18+ a npm
- ModernĂ­ webovĂ˝ prohlĂ­ĹľeÄŤ (Chrome, Safari, Firefox)
- Pro fyzickĂ© DMX: Art-Net nebo sACN kompatibilnĂ­ hardware

### Instalace

```bash
# KlonovĂˇnĂ­ repozitĂˇĹ™e
git clone https://github.com/atrep123/dmx-512-controller.git
cd dmx-512-controller

# Instalace zĂˇvislostĂ­ (respektuje package-lock.json)
npm ci
```

### LokĂˇlnĂ­ vĂ˝voj

```bash
# PWA + proxy na backend server
npm run dev
```

- Vite server poslouchĂˇ na `http://localhost:5173`.
- Proxy pĹ™esmÄ›ruje `/ws`, `/rgb`, `/healthz`, `/readyz`, `/metrics`, `/version` a `/debug` na backend (`http://localhost:8080`), takĹľe nenĂ­ nutnĂ© Ĺ™eĹˇit CORS bÄ›hem vĂ˝voje.
- WebSocket klient posĂ­lĂˇ token jako `?token=<VITE_API_KEY>`; REST poĹľadavky pĹ™idĂˇvajĂ­ hlaviÄŤku `x-api-key`.

#### Kontrola kĂłdu a build

```bash
npm run lint   # ESLint (TS/JS)
npm run test   # Vitest + React Testing Library
npm run build  # Production bundle pĹ™es Vite
npm run preview  # StatickĂ˝ nĂˇhled build artefaktĹŻ
```

### PromÄ›nnĂ© prostĹ™edĂ­

| NĂˇzev           | VĂ˝chozĂ­ hodnota          | Popis |
| --------------- | ------------------------ | ----- |
| `VITE_API_KEY`  | `demo-key`               | Token pĹ™ipojovanĂ˝ k REST/WS poĹľadavkĹŻm z klienta. |
| `VITE_WS_URL`   | `ws://localhost:5173/ws` | URL pro WebSocket klienta â€“ v dev reĹľimu prochĂˇzĂ­ pĹ™es Vite proxy. |
| `DMX_*`         | viz `server/config.py`   | Backend konfigurace (MQTT, OLA, limity). |

Pro lokĂˇlnĂ­ nastavenĂ­ mĹŻĹľete vytvoĹ™it `.env.local` nebo exportovat promÄ›nnĂ© pĹ™Ă­mo v shellu.

### Docker Compose (volitelnĂ©)

```bash
cd infra
docker-compose up --build
```

- `broker` â€“ Mosquitto MQTT broker.
- `server` â€“ FastAPI backend (exponuje port `8080`).
- `ui` â€“ staticky servĂ­rovanĂˇ PWA (Caddy, port `5173`), build z `infra/Dockerfile.ui`.

Frontend v kontejneru oÄŤekĂˇvĂˇ, Ĺľe backend bÄ›ĹľĂ­ jako `server:8080`; promÄ›nnĂ© lze pĹ™epsat v `docker-compose.yml`.

### Monitoring a provoz

- Sekce **PĹ™ipojenĂ­** zobrazuje aktuĂˇlnĂ­ RGB stav, sekvenci a metriky (`cmds_total`, `queue_depth`, `ws_clients`, `last_ms`). TlaÄŤĂ­tko â€žRefresh metricsâ€ś naÄŤĂ­tĂˇ `/metrics` bez cache.
- Pokud `navigator.onLine === false`, klient zobrazĂ­ offline banner; socket se pĹ™i ztrĂˇtÄ› sĂ­tÄ› korektnÄ› uzavĹ™e a po obnovenĂ­ se automaticky pĹ™ipojĂ­.
- TlaÄŤĂ­tko â€žTestovacĂ­ pĹ™Ă­kazâ€ś odeĹˇle demo RGB pĹ™Ă­kaz; oÄŤekĂˇvanĂ© zvĂ˝ĹˇenĂ­ `seq` lze ovÄ›Ĺ™it v metrikĂˇch.
- API key (`VITE_API_KEY`) se pouĹľĂ­vĂˇ pouze pro podpis poĹľadavkĹŻ (`x-api-key`, `?token=`); UI jej nikdy nevypisuje.

#### OLA vĂ˝stup (volitelnĂ©)

- ZapnutĂ­: nastavte `OUTPUT_MODE=ola` (jinak bÄ›ĹľĂ­ `null` vĂ˝stup a OLA se nevolĂˇ).
- Konfigurace: `DMX_OLA_URL` (napĹ™. `http://localhost:9090/set_dmx`), `DMX_OLA_FPS` (default 44), `PATCH_FILE` (volitelnĂˇ mapa universeâ†’OLA universe, YAML).
- Debug: `GET /universes/0/frame` vrĂˇtĂ­ aktuĂˇlnĂ­ 512â€‘kanĂˇlovĂ˝ frame pro universe 0.
- Metriky: `dmx_core_ola_frames_total`, `dmx_core_ola_frames_skipped_total{reason}`, `dmx_core_ola_last_fps`, `dmx_core_ola_http_errors_total`/`_by_code`, `dmx_core_ola_queue_depth`.
- Spolehlivost: httpx.AsyncClient (pool 4â€“8), timeout ~0.5 s, failâ€‘open; pĹ™i shutdownu se provede poslednĂ­ `maybe_send()` a zavĹ™e se klient.

### Smoke test (manuĂˇlnĂ­)

```bash
# Compose
cd infra && docker compose up --build -d
curl -sf http://localhost:8080/healthz && echo HEALTH OK
curl -sf http://localhost:8080/readyz  && echo READY OK

# MQTT retained
mosquitto_sub -h localhost -t v1/demo/rgb/state -C 1 -v

# CMD â†’ STATE
mosquitto_pub -h localhost -t v1/demo/rgb/cmd -q 1 \
  -m '{"schema":"demo.rgb.cmd.v1","cmdId":"smk-1","src":"cli","r":10,"g":20,"b":30}'
mosquitto_sub -h localhost -t v1/demo/rgb/state -C 1 -v

# WS
# npx wscat -c ws://localhost:5173/ws?token=demo-key
# oÄŤekĂˇvej initial {"type":"state",...}

# Metrics
curl -s http://localhost:8080/metrics | grep -E 'dmx_core_(cmds_total|queue_depth|ws_clients|apply_latency_ms_last|ack_latency_ms|patch_size)'

# Unified REST
curl -s http://localhost:8080/state | jq
curl -s -X POST http://localhost:8080/command \
  -H 'content-type: application/json' \
  -d '{"type":"dmx.patch","id":"smk-1","ts":0,"universe":0,"patch":[{"ch":1,"val":10},{"ch":2,"val":20},{"ch":3,"val":30}]}'

# Multiâ€‘universe pĹ™Ă­klad
curl -s -X POST http://localhost:8080/command \
  -H 'content-type: application/json' \
  -d '{"type":"dmx.patch","id":"u1","ts":0,"universe":1,"patch":[{"ch":1,"val":100},{"ch":2,"val":120}]}'
```

---

## đź“± Instalace jako PWA

### Android
1. OtevĹ™ete aplikaci v Chrome
2. KlepnÄ›te na menu (â‹®) â†’ "PĹ™idat na plochu"
3. PotvrÄŹte instalaci
4. SpusĹĄte aplikaci z domovskĂ© obrazovky

### iOS
1. OtevĹ™ete aplikaci v Safari
2. KlepnÄ›te na tlaÄŤĂ­tko SdĂ­let (â¬†ď¸Ź)
3. Vyberte "PĹ™idat na plochu"
4. PotvrÄŹte pĹ™idĂˇnĂ­
5. SpusĹĄte aplikaci z domovskĂ© obrazovky

---

## đźŽŻ PouĹľitĂ­

### 1. NastavenĂ­ Universe a Fixtures

1. PĹ™ejdÄ›te na zĂˇloĹľku **"NastavenĂ­"**
2. VytvoĹ™te novĂ© DMX universe
3. PĹ™idejte fixtures s DMX adresami a poÄŤtem kanĂˇlĹŻ
4. Fixture se automaticky zobrazĂ­ v kontrolnĂ­m rozhranĂ­

### 2. OvlĂˇdĂˇnĂ­ svÄ›tel

1. ZĂˇloĹľka **"Kontrola"** nebo **"SvĂ­tidla"**
2. Vyberte fixture
3. PouĹľijte fĂˇdery pro nastavenĂ­ jednotlivĂ˝ch kanĂˇlĹŻ
4. Pro RGB fixtures pouĹľijte color picker

### 3. VytvĂˇĹ™enĂ­ scĂ©n

1. Nastavte poĹľadovanĂ˝ stav vĹˇech fixtures
2. ZĂˇloĹľka **"ScĂ©ny"**
3. KliknÄ›te "VytvoĹ™it scĂ©nu"
4. Pojmenujte a uloĹľte
5. VyvolĂˇte kliknutĂ­m na scĂ©nu

### 4. AutomatizovanĂ© efekty

**Preset efekty:**
1. ZĂˇloĹľka **"Efekty"**
2. VytvoĹ™te novĂ˝ efekt
3. Vyberte typ (Chase, Strobe, Rainbow...)
4. Nastavte rychlost a intenzitu
5. Vyberte fixtures
6. SpusĹĄte efekt

**Visual Block Programming:**
1. VytvoĹ™te efekt a zvolte typ "Bloky"
2. PĹ™etĂˇhnÄ›te bloky z knihovny do programu
3. Nastavte parametry kaĹľdĂ©ho bloku
4. PouĹľijte loops a podmĂ­nky
5. SpusĹĄte vlastnĂ­ efekt

### 5. PĹ™ipojenĂ­ k DMX sĂ­ti

1. ZĂˇloĹľka **"PĹ™ipojenĂ­"**
2. Vyberte protokol (Art-Net/sACN/USB)
3. Zadejte IP adresu a port
4. Konfigurujte universe a send rate
5. VolitelnÄ› uloĹľte jako profil
6. KliknÄ›te "PĹ™ipojit"
7. Sledujte status a packet counter

### 6. Custom Page Builder

1. ZĂˇloĹľka **"Moje strĂˇnka"**
2. KliknÄ›te "Upravit layout"
3. PĹ™etĂˇhnÄ›te bloky z knihovny
4. Nastavte vazby na fixtures/kanĂˇly
5. UloĹľte vlastnĂ­ rozhranĂ­
6. PĹ™epnÄ›te do reĹľimu ovlĂˇdĂˇnĂ­

---

## đź› ď¸Ź Technologie

### Frontend Framework
- **React 19** - UI knihovna s nejnovÄ›jĹˇĂ­mi features
- **TypeScript 5.7** - Type-safe development
- **Vite** - RychlĂ˝ build tool

### UI Components
- **Radix UI** - Primitives pro pĹ™Ă­stupnĂ© komponenty
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Animace a transitions
- **Phosphor Icons** - ModernĂ­ icon set

### State Management
- **@github/spark/hooks** - KV store pro persistent state
- **React hooks** - Local state management

### PWA
- **Manifest.json** - PWA konfigurace
- **Service Worker** - Offline caching
- **Meta tags** - Mobile optimization

---

## đźŽ¨ Design system

### BarevnĂˇ paleta
- **Primary**: Deep Cyan `oklch(0.65 0.15 210)` - DigitĂˇlnĂ­/DMX technologie
- **Accent**: Magenta `oklch(0.65 0.20 330)` - DivadelnĂ­ osvÄ›tlenĂ­
- **Background**: Dark Charcoal `oklch(0.15 0 0)` - TmavĂ© prostĹ™edĂ­ pro noÄŤnĂ­ vidÄ›nĂ­
- **Cards**: Darker Panel `oklch(0.20 0 0)` - VrstvenĂ­ a hloubka

### Typografie
- **Font**: Inter - TechnickĂˇ a ÄŤitelnĂˇ
- **Hierarchy**: Bold pro nadpisy, Tabular pro DMX hodnoty
- **Sizes**: 12px-24px s tight/normal/relaxed spacing

### Design principy
- **Tactile** - ResponzivnĂ­ a fyzickĂ© ovlĂˇdĂˇnĂ­
- **Professional** - Spolehlivost oÄŤekĂˇvanĂˇ v produkÄŤnĂ­m prostĹ™edĂ­
- **Intuitive** - KomplexnĂ­ kontrola pĹ™Ă­stupnĂˇ pĹ™es jasnou hierarchii

---

## đź“ Struktura projektu

```
dmx-512-controller/
â”śâ”€â”€ src/
â”‚   â”śâ”€â”€ components/
â”‚   â”‚   â”śâ”€â”€ controls/           # KontrolnĂ­ UI bloky
â”‚   â”‚   â”śâ”€â”€ ui/                 # Radix UI komponenty
â”‚   â”‚   â”śâ”€â”€ FixturesView.tsx    # SprĂˇva fixtures
â”‚   â”‚   â”śâ”€â”€ ScenesView.tsx      # SprĂˇva scĂ©n
â”‚   â”‚   â”śâ”€â”€ EffectsView.tsx     # Efekty
â”‚   â”‚   â”śâ”€â”€ MotorsView.tsx      # Motory a serva
â”‚   â”‚   â”śâ”€â”€ ConnectionView.tsx  # SĂ­ĹĄovĂ© pĹ™ipojenĂ­
â”‚   â”‚   â”śâ”€â”€ SetupView.tsx       # Konfigurace
â”‚   â”‚   â”śâ”€â”€ LiveControlView.tsx # Live kontrola
â”‚   â”‚   â”śâ”€â”€ BlockProgramming.tsx # Visual programming
â”‚   â”‚   â””â”€â”€ CustomPageBuilder.tsx # Page builder
â”‚   â”śâ”€â”€ lib/
â”‚   â”‚   â””â”€â”€ types.ts            # TypeScript typy
â”‚   â”śâ”€â”€ hooks/                  # Custom React hooks
â”‚   â”śâ”€â”€ styles/                 # CSS soubory
â”‚   â””â”€â”€ App.tsx                 # HlavnĂ­ aplikace
â”śâ”€â”€ public/
â”‚   â”śâ”€â”€ icon.svg                # App ikona
â”‚   â”śâ”€â”€ sw.js                   # Service Worker
â”‚   â””â”€â”€ pwa-install.js          # PWA install prompt
â”śâ”€â”€ manifest.json               # PWA manifest
â”śâ”€â”€ package.json                # Dependencies
â””â”€â”€ vite.config.ts              # Vite konfigurace
```

---

## đź”§ VĂ˝voj

### DostupnĂ© skripty

```bash
npm run dev          # Development server s hot reload
npm run build        # Production build
npm run preview      # Preview production buildu
npm run lint         # ESLint kontrola kĂłdu
npm run optimize     # Vite optimalizace
```

### DoporuÄŤenĂ˝ workflow

1. Fork repozitĂˇĹ™e
2. VytvoĹ™enĂ­ feature branch (`git checkout -b feature/amazing-feature`)
3. Commit zmÄ›n (`git commit -m 'Add amazing feature'`)
4. Push do branch (`git push origin feature/amazing-feature`)
5. OtevĹ™enĂ­ Pull Request

### Code Style

- **TypeScript** pro type safety
- **ESLint** pro code quality
- **Komponenty** - FunkÄŤnĂ­ komponenty s hooks
- **Naming** - PascalCase pro komponenty, camelCase pro funkce

---

## đź“– Dokumentace

- **[PRD.md](PRD.md)** - Product Requirements Document s kompletnĂ­m designem
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - NĂˇvod na deployment
- **[ANDROID_SETUP.md](ANDROID_SETUP.md)** - NastavenĂ­ pro Android
- **[QUICKSTART_ANDROID.md](QUICKSTART_ANDROID.md)** - RychlĂ˝ start pro Android
- **[SECURITY.md](SECURITY.md)** - Security policy
- **[ICONS_README.md](ICONS_README.md)** - Dokumentace ikon

---

## đź¤ť PĹ™ispĂ­vĂˇnĂ­

UvĂ­tĂˇme pĹ™Ă­spÄ›vky! PĹ™eÄŤtÄ›te si prosĂ­m naĹˇe contributing guidelines:

1. **Fork** projektu
2. **VytvoĹ™te** feature branch
3. **Testujte** svĂ© zmÄ›ny
4. **Dokumentujte** novĂ© features
5. **OtevĹ™enĂ­** Pull Request

### Oblasti pro pĹ™ispÄ›nĂ­
- đź› Bug fixes a reporty
- âś¨ NovĂ© funkce a vylepĹˇenĂ­
- đź“ť Dokumentace a pĹ™eklady
- đźŽ¨ UI/UX vylepĹˇenĂ­
- đź§Ş Testy a quality assurance

---

## đź“„ Licence

Tento projekt je licencovĂˇn pod MIT License - viz [LICENSE](LICENSE) soubor pro detaily.

Copyright GitHub, Inc.

---

## đź™Ź PodÄ›kovĂˇnĂ­

- **GitHub Spark** - Framework pro rapid development
- **Radix UI** - PĹ™Ă­stupnĂ© UI primitives
- **Phosphor Icons** - KrĂˇsnĂˇ sada ikon
- **Open Source komunita** - Za neuvÄ›Ĺ™itelnĂ© nĂˇstroje

---

## đź“ž Kontakt & Podpora

- **Issues**: [GitHub Issues](https://github.com/atrep123/dmx-512-controller/issues)
- **Discussions**: [GitHub Discussions](https://github.com/atrep123/dmx-512-controller/discussions)

---

## đźŚź Star History

Pokud se vĂˇm tento projekt lĂ­bĂ­, dejte mu hvÄ›zdiÄŤku! â­

---

<div align="center">
  
**VytvoĹ™eno s âť¤ď¸Ź pro stage lighting professionals**

[đźŽ­ Demo](https://atrep123.github.io/dmx-512-controller) â€˘ [đź“– Dokumentace](PRD.md) â€˘ [đź› Reportovat bug](https://github.com/atrep123/dmx-512-controller/issues)

</div>

TIP: ETag & sparse

```
etag=$(curl -sI http://localhost:8080/state | grep -i ETag | awk '{print $2}')
curl -s -H "If-None-Match: $etag" http://localhost:8080/state -o /dev/null -w "%{http_code}\n"  # oÄŤekĂˇvĂˇme 304
curl -s "http://localhost:8080/state?sparse=1" | jq
```


