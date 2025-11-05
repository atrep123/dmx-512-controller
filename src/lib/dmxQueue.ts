import type { Command, DmxPatchEntry } from '@/shared/types'
import { getServerClient } from '@/lib/transport'

type UniverseKey = number

const pending: Map<UniverseKey, Map<number, number>> = new Map()
let rafId: number | null = null
let timeoutId: number | null = null

function scheduleFlush() {
  if (typeof document !== 'undefined' && document.hidden) {
    if (timeoutId !== null) return
    timeoutId = window.setTimeout(() => {
      timeoutId = null
      flush()
    }, 100)
    return
  }
  if (rafId !== null) return
  rafId = requestAnimationFrame(() => {
    rafId = null
    flush()
  })
}

async function send(cmd: Command) {
  const client = getServerClient()
  if (client) {
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
        id: crypto.randomUUID(),
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
