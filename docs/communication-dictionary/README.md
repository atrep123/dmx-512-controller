# Komunikační Slovník - Communication Dictionary

Unified communication dictionary pro všechny komponenty DMX-512 Controller systému.

## Účel

Tento slovník zajišťuje, že všechny komponenty systému (Android app, server, ESP32, Portenta, DMX receiver) používají stejnou terminologii, datové struktury a protokoly pro vzájemnou komunikaci.

## Obsah

1. [Message Types](./message-types.md) - Typy zpráv mezi komponenty
2. [Data Structures](./data-structures.md) - Společné datové struktury
3. [Protocol Constants](./protocol-constants.md) - Konstanty pro protokoly
4. [Error Codes](./error-codes.md) - Chybové kódy a jejich významy
5. [Command Reference](./command-reference.md) - Seznam všech příkazů
6. [Event Reference](./event-reference.md) - Seznam všech eventů
7. [Status Codes](./status-codes.md) - Stavové kódy

## Základní Principy

### 1. Konzistence

Všechny komponenty **MUSÍ** používat stejné:
- Názvy polí (field names)
- Datové typy
- Jednotky (units)
- Rozsahy hodnot (value ranges)

### 2. Verzování

Každá zpráva obsahuje verzi protokolu:
```json
{
  "version": "1.0.0",
  "type": "command",
  "payload": {...}
}
```

### 3. Zpětná Kompatibilita

Nové verze musí být zpětně kompatibilní nebo obsahovat migrační cestu.

## Použití

### Pro TypeScript/JavaScript (Android App, Server)

```typescript
import { 
  CommandMessage, 
  SetChannelCommand,
  MessageType 
} from '@dmx-controller/protocol';

const command: SetChannelCommand = {
  command: 'setChannel',
  universe: 1,
  channel: 1,
  value: 255
};
```

### Pro C++ (ESP32, Portenta, DMX Receiver)

```cpp
#include "dmx_protocol.h"

DMXCommand cmd;
cmd.type = CMD_SET_CHANNEL;
cmd.universe = 1;
cmd.channel = 1;
cmd.value = 255;
```

## Protokol Specifikace

### DMX-512

- **Channels per Universe**: 512 (1-512)
- **Value Range**: 0-255 (8-bit unsigned)
- **Break Time**: 88-120 μs
- **Mark After Break**: 8-16 μs
- **Baud Rate**: 250000 (250 kbaud)
- **Frame Rate**: 1-44 Hz

### Art-Net

- **Protocol Version**: 14
- **Port**: UDP 6454
- **Universe Range**: 0-32767
- **Packet Size**: 530 bytes max
- **OpCode DMX**: 0x5000

### sACN (E1.31)

- **Protocol**: ANSI E1.31-2018
- **Port**: UDP 5568
- **Universe Range**: 1-63999
- **Multicast**: 239.255.0.0/16
- **Priority Range**: 0-200

### WebSocket (App ↔ Server)

- **Protocol**: WebSocket (RFC 6455)
- **Message Format**: JSON
- **Heartbeat**: 30 seconds
- **Reconnect**: Exponential backoff

## Odkazy na Detaily

Každý soubor v tomto adresáři obsahuje detailní specifikaci:

- **message-types.md** - Všechny typy zpráv a jejich struktura
- **data-structures.md** - Definice všech datových struktur
- **protocol-constants.md** - Všechny konstanty používané v protokolech
- **error-codes.md** - Kompletní seznam chybových kódů
- **command-reference.md** - Detailní popis všech příkazů
- **event-reference.md** - Detailní popis všech eventů
- **status-codes.md** - HTTP a custom status kódy

## Aktualizace Slovníku

Při přidávání nových funkcí:

1. Aktualizujte relevantní soubor ve slovníku
2. Přidejte verzi, kdy byla změna provedena
3. Dokumentujte breaking changes
4. Aktualizujte všechny implementace
5. Přidejte testy pro nové message typy

## Version History

- **1.0.0** (2025-01-11) - Iniziální verze slovníku
