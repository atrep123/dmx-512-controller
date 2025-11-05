import { vi, expect, test, beforeEach, afterEach } from 'vitest'
import { createServerClient } from '@/lib/serverClient'
import { FakeWebSocket } from '@/test/fakes/fakeWebSocket'

beforeEach(() => {
  FakeWebSocket.instances.length = 0
  vi.useFakeTimers()
  vi.setSystemTime(0)
})

afterEach(() => {
  vi.useRealTimers()
})

test('queues messages while CONNECTING and flushes on OPEN', () => {
  const client = createServerClient(
    { url: 'ws://test/ws', token: 't', pingSec: 60 },
    {
      WebSocketImpl: FakeWebSocket as unknown as typeof WebSocket,
      uuid: () => 'cmd-1',
      clock: { now: () => Date.now() },
    },
  )
  const ws = FakeWebSocket.instances.at(-1)!
  client.sendCommand({
    type: 'dmx.patch',
    id: 'cmd-1',
    ts: 0,
    universe: 0,
    patch: [{ ch: 1, val: 1 }],
  })
  expect(ws.sent.length).toBe(0)
  ws.open()
  vi.advanceTimersByTime(0)
  expect(ws.sent.length).toBe(1)
  const msg = JSON.parse(ws.sent[0])
  expect(msg.type).toBe('dmx.patch')
})

test('heartbeat closes silent socket and schedules reconnect', () => {
  const randSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5)

  createServerClient(
    { url: 'ws://test/ws', token: 't', pingSec: 1, maxBackoffMs: 1500 },
    {
      WebSocketImpl: FakeWebSocket as unknown as typeof WebSocket,
      uuid: () => `cmd-${FakeWebSocket.instances.length}`,
      clock: { now: () => Date.now() },
    },
  )
  const ws1 = FakeWebSocket.instances.at(-1)!
  ws1.open()
  vi.advanceTimersByTime(8_000)
  vi.advanceTimersByTime(1_600)
  const ws2 = FakeWebSocket.instances.at(-1)!
  expect(ws2).not.toBe(ws1)

  randSpy.mockRestore()
})
