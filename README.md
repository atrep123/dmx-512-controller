<div align="center">

# đźŽ­ DMX 512 Controller

### ProfesionĂˇlnĂ­ DMX osvÄ›tlenĂ­ a motion kontrolĂ©r pro mobilnĂ­ zaĹ™Ă­zenĂ­

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-success.svg)](manifest.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://reactjs.org/)

[đźš€ Demo](https://atrep123.github.io/dmx-512-controller) • [đź"– Dokumentace](docs/FEATURES.md) • [đź›  NastavenĂ­](docs/DEPLOYMENT_GUIDE.md) • [đź'ˇ NĂˇpovÄ›da](docs/USER_GUIDE.md)

</div>

---

## 🎯 O projektu

**DMX 512 Controller** je modernĂ­ webovĂˇ aplikace pro profesionĂˇlnĂ­ Ĺ™Ă­zenĂ­ stage osvÄ›tlenĂ­, motorĹŻ a efektĹŻ. NavrĹľeno jako **Progressive Web App (PWA)** s intuitivnĂ­m dotykovĂ˝m rozhranĂ­m optimalizovanĂ˝m pro pouĹľitĂ­ na mobilnĂ­ch zaĹ™Ă­zenĂ­ch (Android, iOS) i desktopech.

**IdĂ©lnĂ­ pro:**
- đźŽ­ **DivadelnĂ­ produkce** - komplexnĂ­ Ĺ™Ă­zenĂ­ osvÄ›tlenĂ­ a efektĹŻ
- đźŽ¤ **Koncerty a eventy** - rychlĂ© pĹ™epĂ­nĂˇnĂ­ scĂ©n a dynamickĂ© efekty
- đźŽµ **DJ sety** - real-time kontrola osvÄ›tlenĂ­ synchronizovanĂˇ s hudbou
- đź"ą **MobilnĂ­ aplikace** - ovlĂˇdĂˇnĂ­ odkudkoli pomocĂ­ tabletu nebo telefonu

---

## ✨ Klíčové funkce

<table>
<tr>
<td width="50%">

### đźŽ¨ OsvÄ›tlenĂ­
- **512 DMX kanĂˇlĹŻ** na universe
- **RGB/RGBW** color picker
- **Fixture management** s profily
- **Live preview** zmÄ›n v reĂˇlnĂ©m ÄŤase
- **Blackout** & master dimmer

</td>
<td width="50%">

### đźŽ¬ ScĂ©ny & Efekty
- **14 pĹ™edpĹ™ipavenĂ˝ch efektĹŻ**
- **Visual block programming**
- **UklĂˇdĂˇnĂ­ scĂ©n** s fade pĹ™echody
- **Editace za bÄ›hu**
- **Custom efekty** drag & drop

</td>
</tr>
<tr>
<td>

### âš™ď¸Ź Motion Control
- **Stepper motory** (16-bit pĹ™esnost)
- **Servo motory** (0-180°)
- **Joystick ovlĂˇdĂˇnĂ­** Pan/Tilt
- **DMX mapovĂˇnĂ­** pozic
- **Homing funkce**

</td>
<td>

### đźŚ SĂ­Ĺ¥ovĂ© pĹ™ipojenĂ­
- **Art-Net** & **sACN (E1.31)**
- **USB DMX** (Enttec PRO)
- **ESP32 gateway** podpora
- **Profily venues** pro rĹŻznĂˇ mĂ­sta
- **Real-time monitoring**

</td>
</tr>
<tr>
<td>

### đź"± Progressive Web App
- **Offline reĹľim** bez internetu
- **Instalace** na plochu
- **Full-screen** reĹľim
- **Touch optimalizace**
- **ResponzivnĂ­ design**

</td>
<td>

### đź"¦ Pokročilé funkce
- **Custom page builder**
- **Projekty & cloud zĂˇlohy** (S3)
- **ĹšifrovĂˇnĂ­ dat** (Fernet)
- **AI automatizace** (OpenAI)
- **MQTT & WebSocket** sync

</td>
</tr>
</table>

đź"‹ **[KompletnĂ­ pĹ™ehled vĹˇech funkcĂ­ â†'](docs/FEATURES.md)**

---

## đźš€ RychlĂ˝ start

### PĹ™edpoklady

- **Node.js** 18+ a npm
- ModernĂ­ webovĂ˝ prohlĂ­ĹľeÄŤ (Chrome, Safari, Firefox)
- Pro fyzickĂ© DMX: Art-Net, sACN nebo USB DMX rozhranĂ­

### Instalace

```bash
# KlonovĂˇnĂ­ repozitĂˇĹ™e
git clone https://github.com/atrep123/dmx-512-controller.git
cd dmx-512-controller

# Instalace zĂˇvislostĂ­
npm ci

# LokĂˇlnĂ­ vĂ˝voj
npm run dev
```

Aplikace bÄ›ĹľĂ­ na `http://localhost:5173`

### Docker Compose

```bash
cd infra
docker-compose up --build
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8080`
- **MQTT Broker**: `localhost:1883`

---

## đź"– Dokumentace

| Dokument | Popis |
|----------|-------|
| [**FEATURES.md**](docs/FEATURES.md) | Kompletní přehled všech funkcí |
| [**USER_GUIDE.md**](docs/USER_GUIDE.md) | Uživatelská příručka |
| [**DEPLOYMENT_GUIDE.md**](docs/DEPLOYMENT_GUIDE.md) | Nasazení do produkce |
| [**API.md**](docs/API.md) | API dokumentace |
| [**ARCHITECTURE.md**](docs/ARCHITECTURE.md) | Architektura systému |
| [**FAQ.md**](docs/FAQ.md) | Často kladené otázky |
| [**TROUBLESHOOTING.md**](docs/TROUBLESHOOTING.md) | Řešení problémů |

---

## 🔌 Hardwarová integrace

### USB DMX (Enttec DMX USB PRO)

Backend podporuje pĹ™Ă­mĂ˝ vĂ˝stup pĹ™es Enttec DMX USB PRO s autodetekci zaĹ™Ă­zenĂ­.

```bash
# V .env nebo environment
OUTPUT_MODE=enttec
USB_ENABLED=true
USB_BAUDRATE=57600
USB_FPS=40
```

**Diagnostika:** `GET /usb/devices`, `POST /usb/refresh`, `POST /usb/reconnect`

### ESP32 DMX Gateway

Arduino sketch pro ESP32 + SparkFun DMX Shield v `firmware/esp32-dmx-gateway/`.

- ÄŚte DMX univerzum
- OdesĂ­lĂˇ zmÄ›ny na backend
- NapojenĂ­ DMX pultĹŻ bez USB

### DMX Input

```bash
DMX_INPUT_ENABLED=true
DMX_INPUT_PORT=/dev/ttyUSB0
```

Server mapuje RGB hodnoty z prvnĂ­ch tĹ™Ă­ kanĂˇlĹŻ do enginu.

---

## đź'ˇ PouĹľitĂ­

### 1. NastavenĂ­ Universe a Fixtures

1. ZĂˇloĹľka **"NastavenĂ­"** → **"PĹ™idat Universe"**
2. PĹ™idejte fixtures s DMX adresami
3. Nastavte typy a kanĂˇly

### 2. OvlĂˇdĂˇnĂ­ osvÄ›tlenĂ­

1. ZĂˇloĹľka **"Kontrola"** nebo **"SvĂ­tidla"**
2. Vyberte fixture
3. PouĹľijte fĂˇdery nebo color picker

### 3. ScĂ©ny a efekty

1. Nastavte poĹľadovanĂ˝ stav
2. ZĂˇloĹľka **"ScĂ©ny"** → **"VytvoĹ™it scĂ©nu"**
3. Pro efekty: **"Efekty"** → vyberte typ

### 4. PĹ™ipojenĂ­ k DMX sĂ­ti

1. ZĂˇloĹľka **"PĹ™ipojenĂ­"**
2. Vyberte protokol (Art-Net/sACN/USB)
3. Zadejte IP adresu a port
4. **"PĹ™ipojit"**

---

## đź› ď¸Ź Technologie

**Frontend:**
- React 19 + TypeScript 5.7
- Vite build tool
- Tailwind CSS 4
- Radix UI komponenty
- Framer Motion animace

**Backend:**
- Python FastAPI
- AsyncIO pro vysokĂ˝ vĂ˝kon
- MQTT & WebSocket
- Pydantic validace

**Infrastruktura:**
- Docker & Docker Compose
- Caddy web server
- Mosquitto MQTT broker
- S3 cloud storage

---

## đź"¦ Projekty & Cloud zĂˇlohy

```bash
# Aktivace projektĹŻ
PROJECTS_ENABLED=true

# Cloud backup
CLOUD_BACKUP_ENABLED=true
CLOUD_BACKUP_PROVIDER=s3  # nebo 'local'
CLOUD_BACKUP_ENCRYPTION_KEY=your-fernet-key
CLOUD_BACKUP_AUTO_INTERVAL=60  # minuty
```

**API endpointy:**
- `GET/POST /projects` - SprĂˇva projektĹŻ
- `POST /projects/{id}/select` - PĹ™epnutĂ­ projektu
- `GET/POST /projects/{id}/backups` - ZĂˇlohy
- `POST /projects/{id}/restore` - ObnvenĂ­

---

## đź¤– AI Automatizace

Integrace s OpenAI Codex pro automatickĂ© generovĂˇnĂ­ kĂłdu.

```bash
npm run ai:generate
```

**Konfigurace:**
- `docs/AI_AUTOMATION.md` - dokumentace
- `.vscode/tasks.json` - VS Code tasky
- VĂ˝stup: `tmp/ai-output/`
- Historie: `tmp/ai-history/`

---

## đź§Ş Testování a kvalita

```bash
npm run lint          # ESLint kontrola
npm run typecheck     # TypeScript ověření
npm run test          # Vitest unit testy
npm run build         # Production build
npm run preview       # Preview buildu
```

---

## đź"„ Licence

Tento projekt je licencovĂˇn pod **MIT License** - viz [LICENSE](LICENSE) soubor pro detaily.

---

## 👨‍💻 Autor & Kontakt

**Projekt vytvořen pro [ActionProps](https://actionprops.cz/)**

- **Autor:** Filip Jelen
- **Email:** [atrep.filip1@gmail.com](mailto:atrep.filip1@gmail.com)
- **GitHub:** [@atrep123](https://github.com/atrep123)

---

## đź™Ź PodÄ›kovĂˇnĂ­

- **GitHub Spark** - Framework pro rapid development
- **Radix UI** - PĹ™Ă­stupnĂ© UI primitives
- **Phosphor Icons** - KrĂˇsnĂˇ sada ikon
- **Open Source komunita** - Za neuvÄ›Ĺ™itelnĂ© nĂˇstroje

---

## 🐛 Podpora & PĹ™ispÄ›nĂ­

- **Issues:** [GitHub Issues](https://github.com/atrep123/dmx-512-controller/issues)
- **Discussions:** [GitHub Discussions](https://github.com/atrep123/dmx-512-controller/discussions)
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md)

Pokud se vĂˇm tento projekt lĂ­bĂ­, dejte mu hvÄ›zdiÄŤku! â­

---

<div align="center">

**VytvoĹ™eno s âť¤ď¸Ź pro stage lighting professionals**

[đźŽ­ Demo](https://atrep123.github.io/dmx-512-controller) • [đź"– Docs](docs/FEATURES.md) • [đź› Bug Report](https://github.com/atrep123/dmx-512-controller/issues)

</div>
