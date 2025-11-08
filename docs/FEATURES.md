# Co všechno náš projekt umí?

> Kompletní přehled funkcí a schopností DMX 512 Controller aplikace

## 📋 Obsah

- [Ovládání osvětlení](#ovládání-osvětlení)
- [Motion Control](#motion-control)
- [Scény a efekty](#scény-a-efekty)
- [Síťové připojení](#síťové-připojení)
- [Projekty a zálohy](#projekty-a-zálohy)
- [Hardware integrace](#hardware-integrace)
- [Progressive Web App](#progressive-web-app)
- [Pokročilé funkce](#pokročilé-funkce)
- [AI automatizace](#ai-automatizace)
- [Technické schopnosti](#technické-schopnosti)
- [Kapacity a limity](#kapacity-a-limity)
- [Bezpečnost](#bezpečnost)
- [Lokalizace](#lokalizace)
- [Související dokumentace](#související-dokumentace)
- [Shrnutí](#shrnutí)

---

## 🎨 Ovládání osvětlení

### Základní ovládání
- **Individuální DMX kanály** - Přesná kontrola každého kanálu (0-255)
- **Fádery** - Plynulé nastavování hodnot pomocí touch sliderů
- **RGB Color Picker** - Vizuální výběr barev s automatickým převodem na DMX
- **RGBW podpora** - Rozšířená kontrola pro čtyřkanálové fixtures
- **Dimmer control** - Globální jas pro všechny fixtures

### Správa fixtures
- **Přidávání fixtures** - Definice světelných zařízení s DMX adresami
- **Fixture profily** - Podpora různých typů světel (PAR, Moving Head, Strobe, atd.)
- **Kanálové mapování** - Konfigurace funkcí jednotlivých kanálů
- **Seskupování fixtures** - Vytváření skupin pro společné ovládání
- **Universe management** - Správa více DMX universí (až 512 kanálů každý)

### Pokročilá světelná kontrola
- **Master dimmer** - Globální ovládání intenzity
- **Blackout** - Okamžité zhasnutí všech světel
- **Fade time** - Konfigurovatelný čas přechodů mezi stavy
- **Live preview** - Náhled změn v reálném čase
- **Value monitoring** - Sledování aktuálních hodnot všech kanálů

---

## ⚙️ Motion Control

### Stepper motory
- **16-bit přesnost** - Vysokopřesné polohování
- **Rychlost kontrola** - Nastavení rychlosti otáčení
- **Směr rotace** - Kontrola směru pohybu
- **Homing funkce** - Návrat do výchozí polohy
- **DMX mapping** - Mapování pozice na DMX kanály

### Servo motory
- **Úhlová kontrola** - Polohování 0-180°
- **DMX mapování** - Převod úhlu na DMX hodnoty
- **Plynulé pohyby** - Smooth transitions mezi pozicemi
- **Multi-servo podpora** - Ovládání více serv současně

### Joystick ovládání
- **Pan/Tilt control** - Intuitivní ovládání pohybu
- **Touch interface** - Dotykové ovládání pro mobilní zařízení
- **Rychlostní nastavení** - Citlivost joysticku
- **Center reset** - Automatický návrat do středu

---

## 🎬 Scény a efekty

### Správa scén
- **Uložení scén** - Kompletní snapshot všech DMX hodnot
- **Rychlé vyvolání** - Okamžité načtení uložené scény
- **Pojmenování scén** - Popisné názvy pro snadnou orientaci
- **Editace scén** - Úprava existujících scén
- **Kopírování scén** - Duplicitní scény pro variace
- **Mazání scén** - Správa archivu scén
- **Fade přechody** - Plynulé přechody mezi scénami

### Vestavěné efekty
Aplikace obsahuje **14 předpřipravených efektů**:

1. **Chase** - Postupné rozsvěcování fixtures
2. **Strobe** - Efekt stroboskopu s nastavitelnou frekvencí
3. **Rainbow** - Plynulý přechod přes barevné spektrum
4. **Fade** - Postupné ztmavování a rozsvěcování
5. **Sweep** - Pohyblivý světelný paprsek
6. **Color Change** - Přepínání mezi barvami
7. **Pulse** - Pulzující efekt
8. **Sparkle** - Náhodné blikání
9. **Theater Chase** - Divadelní chase efekt
10. **Fire** - Simulace ohně
11. **Water** - Simulace vodní hladiny
12. **Lightning** - Efekt blesku
13. **Police** - Střídavé červené a modré světlo
14. **Disco** - Náhodné barevné kombinace

### Parametry efektů
- **Rychlost** - Nastavení tempa efektu
- **Intenzita** - Síla efektu
- **Výběr fixtures** - Které fixtures efekt ovlivní
- **Barvy** - Výběr barevné palety
- **Opakování** - Loop nebo jednorázové přehrání
- **Fade in/out** - Plynulé spuštění a zastavení

### Visual Block Programming
- **Drag-and-drop editor** - Vizuální programování vlastních efektů
- **Programovací bloky**:
  - **Akční bloky** - Nastavení barev, dimmer, pozice
  - **Loop bloky** - Opakování akcí
  - **Podmínkové bloky** - If/else logika
  - **Časové bloky** - Delay a timing
  - **Matematické bloky** - Výpočty a transformace
- **Náhled kódu** - Zobrazení generovaného programu
- **Debugování** - Step-by-step vykonávání
- **Export/Import** - Sdílení vlastních efektů

---

## 🌐 Síťové připojení

### Art-Net protokol
- **Art-Net 4** - Plná podpora DMX over Ethernet
- **Broadcast režim** - Vysílání do celé sítě
- **Unicast režim** - Cílené vysílání na konkrétní IP
- **Multi-universe** - Podpora více universí současně
- **FPS control** - Nastavení frame rate (1-120 fps)
- **Packet monitoring** - Sledování odeslaných paketů

### sACN (E1.31)
- **E1.31 standard** - Streaming ACN protokol
- **Multicast/Unicast** - Oba režimy podporovány
- **Priority nastavení** - Priorita zdrojů
- **Universe discovery** - Automatická detekce
- **Synchronizace** - Sync packets podpora

### USB DMX
- **Plug & Play** - Automatická detekce USB DMX zařízení
- **Multiple devices** - Podpora více USB rozhraní
- **Driver kompatibilita** - FTDI čipy (FT232, atd.)
- **Baudrate konfigurace** - Přizpůsobitelná rychlost
- **Diagnostika** - Status monitoring USB spojení

### Profily připojení
- **Uložení profilů** - Různá nastavení pro různá místa
- **Rychlé přepínání** - Okamžitá změna konfigurace
- **Export/Import** - Sdílení profilů mezi zařízeními
- **Venue management** - Správa lokací a jejich nastavení

### Monitoring připojení
- **Real-time status** - Aktuální stav připojení
- **Packet counter** - Počet odeslaných paketů
- **Latence měření** - Sledování odezvy systému
- **Error reporting** - Hlášení problémů s připojením
- **Network diagnostics** - Nástroje pro testování sítě

---

## 📦 Projekty a zálohy

### Správa projektů
- **Nezávislé projekty** - Oddělené konfigurace pro různé show
- **Metadata projektů**:
  - Název projektu
  - Venue (místo konání)
  - Datum a čas
  - Poznámky a popis
- **Přepínání projektů** - Rychlé načtení jiného projektu
- **Vytváření projektů** - Nový projekt z UI
- **Editace projektů** - Úprava informací a nastavení
- **Mazání projektů** - Správa archivu

### Cloud zálohy
- **Automatické zálohy** - Periodické ukládání (konfigurovatelný interval)
- **Manuální zálohy** - Záloha na vyžádání
- **Poskytovatelé**:
  - **Lokální disk** - Ukládání na server
  - **Amazon S3** - Cloud storage
- **Šifrování záloh** - Fernet šifrování pro bezpečnost
- **Historie záloh** - Přehled všech záloh s:
  - Časovou značkou
  - Velikostí
  - Providerem
  - Příznaky šifrování
- **Obnova záloh** - Restore z libovolného snapshotu
- **Data Management UI** - Grafické rozhraní pro správu záloh

---

## 🔌 Hardware integrace

### Enttec DMX USB PRO
- **Přímý výstup** - Nativní podpora Enttec USB rozhraní
- **Autodetekce** - Automatické nalezení zařízení
- **Konfigurace**:
  - USB vendor/product IDs
  - Baudrate (default 57600)
  - FPS (default 40)
  - Scan interval (default 5s)
- **Diagnostické endpointy**:
  - `GET /usb/devices` - Seznam zařízení
  - `POST /usb/refresh` - Nový scan portů
  - `POST /usb/reconnect` - Znovupřipojení bez restartu
- **UI indikace** - Status USB mostu ve frontendu
- **Auto-reconnect** - Automatické obnovení spojení při výpadku

### ESP32 DMX Gateway
- **Firmware v repozitáři** - `firmware/esp32-dmx-gateway/`
- **Hardware**: ESP32 + SparkFun DMX Shield
- **Funkce**:
  - Čtení DMX universa
  - Odesílání změn jako `dmx.patch` na backend
  - Napojení DMX pultů bez USB driveru
- **Konfigurace**:
  - WiFi připojení
  - Backend URL
  - DMX universe číslo
- **Protokol** - Websocket/HTTP komunikace s backendem

### DMX Input
- **Čtení DMX** - Příjem DMX signálu jako vstup
- **Konfigurace**:
  - `DMX_INPUT_ENABLED=true`
  - `DMX_INPUT_PORT=/dev/ttyUSB0`
- **Mapování** - RGB hodnoty z prvních tří kanálů
- **Live update** - Přeposlání do enginu v reálném čase
- **SparkFun Shield** - Podpora přímého připojení přes USB

---

## 📱 Progressive Web App

### Instalace a offline
- **Add to Home Screen** - Instalace na Android i iOS
- **Offline režim** - Plně funkční bez internetu
- **Service Worker** - Caching pro offline přístup
- **Auto-update** - Automatická aktualizace při dostupnosti nové verze
- **Storage** - Lokální ukládání dat a nastavení

### Mobilní optimalizace
- **Touch interface** - Velké ovládací prvky pro prsty
- **Responsive design** - Adaptace na různé velikosti obrazovek
- **Full-screen režim** - Spuštění bez browser chrome
- **Gestures** - Swipe a pinch-to-zoom
- **Haptic feedback** - Vibrační odezva (kde podporováno)

### PWA Features
- **Manifest.json** - PWA konfigurace s ikonami a barvami
- **Theme color** - Přizpůsobení systémové lišty
- **Display standalone** - Nativní app vzhled
- **Start URL** - Konfigurovatelná startovní stránka
- **Orientace** - Portrait/landscape podpora

### Výkon
- **Lazy loading** - Postupné načítání komponent
- **Code splitting** - Rozdělení kódu pro rychlejší načtení
- **Asset optimalizace** - Komprese obrázků a fontů
- **Virtual scrolling** - Efektivní vykreslování dlouhých seznamů

---

## 🎨 Pokročilé funkce

### Custom Page Builder
- **Vlastní layout** - Vytvoření personalizovaného ovládacího panelu
- **Drag-and-drop** - Přetahování UI bloků
- **Kontrolní bloky**:
  - **Faders** - Vertikální/horizontální slidery
  - **Tlačítka** - Spouštění scén a efektů
  - **Color pickers** - RGB/HSV výběr barev
  - **Pozice kontroly** - XY pads pro joystick
  - **Labels** - Texty a popisky
  - **Meters** - Vizualizace hodnot
  - **Groups** - Seskupení ovládacích prvků
- **Vazby na fixtures** - Propojení ovládacích prvků s fixtures/kanály
- **Responzivní grid** - Automatické uspořádání prvků
- **Export/Import** - Sdílení vlastních layoutů
- **Multiple pages** - Více vlastních stránek

### Live Control View
- **Real-time ovládání** - Okamžitá odezva
- **Multi-select** - Ovládání více fixtures současně
- **Grand Master** - Globální dimmer pro všechny světla
- **Preset palettes** - Rychlé přepínání barevných palet
- **Strobe control** - Dedikované ovládání stroboskopu
- **Speed control** - Rychlost přechodů a efektů

### Data Management
- **Export konfigurace** - Záloha všech nastavení
- **Import konfigurace** - Obnova z exportu
- **Reset do výchozích hodnot** - Tovární nastavení
- **Clear cache** - Vymazání dočasných dat
- **Version info** - Informace o verzi aplikace a backendu

### Monitoring a diagnostika
- **Live metrics** - Real-time metriky systému:
  - `cmds_total` - Celkový počet příkazů
  - `queue_depth` - Hloubka fronty
  - `ws_clients` - Počet připojených WebSocket klientů
  - `last_ms` - Latence posledního příkazu
- **Health check** - `/healthz` a `/readyz` endpointy
- **Debug panel** - Pokročilé debugovací informace
- **Network monitoring** - Sledování síťové aktivity
- **Performance metrics** - Měření výkonu aplikace

### OLA výstup (Open Lighting Architecture)
- **OLA integrace** - Výstup přes OLA framework
- **Konfigurace**:
  - `OUTPUT_MODE=ola`
  - `DMX_OLA_URL` (např. `http://localhost:9090/set_dmx`)
  - `DMX_OLA_FPS` (default 44)
  - `PATCH_FILE` - Mapování universí (YAML)
- **Debug endpoint** - `GET /universes/0/frame` (512-kanálový frame)
- **Metriky OLA**:
  - `dmx_core_ola_frames_total`
  - `dmx_core_ola_frames_skipped_total`
  - `dmx_core_ola_last_fps`
  - `dmx_core_ola_http_errors_total`
  - `dmx_core_ola_queue_depth`
- **Spolehlivost** - httpx.AsyncClient, timeout, fail-open

---

## 🤖 AI automatizace

### OpenAI Codex integrace
- **Agenční režim** - Automatické generování kódu
- **Konfigurace**:
  - Dokumentace v `docs/AI_AUTOMATION.md`
  - VS Code tasky v `.vscode/tasks.json`
  - API key konfigurace
- **Generování** - Automatická tvorba komponent a funkcí
- **Lokální skript** - `npm run ai:generate`
- **CI/Cron plány** - Automatické běhy

### AI výstup
- **Ukládání** - Nové soubory v `tmp/ai-output/`
- **Historie** - Metadata logy v `tmp/ai-history/`
- **Git ignore** - Oba adresáře ignorovány
- **Review** - Možnost kontroly před aplikací

### VS Code integrace
- **Hotové tasky**:
  - "AI: Generate via OpenAI API"
  - "AI: Codex full-auto"
- **Snadné spuštění** - Stačí doplnit API key

---

## 🛠️ Technické schopnosti

### Backend (Python FastAPI)
- **REST API** - Kompletní HTTP rozhraní
- **WebSocket** - Real-time obousměrná komunikace
- **MQTT podpora** - Message broker integrace
- **Asynchronní** - Vysoký výkon díky async/await
- **Validace** - Pydantic modely pro data
- **Metriky** - Prometheus-kompatibilní endpointy

### Frontend (React + TypeScript)
- **React 19** - Nejnovější verze frameworku
- **TypeScript 5.7** - Type-safe development
- **Vite** - Rychlý build a hot reload
- **Radix UI** - Přístupné UI komponenty
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Plynulé animace
- **Phosphor Icons** - Moderní ikony

### State Management
- **@github/spark/hooks** - Persistent KV store
- **React hooks** - Lokální state
- **WebSocket sync** - Synchronizace stavu s backendem
- **ETag podpora** - Efektivní caching

### Testování
- **Vitest** - Unit testy
- **React Testing Library** - Testování komponent
- **ESLint** - Kontrola kvality kódu
- **TypeScript** - Compile-time kontrola typů

### Build a nasazení
- **Vite build** - Optimalizovaný production bundle
- **Docker** - Kontejnerizace aplikace
- **Docker Compose** - Multi-service orchestrace
- **Caddy server** - Webserver pro statické soubory
- **Environment variables** - Flexibilní konfigurace

---

## 📊 Kapacity a limity

### DMX
- **Universa** - Podpora více universí současně
- **Kanály na universe** - 512 (DMX standard)
- **Hodnoty kanálů** - 0-255 (8-bit)
- **Refresh rate** - Konfigurovatelný (1-120 fps)

### Výkon
- **Fixtures** - Bez praktického limitu
- **Scény** - Neomezený počet
- **Efekty** - 14 vestavěných + vlastní
- **WebSocket klienti** - Několik desítek současně
- **Latence** - Typicky < 50ms

### Úložiště
- **Lokální storage** - Několik MB pro konfiguraci
- **Service Worker cache** - Offline assets
- **Cloud zálohy** - Závisí na provideru (S3, disk)

---

## 🔐 Bezpečnost

### Autentizace
- **API key** - Token-based autentizace
- **WebSocket token** - Query parameter nebo header
- **Konfigurace** - `VITE_API_KEY` proměnná
- **Skrytý token** - UI nikdy nezobrazuje klíč

### Šifrování
- **Fernet šifrování** - Pro cloud zálohy
- **HTTPS ready** - Podpora šifrované komunikace
- **Configuration key** - `CLOUD_BACKUP_ENCRYPTION_KEY`

### Bezpečné praktiky
- **Input validace** - Ochrana před neplatnými daty
- **CORS konfigurace** - Řízení přístupu
- **Environment variables** - Bezpečné ukládání secrets
- **No hardcoded secrets** - Vše přes konfiguraci

---

## 🌍 Lokalizace

### Jazyk
- **Primární**: Čeština
- **Dokumentace**: Kompletně česká
- **UI texty**: České popisy
- **Komentáře v kódu**: Angličtina/čeština mix

### Formátování
- **Datum/čas** - Český formát
- **Čísla** - České konvence
- **Měrné jednotky** - Stupně, procenta, ms

---

## 🔗 Související dokumentace

Podrobné informace najdete v následujících dokumentech:

- **[README.md](../README.md)** - Základní přehled a rychlý start
- **[USER_GUIDE.md](USER_GUIDE.md)** - Kompletní uživatelská příručka
- **[API.md](API.md)** - API dokumentace
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Architektura systému
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Návod na nasazení
- **[FAQ.md](FAQ.md)** - Často kladené otázky
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Řešení problémů
- **[AI_AUTOMATION.md](AI_AUTOMATION.md)** - AI automatizace
- **[PRD.md](PRD.md)** - Product Requirements Document

---

## 📝 Shrnutí

DMX 512 Controller je **komplexní profesionální řešení** pro ovládání stage osvětlení a motion systémů. Kombinuje:

✅ **Intuitivní mobilní rozhraní** (PWA)  
✅ **Pokročilou DMX kontrolu** (Art-Net, sACN, USB)  
✅ **Automatizované efekty** a vizuální programování  
✅ **Flexibilní hardware integrace** (Enttec, ESP32)  
✅ **Cloud zálohy** a správu projektů  
✅ **Offline režim** pro spolehlivý provoz  
✅ **AI automatizaci** pro rychlejší vývoj  
✅ **Open source** pod MIT licencí

Aplikace je navržena pro **profesionální použití** ve scénickém osvětlení, ale je dostatečně **přístupná** i pro začátečníky díky intuitivnímu rozhraní a pokročilým pomocným funkcím.

---

**Vytvořeno s ❤️ pro stage lighting professionals**

[🎭 Demo](https://atrep123.github.io/dmx-512-controller) • [📖 Dokumentace](README.md) • [🐛 Reportovat bug](https://github.com/atrep123/dmx-512-controller/issues)
