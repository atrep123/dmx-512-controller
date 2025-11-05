import type { ServerClient } from '@/lib/serverClient'
import type { Ack } from '@/shared/types'

let currentClient: ServerClient | null = null
const ackListeners = new Set<(ack: Ack) => void>()

export function registerServerClient(client: ServerClient | null) {
  currentClient = client
}

export function getServerClient(): ServerClient | null {
  return currentClient
}

export function addAckListener(fn: (ack: Ack) => void) {
  ackListeners.add(fn)
}

export function removeAckListener(fn: (ack: Ack) => void) {
  ackListeners.delete(fn)
}

export function notifyAck(ack: Ack) {
  for (const fn of ackListeners) {
    try { fn(ack) } catch { /* ignore */ }
  }
}
