# Error Codes - Chybové Kódy

Standardizované chybové kódy pro celý systém.

## Format

```
[KATEGORIE]_[SPECIFICKÝ_KÓD]
```

Např: `DMX_TIMEOUT`, `NET_CONNECTION_FAILED`

## DMX Errors (1000-1999)

| Kód | Číslo | Popis | Severity |
|-----|-------|-------|----------|
| `DMX_TIMEOUT` | 1001 | DMX signál se neobjevil v očekávaném čase | Warning |
| `DMX_INVALID_CHANNEL` | 1002 | Channel mimo rozsah 1-512 | Error |
| `DMX_INVALID_UNIVERSE` | 1003 | Universe mimo platný rozsah | Error |
| `DMX_INVALID_VALUE` | 1004 | Hodnota mimo rozsah 0-255 | Error |
| `DMX_FRAMING_ERROR` | 1005 | Chyba v DMX framing (break/MAB) | Warning |
| `DMX_OVERRUN` | 1006 | Buffer overrun | Error |
| `DMX_BREAK_TOO_SHORT` | 1007 | Break time < 88μs | Warning |
| `DMX_MAB_TOO_SHORT` | 1008 | MAB time < 8μs | Warning |
| `DMX_OUTPUT_FAILED` | 1009 | Nelze odeslat DMX data | Critical |

## Network Errors (2000-2999)

| Kód | Číslo | Popis | Severity |
|-----|-------|-------|----------|
| `NET_CONNECTION_FAILED` | 2001 | Připojení selhalo | Error |
| `NET_CONNECTION_LOST` | 2002 | Připojení ztraceno | Warning |
| `NET_TIMEOUT` | 2003 | Network timeout | Warning |
| `NET_INVALID_IP` | 2004 | Neplatná IP adresa | Error |
| `NET_INVALID_PORT` | 2005 | Neplatný port | Error |
| `NET_UDP_SEND_FAILED` | 2006 | UDP packet nelze odeslat | Error |
| `NET_SOCKET_ERROR` | 2007 | Socket error | Error |
| `NET_WIFI_DISCONNECTED` | 2008 | WiFi odpojeno | Warning |
| `NET_ETHERNET_LINK_DOWN` | 2009 | Ethernet kabel odpojen | Warning |

## Art-Net Errors (3000-3999)

| Kód | Číslo | Popis | Severity |
|-----|-------|-------|----------|
| `ARTNET_INVALID_PACKET` | 3001 | Neplatný Art-Net packet | Warning |
| `ARTNET_VERSION_MISMATCH` | 3002 | Nepodporovaná verze protokolu | Warning |
| `ARTNET_SEQUENCE_ERROR` | 3003 | Sequence number mimo pořadí | Info |
| `ARTNET_UNIVERSE_NOT_FOUND` | 3004 | Universe nebylo nalezeno | Error |

## sACN Errors (4000-4999)

| Kód | Číslo | Popis | Severity |
|-----|-------|-------|----------|
| `SACN_INVALID_PACKET` | 4001 | Neplatný sACN packet | Warning |
| `SACN_PRIORITY_CONFLICT` | 4002 | Konflikt priorit | Warning |
| `SACN_UNIVERSE_NOT_FOUND` | 4003 | Universe nebylo nalezeno | Error |
| `SACN_MULTICAST_JOIN_FAILED` | 4004 | Nelze joinout multicast skupinu | Error |

## Configuration Errors (5000-5999)

| Kód | Číslo | Popis | Severity |
|-----|-------|-------|----------|
| `CFG_INVALID_SETTINGS` | 5001 | Neplatné nastavení | Error |
| `CFG_SAVE_FAILED` | 5002 | Nelze uložit konfiguraci | Error |
| `CFG_LOAD_FAILED` | 5003 | Nelze načíst konfiguraci | Error |
| `CFG_VALIDATION_FAILED` | 5004 | Validace konfigurace selhala | Error |
| `CFG_MISSING_REQUIRED` | 5005 | Chybí povinné pole | Error |

## Hardware Errors (6000-6999)

| Kód | Číslo | Popis | Severity |
|-----|-------|-------|----------|
| `HW_MOTOR_STALLED` | 6001 | Motor zaseknutý | Critical |
| `HW_MOTOR_LIMIT_REACHED` | 6002 | Dosažen limit motoru | Warning |
| `HW_SERVO_ERROR` | 6003 | Servo chyba | Error |
| `HW_OVERTEMPERATURE` | 6004 | Přehřátí | Critical |
| `HW_UNDERVOLTAGE` | 6005 | Nízké napětí | Critical |
| `HW_OVERVOLTAGE` | 6006 | Vysoké napětí | Critical |
| `HW_SENSOR_ERROR` | 6007 | Chyba senzoru | Warning |
| `HW_MEMORY_FULL` | 6008 | Paměť plná | Error |

## Fixture Errors (7000-7999)

| Kód | Číslo | Popis | Severity |
|-----|-------|-------|----------|
| `FIX_NOT_FOUND` | 7001 | Fixture nebylo nalezeno | Error |
| `FIX_INVALID_ADDRESS` | 7002 | Neplatná DMX adresa | Error |
| `FIX_ADDRESS_OVERLAP` | 7003 | Překryv DMX adres | Error |
| `FIX_INVALID_CHANNEL_COUNT` | 7004 | Neplatný počet kanálů | Error |
| `FIX_UNIVERSE_FULL` | 7005 | Universe plný (>512 kanálů) | Error |

## Scene Errors (8000-8999)

| Kód | Číslo | Popis | Severity |
|-----|-------|-------|----------|
| `SCENE_NOT_FOUND` | 8001 | Scéna nenalezena | Error |
| `SCENE_SAVE_FAILED` | 8002 | Nelze uložit scénu | Error |
| `SCENE_LOAD_FAILED` | 8003 | Nelze načíst scénu | Error |
| `SCENE_INVALID_STATE` | 8004 | Neplatný stav scény | Error |

## Effect Errors (9000-9999)

| Kód | Číslo | Popis | Severity |
|-----|-------|-------|----------|
| `EFF_NOT_FOUND` | 9001 | Efekt nenalezen | Error |
| `EFF_START_FAILED` | 9002 | Nelze spustit efekt | Error |
| `EFF_ALREADY_RUNNING` | 9003 | Efekt již běží | Warning |
| `EFF_NO_FIXTURES` | 9004 | Žádné fixtures vybrány | Error |
| `EFF_INVALID_PARAMETER` | 9005 | Neplatný parametr efektu | Error |

## Authentication Errors (10000-10999)

| Kód | Číslo | Popis | Severity |
|-----|-------|-------|----------|
| `AUTH_INVALID_TOKEN` | 10001 | Neplatný token | Error |
| `AUTH_TOKEN_EXPIRED` | 10002 | Token expiroval | Error |
| `AUTH_UNAUTHORIZED` | 10003 | Neautorizováno | Error |
| `AUTH_INVALID_CREDENTIALS` | 10004 | Neplatné přihlašovací údaje | Error |
| `AUTH_PERMISSION_DENIED` | 10005 | Přístup odmítnut | Error |

## System Errors (11000-11999)

| Kód | Číslo | Popis | Severity |
|-----|-------|-------|----------|
| `SYS_OUT_OF_MEMORY` | 11001 | Nedostatek paměti | Critical |
| `SYS_WATCHDOG_RESET` | 11002 | Watchdog reset | Critical |
| `SYS_STACK_OVERFLOW` | 11003 | Stack overflow | Critical |
| `SYS_FILESYSTEM_ERROR` | 11004 | Chyba souborového systému | Error |
| `SYS_UNKNOWN_ERROR` | 11999 | Neznámá chyba | Error |

## Severity Levels

- **Info**: Informace, nevyžaduje akci
- **Warning**: Varování, systém může pokračovat
- **Error**: Chyba, operace selhala ale systém běží
- **Critical**: Kritická chyba, vyžaduje restart nebo zásah

## Error Response Format

### JSON (WebSocket/REST API)

```typescript
interface ErrorResponse {
  error: true;
  errorCode: string;           // "DMX_TIMEOUT"
  errorNumber: number;          // 1001
  errorMessage: string;         // "DMX signal not received"
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: number;            // Unix timestamp
  details?: any;                // Dodatečné informace
  originalRequest?: any;        // Původní request pokud relevantní
}
```

Příklad:
```json
{
  "error": true,
  "errorCode": "DMX_INVALID_CHANNEL",
  "errorNumber": 1002,
  "errorMessage": "Channel 513 is out of range (1-512)",
  "severity": "error",
  "timestamp": 1635789012345,
  "details": {
    "channel": 513,
    "universe": 1
  }
}
```

### C++ (Embedded)

```cpp
struct ErrorInfo {
  uint16_t errorCode;           // Error number
  uint8_t severity;             // 0=Info, 1=Warning, 2=Error, 3=Critical
  uint32_t timestamp;           // Unix timestamp
  char message[128];            // Error message
};

// Error codes jako enum
enum ErrorCode {
  ERR_DMX_TIMEOUT = 1001,
  ERR_DMX_INVALID_CHANNEL = 1002,
  ERR_DMX_INVALID_UNIVERSE = 1003,
  // ...
};
```

## Error Handling Guidelines

### Pro Aplikace (Android App, Server)

1. Logovat všechny errors
2. Zobrazit user-friendly zprávu
3. Nabídnout recovery akci pokud možné
4. Zaslat error report (volitelně)

### Pro Embedded (ESP32, Portenta)

1. Blink error LED s specifickým pattern
2. Logovat do serial port
3. Uložit do error log (pokud je místo)
4. Pokusit se o recovery
5. Watchdog reset při critical errors

## Recovery Actions

| Error | Suggested Recovery |
|-------|-------------------|
| `DMX_TIMEOUT` | Zkontrolovat připojení, restart výstupu |
| `NET_CONNECTION_LOST` | Auto-reconnect, fallback na lokální režim |
| `HW_OVERTEMPERATURE` | Snížit výkon, aktivovat cooling |
| `SYS_OUT_OF_MEMORY` | Free buffers, restart non-critical tasks |
| `AUTH_TOKEN_EXPIRED` | Auto-refresh token, re-login prompt |

## Error Logging

### Format Log Zprávy

```
[TIMESTAMP] [SEVERITY] [CODE] Message - Details
```

Příklad:
```
[2025-01-11 20:30:45] [ERROR] [DMX_TIMEOUT] DMX signal not received - Universe: 1, Last packet: 2s ago
```

### Log Rotation

- Android App: Max 100 messages in memory
- Server: Daily log files, keep last 30 days
- Embedded: Ring buffer 50 messages, save to flash on critical
