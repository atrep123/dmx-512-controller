import type { Command, Ack } from '@/shared/types'
import { notifyAck } from '@/lib/transport'

export type RgbStateMsg = { type: 'state'; r: number; g: number; b: number; seq: number }
type PongMsg = { type: 'pong'; ts?: number }
type LegacyAckMsg = { type: 'ack'; cmdId?: string }
type ErrMsg = { type: 'err'; code?: number; message?: string }
type AnyMsg = (RgbStateMsg | PongMsg | LegacyAckMsg | ErrMsg | Record<string, unknown>) & {
  type?: string
}

export type ServerClientOptions = {
  url?: string
  token?: string
  maxBackoffMs?: number
  pingSec?: number
  on401?: () => void
  onState?: (s: RgbStateMsg) => void
  onConnect?: () => void
  onDisconnect?: (event?: CloseEvent) => void
  onAck?: (ack: Ack) => void
}

export type UUID = () => string

export interface Clock {
  now(): number
}

export interface ClientTimer {
  setTimeout: typeof setTimeout
  clearTimeout: typeof clearTimeout
  setInterval: typeof setInterval
  clearInterval: typeof clearInterval
  now(): number
}

export interface ServerClientDeps {
  WebSocketImpl?: typeof WebSocket
  timer?: ClientTimer
  uuid?: UUID
  clock?: Clock
}

export type ServerClient = {
  setRgb: (r: number, g: number, b: number) => void
  sendCommand: (cmd: Command) => void
  close: () => void
}

export function createServerClient(
  opts: ServerClientOptions,
  deps: ServerClientDeps = {},
): ServerClient {
  const url = opts.url ?? (import.meta.env.VITE_WS_URL ?? 'ws://localhost:5173/ws')
  const token = opts.token ?? (import.meta.env.VITE_API_KEY ?? 'demo-key')
  const maxBackoff = Math.max(100, opts.maxBackoffMs ?? 10_000)
  const pingSec = Math.max(1, opts.pingSec ?? 15)
  const clock = deps.clock ?? { now: () => Date.now() }
  const timer = deps.timer ?? createBrowserTimer(clock)
  const uuid = deps.uuid ?? (() => crypto.randomUUID())
  const WebSocketImpl = deps.WebSocketImpl ?? WebSocket

  let ws: WebSocket | null = null
  let closed = false
  let attempt = 0
  let lastPong = clock.now()
  const queue: string[] = []
  const timers: { reconnect?: number; ping?: number } = {}

  function jitter(ms: number) {
    return Math.floor(ms * (0.6 + Math.random() * 0.8))
  }

  function backoff() {
    return Math.min(1000 * Math.pow(2, attempt), maxBackoff)
  }

  function clearTimers() {
    if (timers.reconnect !== undefined) {
      timer.clearTimeout(timers.reconnect)
      timers.reconnect = undefined
    }
    if (timers.ping !== undefined) {
      timer.clearInterval(timers.ping)
      timers.ping = undefined
    }
  }

  function flushQueue() {
    while (ws && ws.readyState === WebSocketImpl.OPEN && queue.length > 0) {
      ws.send(queue.shift()!)
    }
  }

  function heartbeat() {
    if (!ws || ws.readyState !== WebSocketImpl.OPEN) {
      return
    }
    ws.send(JSON.stringify({ type: 'ping', ts: clock.now() }))
    if (clock.now() - lastPong > (pingSec * 2 + 5) * 1000) {
      try {
        ws.close()
      } catch {
        // ignore
      }
    }
  }

  function scheduleReconnect() {
    if (closed) {
      return
    }
    attempt += 1
    const delay = jitter(backoff())
    timers.reconnect = timer.setTimeout(() => open(), delay)
  }

  function open() {
    clearTimers()
    const full = `${url}?token=${encodeURIComponent(token)}`
    ws = new WebSocketImpl(full)

    ws.onopen = () => {
      attempt = 0
      lastPong = clock.now()
      flushQueue()
      timers.ping = timer.setInterval(() => heartbeat(), pingSec * 1000)
      opts.onConnect?.()
    }

    ws.onmessage = (ev) => {
      try {
        const message = JSON.parse(ev.data) as AnyMsg | Ack
        const type =
          typeof (message as AnyMsg).type === 'string' ? (message as AnyMsg).type : undefined

        if (type === 'state' && opts.onState) {
          opts.onState(message as RgbStateMsg)
        } else if (type === 'pong') {
          lastPong = clock.now()
        } else if (type === 'err' && (message as ErrMsg).code === 401) {
          opts.on401?.()
        } else if (
          typeof (message as Ack).ack === 'string' &&
          typeof (message as Ack).accepted === 'boolean'
        ) {
          const ack = message as Ack
          opts.onAck?.(ack)
          try {
            notifyAck(ack)
          } catch (error) {
            if (import.meta.env.DEV) {
              console.warn('notifyAck failed', error)
            }
          }
        }
      } catch {
        // ignore malformed payloads
      }
    }

    ws.onclose = (event) => {
      clearTimers()
      opts.onDisconnect?.(event)
      if (!closed) {
        scheduleReconnect()
      }
    }

    ws.onerror = () => {
      // handled by onclose
    }
  }

  function sendJson(cmd: Command) {
    const payload = JSON.stringify(cmd)
    if (ws?.readyState === WebSocketImpl.OPEN) {
      ws.send(payload)
    } else {
      queue.push(payload)
    }
  }

  open()

  return {
    setRgb(r: number, g: number, b: number) {
      const cmd: Command = {
        type: 'dmx.patch',
        id: uuid(),
        ts: clock.now(),
        universe: 0,
        patch: [
          { ch: 1, val: r },
          { ch: 2, val: g },
          { ch: 3, val: b },
        ],
      }
      sendJson(cmd)
    },
    sendCommand(cmd: Command) {
      sendJson({ ...cmd, id: cmd.id ?? uuid(), ts: cmd.ts ?? clock.now() })
    },
    close() {
      closed = true
      clearTimers()
      try {
        ws?.close()
      } catch {
        // ignore
      }
      ws = null
    },
  }
}

function createBrowserTimer(clock: Clock): ClientTimer {
  return {
    now: clock.now,
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
    setInterval: globalThis.setInterval.bind(globalThis),
    clearInterval: globalThis.clearInterval.bind(globalThis),
  }
}
