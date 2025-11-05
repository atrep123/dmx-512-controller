import { vi, expect, test, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { useState } from 'react'
import ScenesView from '@/components/ScenesView'
import type { Fixture, Scene, Universe } from '@/lib/types'
import { createQueue } from '@/lib/dmxQueue'
import { ScenesStoreProvider } from '@/state/scenesStore'
import { FakeTimer } from '@/test/fakes/fakeTimer'
import { notifyAck } from '@/lib/transport'

const timer = new FakeTimer()

function makeFixture(universeId: string, start: number, count: number): Fixture {
  return {
    id: `${universeId}-fx-${start}`,
    name: `Fx-${start}`,
    dmxAddress: start,
    channelCount: count,
    universeId,
    channels: Array.from({ length: count }, (_, index) => ({
      id: `${universeId}-ch-${start + index}`,
      number: index + 1,
      name: `Ch${index + 1}`,
      value: 0,
    })),
    fixtureType: 'generic',
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  timer.nowValue = 0
})

afterEach(() => {
  vi.useRealTimers()
})

test('large scene splits into 64-sized dmx.patch chunks per universe', async () => {
  const commands: string[] = []
  const captured: number[] = []
  const queue = createQueue({
    timer,
    clock: { now: () => timer.now() },
    transport: {
      async postCommand(cmd) {
        commands.push(cmd.id)
        captured.push(cmd.patch.length)
        return { ackId: cmd.id }
      },
      async postRGB() {
        return { ackId: 'rgb' }
      },
    },
  })

  function Harness() {
    const universes: Universe[] = [
      { id: 'u0', name: 'U0', number: 0 },
      { id: 'u1', name: 'U1', number: 1 },
    ]
    const fixtures = [makeFixture('u0', 1, 100), makeFixture('u1', 1, 70)]
    const [fixtureState, setFixtures] = useState<Fixture[]>(fixtures)
    const [scenes, setScenes] = useState<Scene[]>([
      {
        id: 's1',
        name: 'S1',
        timestamp: Date.now(),
        channelValues: Object.fromEntries(
          fixtures
            .flatMap((fixture) => fixture.channels)
            .map((channel, index) => [channel.id, (index + 1) % 256]),
        ),
      },
    ])
    const [activeScene, setActiveScene] = useState<string | null>(null)
    return (
      <ScenesStoreProvider
        value={{
          scenes,
          setScenes,
          fixtures: fixtureState,
          setFixtures,
          universes,
          activeSceneId: activeScene,
          setActiveSceneId: setActiveScene,
        }}
        queue={queue}
        timer={timer}
      >
        <ScenesView />
      </ScenesStoreProvider>
    )
  }

  render(<Harness />)

  await act(async () => {
    fireEvent.click(screen.getByText('Obnovit'))
  })
  await Promise.resolve()
  await Promise.resolve()

  await act(async () => {
    commands.forEach((commandId) =>
      notifyAck({ ack: commandId, accepted: true } as any),
    )
  })

  expect(commands.length).toBeGreaterThan(0)
  expect(commands.length).toBe(4)
  captured.forEach((size) => expect(size).toBeLessThanOrEqual(64))
})
