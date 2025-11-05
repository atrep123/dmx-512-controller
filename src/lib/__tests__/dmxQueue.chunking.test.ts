import { expect, test } from 'vitest'
import { createQueue } from '@/lib/dmxQueue'
import { FakeTimer } from '@/test/fakes/fakeTimer'
import type { Command } from '@/shared/types'

test('dmxQueue splits large batch into 64 sized chunks', async () => {
  const sent: Command[] = []
  const timer = new FakeTimer()
  const queue = createQueue({
    timer,
    clock: { now: () => timer.now() },
    transport: {
      async postCommand(cmd) {
        sent.push(cmd)
        return { ackId: cmd.id }
      },
      async postRGB() {
        return { ackId: 'rgb' }
      },
    },
  })

  for (let ch = 1; ch <= 130; ch++) {
    queue.enqueue({ universe: 0, channel: ch, value: ch % 256 })
  }

  timer.tick(16)
  await Promise.resolve()
  await Promise.resolve()

  expect(sent.length).toBe(3)
  expect(sent[0].patch).toHaveLength(64)
  expect(sent[1].patch).toHaveLength(64)
  expect(sent[2].patch).toHaveLength(2)

  const lastPatch = sent[2]
  expect(lastPatch.patch[0]).toEqual({ ch: 129, val: 129 % 256 })
  expect(lastPatch.patch[1]).toEqual({ ch: 130, val: 130 % 256 })
})
