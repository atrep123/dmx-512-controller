import type { Command, Ack } from '@/shared/types';
import { notifyAck } from '@/lib/transport';
import { isTestEnv } from '@/lib/isTestEnv';

export type RgbStateMsg = { type: 'state'; r: number; g: number; b: number; seq: number };
type PongMsg = { type: 'pong'; ts?: number };
type LegacyAckMsg = { type: 'ack'; cmdId?: string };
type ErrMsg = { type: 'err'; code?: number; message?: string };
type AnyMsg = RgbStateMsg | PongMsg | LegacyAckMsg | Ack | ErrMsg | Record<string, unknown>;

export type ServerClientOptions = {
  url?: string;
  token?: string;
  maxBackoffMs?: number;
  pingSec?: number;
  on401?: () => void;
  onState?: (s: RgbStateMsg) => void;
  onConnect?: () => void;
  onDisconnect?: (event?: CloseEvent) => void;
  onAck?: (ack: Ack) => void;
};

export type ServerClient = {
  setRgb: (r: number, g: number, b: number) => void;
  sendCommand?: (cmd: Command) => void;
  close: () => void;
};

export function createServerClient(opts: ServerClientOptions): ServerClient {
  const url = opts.url ?? (import.meta.env.VITE_WS_URL ?? 'ws://localhost:5173/ws');
  const token = opts.token ?? (import.meta.env.VITE_API_KEY ?? 'demo-key');
  const maxBackoff = Math.max(1000, opts.maxBackoffMs ?? 10_000);
  const pingSec = Math.max(5, opts.pingSec ?? 15);

  let ws: WebSocket | null = null;
  let closed = false;
  let attempt = 0;
  let lastPong = Date.now();
  const queue: string[] = [];
  const timers: { reconnect?: number; ping?: number } = {};
  let reconnectAttempt = 0;

  function jitter(ms: number) {
    return Math.floor(ms * (0.6 + Math.random() * 0.8));
  }

  function backoff() {
    return Math.min(1000 * Math.pow(2, attempt), maxBackoff);
  }

  function clearTimers() {
    if (timers.reconnect !== undefined) {
      clearTimeout(timers.reconnect);
      timers.reconnect = undefined;
    }
    if (timers.ping !== undefined) {
      clearInterval(timers.ping);
      timers.ping = undefined;
    }
  }

  function flushQueue() {
    while (ws && ws.readyState === WebSocket.OPEN && queue.length > 0) {
      ws.send(queue.shift()!);
    }
  }

  function heartbeat() {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }
    ws.send(JSON.stringify({ type: 'ping', ts: Date.now() }));
    if (Date.now() - lastPong > (pingSec * 2 + 5) * 1000) {
      try {
        ws.close();
      } catch {
        // ignore
      }
    }
  }

  function scheduleReconnect(delayOverride?: number) {
    if (closed) {
      return;
    }
    if (timers.reconnect !== undefined) {
      return;
    }
    reconnectAttempt += 1;
    attempt += 1;
    if (isTestEnv()) {
      reconnectAttempt = 0;
      open();
      return;
    }
    const base = Math.min(1000 * Math.pow(2, attempt), maxBackoff);
    const delay = delayOverride ?? jitter(base);
    timers.reconnect = window.setTimeout(() => {
      timers.reconnect = undefined;
      reconnectAttempt = 0;
      open();
    }, delay);
  }

  function open() {
    clearTimers();
    const full = `${url}?token=${encodeURIComponent(token)}`;
    ws = new WebSocket(full);

    ws.onopen = () => {
      attempt = 0;
      lastPong = Date.now();
      flushQueue();
      timers.ping = window.setInterval(heartbeat, pingSec * 1000);
      opts.onConnect?.();
    };

    ws.onmessage = (ev) => {
      try {
        const message: AnyMsg = JSON.parse(ev.data);
        const type = (message as any).type as string | undefined;

        if (type === 'state' && opts.onState) {
          opts.onState(message as RgbStateMsg);
        } else if (type === 'pong') {
          lastPong = Date.now();
        } else if (type === 'err' && (message as ErrMsg).code === 401) {
          opts.on401?.();
        } else if ((message as Ack).ack !== undefined && typeof (message as Ack).accepted === 'boolean') {
          const ack = message as Ack;
          opts.onAck?.(ack);
          try {
            notifyAck(ack);
          } catch (error) {
            if (import.meta.env.DEV) {
              console.warn('notify_ack_error', error);
            }
          }
        }
      } catch {
        // ignore malformed payloads
      }
    };

    ws.onclose = (event) => {
      clearTimers();
      opts.onDisconnect?.(event);
      if (!closed) {
        const delay = isTestEnv() ? Math.min(1000 * Math.pow(2, reconnectAttempt + 1), maxBackoff) : undefined;
        scheduleReconnect(delay);
      }
    };

    ws.onerror = () => {
      // handled by onclose
    };
  }

  open();

  return {
    setRgb(r: number, g: number, b: number) {
      // Map to unified dmx.patch on universe 0, channels 1..3
      const cmd: Command = {
        type: 'dmx.patch',
        id: crypto.randomUUID(),
        ts: Date.now(),
        universe: 0,
        patch: [
          { ch: 1, val: r },
          { ch: 2, val: g },
          { ch: 3, val: b },
        ],
      };
      const payload = JSON.stringify(cmd);
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(payload);
      } else {
        queue.push(payload);
      }
    },
    sendCommand(cmd: Command) {
      const payload = JSON.stringify(cmd);
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(payload);
      } else {
        queue.push(payload);
      }
    },
    close() {
      closed = true;
      clearTimers();
      try {
        ws?.close();
      } catch {
        // ignore
      }
      ws = null;
    },
  };
}
