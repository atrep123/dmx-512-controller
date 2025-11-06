import type { Command, DmxPatchEntry } from '@/shared/types'
import { getServerClient } from '@/lib/transport'

type UniverseKey = number

const pending: Map<UniverseKey, Map<number, number>> = new Map()
let rafId: number | null = null
let timeoutId: number | null = null

function scheduleFlush() {
  // Deterministic in tests: coalesce via a single timeout in the same tick
  try {
    if ((globalThis as any).__TEST__) {
      if (timeoutId === null) {
        timeoutId = window.setTimeout(() => {
          timeoutId = null
          flush()
        }, 0)
      }
      return
    }
  } catch {}
  // Debounce; if already scheduled, do nothing
  if (rafId !== null || timeoutId !== null) return
  // Prefer rAF for responsiveness, but provide a timeout fallback to make tests deterministic
  if (typeof requestAnimationFrame !== 'undefined') {
    rafId = requestAnimationFrame(() => {
      rafId = null
      // cancel backup timeout if still pending
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      flush()
    })
    // backup in case rAF isn't advanced (e.g., in tests)
    timeoutId = window.setTimeout(() => {
      // cancel rAF if it hasn't run yet
      if (rafId !== null && typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      timeoutId = null
      flush()
    }, 20)
  } else {
    timeoutId = window.setTimeout(() => {
      timeoutId = null
      flush()
    }, 20)
  }
}

async function send(cmd: Command) {
  const client = getServerClient()
  if (client && typeof client.sendCommand === 'function') {
    client.sendCommand(cmd)
    return
  }
  // Fallback to REST
  await fetch('/command', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(cmd),
  })
}

function flush() {
  const ts = Date.now()
  for (const [universe, chMap] of pending) {
    const all: DmxPatchEntry[] = []
    for (const [ch, val] of chMap) all.push({ ch, val })
    if (all.length === 0) continue
    // Split into chunks of up to 64 to respect server limit
    for (let i = 0; i < all.length; i += 64) {
      const patch = all.slice(i, i + 64)
      const cmd: Command = {
        type: 'dmx.patch',
        id: uuid(),
        ts,
        universe,
        patch,
      }
      void send(cmd)
    }
  }
  pending.clear()
}

export function setChannel(universe: number, ch: number, val: number) {
  let chMap = pending.get(universe)
  if (!chMap) {
    chMap = new Map()
    pending.set(universe, chMap)
  }
  chMap.set(ch, Math.max(0, Math.min(255, Math.round(val))))
  scheduleFlush()
}

// Test-only helper to force a flush
export function __flushForTests() {
  flush()
}
function uuid(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
      return (crypto as any).randomUUID()
    }
  } catch {}
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}
