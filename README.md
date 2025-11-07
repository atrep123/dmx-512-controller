# 🎭 DMX 512 Controller

> Profesionální DMX 512 světelný a motion kontrolér optimalizovaný pro mobilní zařízení

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-success.svg)](manifest.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://reactjs.org/)

Mobilní aplikace pro řízení DMX 512 stage osvětlení, stepper motorů a serv. Navrženo jako Progressive Web App (PWA) s intuitivním touch rozhraním pro profesionální použití na Android a iOS zařízeních.

### AI automation (Codex / GPT)

- `docs/AI_AUTOMATION.md` popisuje, jak spouštět agentní režim OpenAI Codexu, lokální skript
  `npm run ai:generate` a plánované běhy v CI nebo cron.
- `.vscode/tasks.json` obsahuje hotové tasky **AI: Generate via OpenAI API** a **AI: Codex
  full-auto** – stačí doplnit API key / Codex CLI.
- Nové soubory generované AI se ukládají do `tmp/ai-output/` a metadatové logy do `tmp/ai-history/`
  (oba adresáře jsou ignorované v Gitu).

---

## ✨ Klíčové funkce

### 🎚️ **Pokročilé řízení osvětlení**
- **Individuální DMX kanály** - Fádery 0-255 pro každý parametr světel
- **RGB Color Picker** - Vizuální výběr barev s automatickým převodem na DMX hodnoty
- **Fixture Management** - Přidávání a konfigurace světelných těles s DMX adresami

### 🎬 **Scény a efekty**
- **Správa scén** - Ukládání a rychlé vyvolání kompletních stavů osvětlení
- **Automatizované efekty** - Chase, Strobe, Rainbow, Fade, Sweep s nastavitelnou rychlostí
- **Visual Block Programming** - Drag-and-drop vizuální programování vlastních efektů
- **Editace efektů** - Úprava a duplikace efektů během běhu

### ⚙️ **Motion Control**
- **Stepper motory** - Přesné 16-bit polohování s kontrolou rychlosti
- **Servo motory** - Úhlová kontrola 0-180° mapovaná na DMX
- **Joystick control** - Intuitivní ovládání pohybu pomocí joysticku

### 🌐 **Síťové připojení**
- **Art-Net protokol** - Standard pro DMX over Ethernet
- **sACN (E1.31)** - Streaming ACN protokol
- **USB DMX** - Podpora USB DMX rozhraní
- **Profily připojení** - Ukládání a rychlé přepínání mezi místy/venues
- **Real-time monitoring** - Live packet counter a status připojení

### 📱 **Progressive Web App**
- **Instalace** - "Add to Home Screen" na Android i iOS
- **Offline režim** - Funguje i bez internetového připojení
- **Full-screen** - Spuštění bez browser chrome jako nativní aplikace
- **Touch optimalizace** - Velké ovládací prvky pro práci prsty

### 🎨 **Custom Page Builder**
- **Vlastní layout** - Přetahování UI bloků pro vytvoření vlastního rozhraní
- **Kontrolní bloky** - Faders, tlačítka, color pickery, pozice kontroly
- **Responzivní design** - Automatická adaptace na velikost obrazovky

---

## 🚀 Rychlý start

### Předpoklady

- **Node.js** 18+ a npm
- Moderní webový prohlížeč (Chrome, Safari, Firefox)
- Pro fyzické DMX: Art-Net nebo sACN kompatibilní hardware

### Instalace

```bash
# Klonování repozitáře
git clone https://github.com/atrep123/dmx-512-controller.git
cd dmx-512-controller

# Instalace závislostí (respektuje package-lock.json)
npm ci
```

> **Poznámka**: Projekt používá Vite 7, který je kompatibilní s @github/spark díky `.npmrc` konfiguraci s `legacy-peer-deps=true`.

### Lokální vývoj

```bash
# PWA + proxy na backend server
npm run dev
```

- Vite server poslouchá na `http://localhost:5173`.
- Proxy přesměruje `/ws`, `/rgb`, `/healthz`, `/readyz`, `/metrics`, `/version` a `/debug` na backend (`http://localhost:8080`), takže není nutné řešit CORS během vývoje.
- WebSocket klient posílá token jako `?token=<VITE_API_KEY>`; REST požadavky přidávají hlavičku `x-api-key`.

#### Kontrola kódu a build

```bash
npm run lint   # ESLint (TS/JS)
npm run test   # Vitest + React Testing Library
npm run build  # Production bundle přes Vite
npm run preview  # Statický náhled build artefaktů
```

### Proměnné prostředí

| Název           | Výchozí hodnota          | Popis |
| --------------- | ------------------------ | ----- |
| `VITE_API_KEY`  | `demo-key`               | Token připojovaný k REST/WS požadavkům z klienta. |
| `VITE_WS_URL`   | `ws://localhost:5173/ws` | URL pro WebSocket klienta – v dev režimu prochází přes Vite proxy. |
| `DMX_*`         | viz `server/config.py`   | Backend konfigurace (MQTT, OLA, limity). |

Pro lokální nastavení můžete vytvořit `.env.local` nebo exportovat proměnné přímo v shellu.

### Docker Compose (volitelné)

```bash
cd infra
docker-compose up --build
```

- `broker` – Mosquitto MQTT broker.
- `server` – FastAPI backend (exponuje port `8080`).
- `ui` – staticky servírovaná PWA (Caddy, port `5173`), build z `infra/Dockerfile.ui`.

Frontend v kontejneru očekává, že backend běží jako `server:8080`; proměnné lze přepsat v `docker-compose.yml`.

### Monitoring a provoz

- Sekce **Připojení** zobrazuje aktuální RGB stav, sekvenci a metriky (`cmds_total`, `queue_depth`, `ws_clients`, `last_ms`). Tlačítko „Refresh metrics“ načítá `/metrics` bez cache.
- Pokud `navigator.onLine === false`, klient zobrazí offline banner; socket se při ztrátě sítě korektně uzavře a po obnovení se automaticky připojí.
- Tlačítko „Testovací příkaz“ odešle demo RGB příkaz; očekávané zvýšení `seq` lze ověřit v metrikách.
- API key (`VITE_API_KEY`) se používá pouze pro podpis požadavků (`x-api-key`, `?token=`); UI jej nikdy nevypisuje.

#### OLA výstup (volitelné)

- Zapnutí: nastavte `OUTPUT_MODE=ola` (jinak běží `null` výstup a OLA se nevolá).
- Konfigurace: `DMX_OLA_URL` (např. `http://localhost:9090/set_dmx`), `DMX_OLA_FPS` (default 44), `PATCH_FILE` (volitelná mapa universe→OLA universe, YAML).
- Debug: `GET /universes/0/frame` vrátí aktuální 512‑kanálový frame pro universe 0.
- Metriky: `dmx_core_ola_frames_total`, `dmx_core_ola_frames_skipped_total{reason}`, `dmx_core_ola_last_fps`, `dmx_core_ola_http_errors_total`/`_by_code`, `dmx_core_ola_queue_depth`.
- Spolehlivost: httpx.AsyncClient (pool 4–8), timeout ~0.5 s, fail‑open; při shutdownu se provede poslední `maybe_send()` a zavře se klient.

### Smoke test (manuální)

```bash
# Compose
cd infra && docker compose up --build -d
curl -sf http://localhost:8080/healthz && echo HEALTH OK
curl -sf http://localhost:8080/readyz  && echo READY OK

# MQTT retained
mosquitto_sub -h localhost -t v1/demo/rgb/state -C 1 -v

# CMD → STATE
mosquitto_pub -h localhost -t v1/demo/rgb/cmd -q 1 \
  -m '{"schema":"demo.rgb.cmd.v1","cmdId":"smk-1","src":"cli","r":10,"g":20,"b":30}'
mosquitto_sub -h localhost -t v1/demo/rgb/state -C 1 -v

# WS
# npx wscat -c ws://localhost:5173/ws?token=demo-key
# očekávej initial {"type":"state",...}

# Metrics
curl -s http://localhost:8080/metrics | grep -E 'dmx_core_(cmds_total|queue_depth|ws_clients|apply_latency_ms_last|ack_latency_ms|patch_size)'

# Unified REST
curl -s http://localhost:8080/state | jq
curl -s -X POST http://localhost:8080/command \
  -H 'content-type: application/json' \
  -d '{"type":"dmx.patch","id":"smk-1","ts":0,"universe":0,"patch":[{"ch":1,"val":10},{"ch":2,"val":20},{"ch":3,"val":30}]}'

# Multi‑universe příklad
curl -s -X POST http://localhost:8080/command \
  -H 'content-type: application/json' \
  -d '{"type":"dmx.patch","id":"u1","ts":0,"universe":1,"patch":[{"ch":1,"val":100},{"ch":2,"val":120}]}'
```

---

## 📱 Instalace jako PWA

### Android
1. Otevřete aplikaci v Chrome
2. Klepněte na menu (⋮) → "Přidat na plochu"
3. Potvrďte instalaci
4. Spusťte aplikaci z domovské obrazovky

### iOS
1. Otevřete aplikaci v Safari
2. Klepněte na tlačítko Sdílet (⬆️)
3. Vyberte "Přidat na plochu"
4. Potvrďte přidání
5. Spusťte aplikaci z domovské obrazovky

---

## 🎯 Použití

### 1. Nastavení Universe a Fixtures

1. Přejděte na záložku **"Nastavení"**
2. Vytvořte nové DMX universe
3. Přidejte fixtures s DMX adresami a počtem kanálů
4. Fixture se automaticky zobrazí v kontrolním rozhraní

### 2. Ovládání světel

1. Záložka **"Kontrola"** nebo **"Svítidla"**
2. Vyberte fixture
3. Použijte fádery pro nastavení jednotlivých kanálů
4. Pro RGB fixtures použijte color picker

### 3. Vytváření scén

1. Nastavte požadovaný stav všech fixtures
2. Záložka **"Scény"**
3. Klikněte "Vytvořit scénu"
4. Pojmenujte a uložte
5. Vyvoláte kliknutím na scénu

### 4. Automatizované efekty

**Preset efekty:**
1. Záložka **"Efekty"**
2. Vytvořte nový efekt
3. Vyberte typ (Chase, Strobe, Rainbow...)
4. Nastavte rychlost a intenzitu
5. Vyberte fixtures
6. Spusťte efekt

**Visual Block Programming:**
1. Vytvořte efekt a zvolte typ "Bloky"
2. Přetáhněte bloky z knihovny do programu
3. Nastavte parametry každého bloku
4. Použijte loops a podmínky
5. Spusťte vlastní efekt

### 5. Připojení k DMX síti

1. Záložka **"Připojení"**
2. Vyberte protokol (Art-Net/sACN/USB)
3. Zadejte IP adresu a port
4. Konfigurujte universe a send rate
5. Volitelně uložte jako profil
6. Klikněte "Připojit"
7. Sledujte status a packet counter

### 6. Custom Page Builder

1. Záložka **"Moje stránka"**
2. Klikněte "Upravit layout"
3. Přetáhněte bloky z knihovny
4. Nastavte vazby na fixtures/kanály
5. Uložte vlastní rozhraní
6. Přepněte do režimu ovládání

---

## 🛠️ Technologie

### Frontend Framework
- **React 19** - UI knihovna s nejnovějšími features
- **TypeScript 5.7** - Type-safe development
- **Vite 7** - Rychlý build tool s nejnovějšími optimalizacemi

### UI Components
- **Radix UI** - Primitives pro přístupné komponenty
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Animace a transitions
- **Phosphor Icons** - Moderní icon set

### State Management
- **@github/spark/hooks** - KV store pro persistent state
- **React hooks** - Local state management

### PWA
- **Manifest.json** - PWA konfigurace
- **Service Worker** - Offline caching
- **Meta tags** - Mobile optimization

---

## 🎨 Design system

### Barevná paleta
- **Primary**: Deep Cyan `oklch(0.65 0.15 210)` - Digitální/DMX technologie
- **Accent**: Magenta `oklch(0.65 0.20 330)` - Divadelní osvětlení
- **Background**: Dark Charcoal `oklch(0.15 0 0)` - Tmavé prostředí pro noční vidění
- **Cards**: Darker Panel `oklch(0.20 0 0)` - Vrstvení a hloubka

### Typografie
- **Font**: Inter - Technická a čitelná
- **Hierarchy**: Bold pro nadpisy, Tabular pro DMX hodnoty
- **Sizes**: 12px-24px s tight/normal/relaxed spacing

### Design principy
- **Tactile** - Responzivní a fyzické ovládání
- **Professional** - Spolehlivost očekávaná v produkčním prostředí
- **Intuitive** - Komplexní kontrola přístupná přes jasnou hierarchii

---

## 📁 Struktura projektu

```
dmx-512-controller/
├── src/
│   ├── components/
│   │   ├── controls/           # Kontrolní UI bloky
│   │   ├── ui/                 # Radix UI komponenty
│   │   ├── FixturesView.tsx    # Správa fixtures
│   │   ├── ScenesView.tsx      # Správa scén
│   │   ├── EffectsView.tsx     # Efekty
│   │   ├── MotorsView.tsx      # Motory a serva
│   │   ├── ConnectionView.tsx  # Síťové připojení
│   │   ├── SetupView.tsx       # Konfigurace
│   │   ├── LiveControlView.tsx # Live kontrola
│   │   ├── BlockProgramming.tsx # Visual programming
│   │   └── CustomPageBuilder.tsx # Page builder
│   ├── lib/
│   │   └── types.ts            # TypeScript typy
│   ├── hooks/                  # Custom React hooks
│   ├── styles/                 # CSS soubory
│   └── App.tsx                 # Hlavní aplikace
├── public/
│   ├── icon.svg                # App ikona
│   ├── sw.js                   # Service Worker
│   └── pwa-install.js          # PWA install prompt
├── manifest.json               # PWA manifest
├── package.json                # Dependencies
└── vite.config.ts              # Vite konfigurace
```

---

## 🔧 Vývoj

### Dostupné skripty

```bash
npm run dev          # Development server s hot reload
npm run build        # Production build
npm run preview      # Preview production buildu
npm run lint         # ESLint kontrola kódu
npm run optimize     # Vite optimalizace
```

### Doporučený workflow

1. Fork repozitáře
2. Vytvoření feature branch (`git checkout -b feature/amazing-feature`)
3. Commit změn (`git commit -m 'Add amazing feature'`)
4. Push do branch (`git push origin feature/amazing-feature`)
5. Otevření Pull Request

### Code Style

- **TypeScript** pro type safety
- **ESLint** pro code quality
- **Komponenty** - Funkční komponenty s hooks
- **Naming** - PascalCase pro komponenty, camelCase pro funkce

---

## 📖 Dokumentace

- **[PRD.md](PRD.md)** - Product Requirements Document s kompletním designem
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Návod na deployment
- **[ANDROID_SETUP.md](ANDROID_SETUP.md)** - Nastavení pro Android
- **[QUICKSTART_ANDROID.md](QUICKSTART_ANDROID.md)** - Rychlý start pro Android
- **[SECURITY.md](SECURITY.md)** - Security policy
- **[ICONS_README.md](ICONS_README.md)** - Dokumentace ikon

---

## 🤝 Přispívání

Uvítáme příspěvky! Přečtěte si prosím naše contributing guidelines:

1. **Fork** projektu
2. **Vytvořte** feature branch
3. **Testujte** své změny
4. **Dokumentujte** nové features
5. **Otevření** Pull Request

### Oblasti pro přispění
- 🐛 Bug fixes a reporty
- ✨ Nové funkce a vylepšení
- 📝 Dokumentace a překlady
- 🎨 UI/UX vylepšení
- 🧪 Testy a quality assurance

---

## 📄 Licence

Tento projekt je licencován pod MIT License - viz [LICENSE](LICENSE) soubor pro detaily.

Copyright GitHub, Inc.

---

## 🙏 Poděkování

- **GitHub Spark** - Framework pro rapid development
- **Radix UI** - Přístupné UI primitives
- **Phosphor Icons** - Krásná sada ikon
- **Open Source komunita** - Za neuvěřitelné nástroje

---

## 📞 Kontakt & Podpora

- **Issues**: [GitHub Issues](https://github.com/atrep123/dmx-512-controller/issues)
- **Discussions**: [GitHub Discussions](https://github.com/atrep123/dmx-512-controller/discussions)

---

## 🌟 Star History

Pokud se vám tento projekt líbí, dejte mu hvězdičku! ⭐

---

<div align="center">
  
**Vytvořeno s ❤️ pro stage lighting professionals**

[🎭 Demo](https://atrep123.github.io/dmx-512-controller) • [📖 Dokumentace](PRD.md) • [🐛 Reportovat bug](https://github.com/atrep123/dmx-512-controller/issues)

</div>

TIP: ETag & sparse

```
etag=$(curl -sI http://localhost:8080/state | grep -i ETag | awk '{print $2}')
curl -s -H "If-None-Match: $etag" http://localhost:8080/state -o /dev/null -w "%{http_code}\n"  # očekáváme 304
curl -s "http://localhost:8080/state?sparse=1" | jq
```
