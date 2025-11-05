import type { Ack, Command, DmxPatchEntry } from '@/shared/types'
import { getServerClient, notifyAck } from '@/lib/transport'

export interface Timer {
  now(): number
  setTimeout(handler: (...args: any[]) => void, delay: number): number
  clearTimeout(id: number): void
  requestAnimationFrame(cb: FrameRequestCallback): number
  cancelAnimationFrame(id: number): void
}

export interface Clock {
  now(): number
}

export interface Transport {
  postCommand(cmd: Command): Promise<{ ackId: string; ack?: Ack }>
  postRGB(params: {
    universe: number
    patch: DmxPatchEntry[]
    ts: number
  }): Promise<{ ackId: string; ack?: Ack }>
}

export interface QueueDeps {
  timer?: Timer
  clock?: Clock
  transport?: Transport
  chunkSize?: number
  hiddenFlushMs?: number
}

export interface EnqueueInput {
  universe: number
  channel: number
  value: number
}

export interface FlushResult {
  ackId: string
  command: Command
  ack?: Ack
}

export interface DmxQueue {
  enqueue(entry: EnqueueInput): void
  flushNow(): Promise<FlushResult[]>
  reset(): void
  getPending(): Map<number, Map<number, number>>
}

export function createQueue({
  timer = createBrowserTimer(),
  clock = defaultClock,
  transport = createDefaultTransport(),
  chunkSize = 64,
  hiddenFlushMs = 100,
}: QueueDeps = {}): DmxQueue {
  const pending = new Map<number, Map<number, number>>()
  let rafId: number | null = null
  let timeoutId: number | null = null

  async function flushNow(): Promise<FlushResult[]> {
    cancelScheduled()
    const ts = clock.now()
    const results: FlushResult[] = []
    for (const [universe, channels] of pending) {
      const items = Array.from(channels.entries()).map(([ch, val]) => ({ ch, val }))
      if (!items.length) continue
      for (let i = 0; i < items.length; i += chunkSize) {
        const patch = items.slice(i, i + chunkSize)
        const cmd: Command = {
          type: 'dmx.patch',
          id: idFactory(),
          ts,
          universe,
          patch,
        }
        const ack = await transport.postCommand(cmd)
        results.push({ ackId: ack.ackId, command: cmd, ack: ack.ack })
      }
    }
    pending.clear()
    return results
  }

  function enqueue({ universe, channel, value }: EnqueueInput) {
    let channels = pending.get(universe)
    if (!channels) {
      channels = new Map()
      pending.set(universe, channels)
    }
    const clamped = Math.max(0, Math.min(255, Math.round(value)))
    channels.set(channel, clamped)
    scheduleFlush()
  }

  function scheduleFlush() {
    if (typeof document !== 'undefined' && document.hidden) {
      if (timeoutId !== null) return
      timeoutId = timer.setTimeout(() => {
        timeoutId = null
        void flushNow()
      }, hiddenFlushMs)
      return
    }
    if (rafId !== null) return
    rafId = timer.requestAnimationFrame(() => {
      rafId = null
      void flushNow()
    })
  }

  function cancelScheduled() {
    if (rafId !== null) {
      timer.cancelAnimationFrame(rafId)
      rafId = null
    }
    if (timeoutId !== null) {
      timer.clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  function reset() {
    cancelScheduled()
    pending.clear()
  }

  return {
    enqueue,
    flushNow,
    reset,
    getPending: () => pending,
  }
}

const defaultClock: Clock = { now: () => Date.now() }

function createBrowserTimer(): Timer {
  return {
    now: () => Date.now(),
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
    requestAnimationFrame:
      typeof globalThis.requestAnimationFrame === 'function'
        ? globalThis.requestAnimationFrame.bind(globalThis)
        : (cb) => globalThis.setTimeout(() => cb(Date.now()), 16),
    cancelAnimationFrame:
      typeof globalThis.cancelAnimationFrame === 'function'
        ? globalThis.cancelAnimationFrame.bind(globalThis)
        : (id) => globalThis.clearTimeout(id),
  }
}

function createDefaultTransport(): Transport {
  return {
    async postCommand(cmd) {
      const client = getServerClient()
      if (client) {
        client.sendCommand(cmd)
        return { ackId: cmd.id }
      }
      const response = await fetch('/command', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(cmd),
      })
      const body = (await response.json().catch(() => null)) as Ack | null
      if (body && typeof body.accepted === 'boolean') {
        try {
          notifyAck(body)
        } catch {
          // ignore notification errors
        }
        return { ackId: body.ack ?? cmd.id, ack: body }
      }
      return { ackId: (body && body.ack) || cmd.id }
    },
    async postRGB({ universe, patch, ts }) {
      const cmd: Command = {
        type: 'dmx.patch',
        id: idFactory(),
        ts,
        universe,
        patch,
      }
      return this.postCommand(cmd)
    },
  }
}

let idFactory: () => string = () => crypto.randomUUID()

export function setQueueIdFactory(factory: () => string) {
  idFactory = factory
}

const defaultQueue = createQueue()

export function getDefaultQueue() {
  return defaultQueue
}

export function enqueueChannel(universe: number, channel: number, value: number) {
  defaultQueue.enqueue({ universe, channel, value })
}

export function flushNow() {
  return defaultQueue.flushNow()
}

export function resetQueue() {
  defaultQueue.reset()
}

// Backward compatible exports
export function setChannel(universe: number, ch: number, val: number) {
  enqueueChannel(universe, ch, val)
}

export function cancelPendingFlush() {
  resetQueue()
}
