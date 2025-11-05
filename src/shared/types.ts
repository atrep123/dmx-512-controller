// Unified command/ack/state types for REST/WS/MQTT
// Note: These are client-side types. Backend should validate the same shapes via JSON Schema.

export type ULID = string;

export type EffectBlock = {
  type: string;
  // Additional fields depend on the effect block type; kept open for now.
  // Use a discriminated union in v1.2 when the block catalog stabilizes.
  [k: string]: unknown;
};

export type DmxPatchEntry = { ch: number; val: number };

export type Command =
  | {
      type: 'dmx.set';
      id: ULID;
      ts: number; // epoch ms
      universe: number;
      channel: number;
      value: number; // 0..255
    }
  | {
      type: 'dmx.patch';
      id: ULID;
      ts: number; // epoch ms
      universe: number;
      patch: DmxPatchEntry[];
    }
  | {
      type: 'scene.save';
      id: ULID;
      ts: number; // epoch ms
      name: string;
      snapshot: Record<number, number>; // channel -> value
    }
  | {
      type: 'scene.recall';
      id: ULID;
      ts: number; // epoch ms
      name: string;
    }
  | {
    type: 'effect.apply';
    id: ULID;
    ts: number; // epoch ms
    fixtureId: string;
    effect: EffectBlock[];
  }
  | {
    type: 'motor.move';
    id: ULID;
    ts: number; // epoch ms
    motorId: string;
    steps: number;
    speed?: number;
  };

export type Ack = { ack: ULID; accepted: boolean; reason?: string };

export type MotorState = { pos: number; status: 'idle' | 'moving' | 'error' };
export type EffectState = { running: boolean };

export type StateUpdate = {
  ts: number; // epoch ms
  universes: Record<number, Record<number, number>>; // universe->channel->value
  motors?: Record<string, MotorState>;
  effects?: Record<string, EffectState>;
};

// WebSocket channels
// client->server: Command
// server->client: Ack | StateUpdate

export type WsFromClient = Command;
export type WsToClient = Ack | StateUpdate;

// REST parity
// POST /command -> Ack
// GET /state   -> StateUpdate (snapshot)

export type RestPostCommandRequest = Command;
export type RestPostCommandResponse = Ack;
export type RestGetStateResponse = StateUpdate;

// MQTT topics (JSON payloads with the same shapes)
// dmx/command, dmx/state, dmx/ack

