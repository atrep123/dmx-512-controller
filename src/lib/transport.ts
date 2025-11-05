import type { ServerClient } from '@/lib/serverClient'
import type { Ack } from '@/shared/types'

let currentClient: ServerClient | null = null
const ackListeners = new Set<(ack: Ack) => void>()

export function registerServerClient(client: ServerClient | null) {
  currentClient = client
  return () => {
    if (currentClient === client) {
      currentClient = null
    }
  }
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
    try {
      fn(ack)
    } catch {
      // ignore listener failures
    }
  }
}

export function resetTransport() {
  currentClient?.close?.()
  currentClient = null
  ackListeners.clear()
}
