import { vi, expect, test, beforeEach, afterEach } from 'vitest'
import { createServerClient } from '@/lib/serverClient'
import { FakeWebSocket } from '@/test/fakes/fakeWebSocket'

beforeEach(() => {
  vi.useFakeTimers()
  FakeWebSocket.instances.length = 0
})

afterEach(() => {
  vi.useRealTimers()
})

test('queues during backoff and flushes on new OPEN', () => {
  const randSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5)

  const client = createServerClient(
    { url: 'ws://test/ws', token: 't', pingSec: 60, maxBackoffMs: 200 },
    {
      WebSocketImpl: FakeWebSocket as unknown as typeof WebSocket,
      uuid: () => `cmd-${FakeWebSocket.instances.length}`,
      clock: { now: () => Date.now() },
    },
  )

  const ws1 = FakeWebSocket.instances.at(-1)!
  ws1.open()
  client.sendCommand({
    type: 'dmx.patch',
    id: 'a-1',
    ts: 0,
    universe: 0,
    patch: [{ ch: 1, val: 1 }],
  })
  expect(ws1.sent.length).toBe(1)

  ws1.close()

  for (let index = 0; index < 3; index += 1) {
    client.sendCommand({
      type: 'dmx.patch',
      id: `q-${index}`,
      ts: 0,
      universe: 0,
      patch: [{ ch: 2, val: index }],
    })
  }
  expect(ws1.sent.length).toBe(1)

  vi.advanceTimersByTime(220)
  const ws2 = FakeWebSocket.instances.at(-1)!
  expect(ws2).not.toBe(ws1)
  ws2.open()

  expect(ws2.sent.length).toBeGreaterThanOrEqual(3)
  randSpy.mockRestore()
})
