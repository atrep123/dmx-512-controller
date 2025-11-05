import { vi, expect, test } from 'vitest'
import { createServerClient } from '@/lib/serverClient'

class FakeWS {
  static CONNECTING = 0; static OPEN = 1; static CLOSING = 2; static CLOSED = 3
  readyState = FakeWS.CONNECTING
  url = ''
  onopen?: () => void
  onclose?: (ev?: CloseEvent) => void
  onmessage?: (ev: { data: string }) => void
  onerror?: () => void
  sent: string[] = []
  static instances: FakeWS[] = []
  constructor(url: string) { this.url = url; FakeWS.instances.push(this) }
  send(data: string) { if (this.readyState !== FakeWS.OPEN) throw new Error('not open'); this.sent.push(data) }
  close() { this.readyState = FakeWS.CLOSED; this.onclose?.() }
  _open() { this.readyState = FakeWS.OPEN; this.onopen?.() }
}
(globalThis as any).WebSocket = FakeWS as any

test('queues messages while CONNECTING and flushes on OPEN', () => {
  vi.useFakeTimers()
  const client = createServerClient({ url: 'ws://test/ws', token: 't', pingSec: 60 })
  const ws = FakeWS.instances.at(-1)!
  // send while CONNECTING – should queue, not send immediately
  ;(client as any).sendCommand?.({ type: 'dmx.patch', id: 't-1', ts: 0, universe: 0, patch: [{ ch: 1, val: 1 }] })
  expect(ws.sent.length).toBe(0)
  // open and flush
  ws._open()
  vi.advanceTimersByTime(0)
  expect(ws.sent.length).toBe(1)
  const msg = JSON.parse(ws.sent[0])
  expect(msg.type).toBeDefined()
  vi.useRealTimers()
})

test('heartbeat closes silent socket and schedules reconnect', () => {
  vi.useFakeTimers()
  createServerClient({ url: 'ws://test/ws', token: 't', pingSec: 1, maxBackoffMs: 1500 })
  const ws1 = FakeWS.instances.at(-1)!; ws1._open()
  // run > (2*ping + 5)s to trigger stale close and reconnect
  vi.advanceTimersByTime(8000)
  // allow reconnect backoff to schedule and create next instance
  vi.advanceTimersByTime(1600)
  const ws2 = FakeWS.instances.at(-1)!
  expect(ws2).not.toBe(ws1)
  vi.useRealTimers()
})

