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

test('notifies patch observers with cloned payloads', () => {
  const sent: any[] = []
  registerServerClient({
    sendCommand: (cmd: any) => {
      sent.push(cmd)
    },
    close: () => {},
    setRgb: () => {},
  } as any)

  const observerPayloads: Array<{ universe: number; patch: { ch: number; val: number }[] }> = []
  const unsubscribe = dmxQueue.registerPatchObserver((universe, patch) => {
    observerPayloads.push({ universe, patch })
  })

  dmxQueue.setChannel(2, 10, 200)
  vi.advanceTimersByTime(20)

  expect(observerPayloads).toHaveLength(1)
  expect(observerPayloads[0].universe).toBe(2)
  expect(observerPayloads[0].patch).toEqual([{ ch: 10, val: 200 }])
  // mutate observer data to ensure queue internals aren't affected
  observerPayloads[0].patch[0].val = 0
  expect(sent[0].patch[0].val).toBe(200)

  unsubscribe()
})
