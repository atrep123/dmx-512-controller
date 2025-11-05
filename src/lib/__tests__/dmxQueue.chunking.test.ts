import { beforeEach, afterEach, expect, test, vi } from 'vitest'
import { registerServerClient } from '@/lib/transport'
import * as dmxQueue from '@/lib/dmxQueue'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  registerServerClient(null as any)
})

test('dmxQueue splits large batch into ≤64 sized chunks', () => {
  const sent: any[] = []
  registerServerClient({
    sendCommand: (cmd: any) => { sent.push(cmd) },
    setRgb: () => {},
    close: () => {},
  } as any)

  for (let ch = 1; ch <= 130; ch++) {
    dmxQueue.setChannel(0, ch, ch % 256)
  }
  // Trigger rAF flush
  vi.advanceTimersByTime(20)

  expect(sent.length).toBe(3)
  expect(sent[0].patch).toHaveLength(64)
  expect(sent[1].patch).toHaveLength(64)
  expect(sent[2].patch).toHaveLength(2)
  // Ensure chunk boundaries carry correct channel/value edges
  const lastPatch = sent[2]
  expect(lastPatch.patch[0]).toEqual({ ch: 129, val: 129 % 256 })
  expect(lastPatch.patch[1]).toEqual({ ch: 130, val: 130 % 256 })
})

