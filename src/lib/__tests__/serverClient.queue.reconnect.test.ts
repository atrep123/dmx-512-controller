import { vi, expect, test, beforeEach, afterEach } from 'vitest'
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

beforeEach(() => {
  (globalThis as any).WebSocket = FakeWS as any
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

test('queues during backoff and flushes on new OPEN', () => {
  // Make jitter deterministic: jitter(ms) = ms
  const randSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5)
  const client = createServerClient({ url: 'ws://test/ws', token: 't', pingSec: 60, maxBackoffMs: 200 })

  const ws1 = FakeWS.instances.at(-1)!; ws1._open()
  ;(client as any).sendCommand?.({ type: 'dmx.patch', id: 'a-1', ts: 0, universe: 0, patch: [{ ch: 1, val: 1 }] })
  expect(ws1.sent.length).toBe(1)

  // CLOSE → reconnect is scheduled
  ws1.close()

  // During backoff, messages should queue and not go to ws1
  for (let i = 0; i < 3; i++) {
    ;(client as any).sendCommand?.({ type: 'dmx.patch', id: `q-${i}`, ts: 0, universe: 0, patch: [{ ch: 2, val: i }] })
  }
  expect(ws1.sent.length).toBe(1)

  // After backoff, a new WS is created
  vi.advanceTimersByTime(220)
  const ws2 = FakeWS.instances.at(-1)!; expect(ws2).not.toBe(ws1)
  ws2._open()

  // Queue should flush into the new socket
  expect(ws2.sent.length).toBeGreaterThanOrEqual(3)
  randSpy.mockRestore()
})

