import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, screen, act } from '@testing-library/react'
import { useState } from 'react'
import ScenesView from '@/components/ScenesView'
import type { Fixture, Scene, Universe } from '@/lib/types'
import { notifyAck } from '@/lib/transport'
import { createQueue } from '@/lib/dmxQueue'
import { FakeTimer } from '@/test/fakes/fakeTimer'
import { ScenesStoreProvider } from '@/state/scenesStore'

describe('ScenesView optimistic revert on NACK', () => {
  const commands: string[] = []
  const timer = new FakeTimer()

  beforeEach(() => {
    vi.useFakeTimers()
    timer.nowValue = 0
    commands.length = 0
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function Harness() {
    const universes: Universe[] = [{ id: 'u0', name: 'U0', number: 0 }]
    const [fixtures, setFixtures] = useState<Fixture[]>([
      {
        id: 'fx1',
        name: 'Fx',
        dmxAddress: 1,
        channelCount: 1,
        universeId: 'u0',
        channels: [{ id: 'ch1', number: 1, name: 'Ch1', value: 0 }],
        fixtureType: 'generic',
      },
    ])
    const [scenes, setScenes] = useState<Scene[]>([
      { id: 's1', name: 'S1', channelValues: { ch1: 200 }, timestamp: Date.now() },
    ])
    const [activeScene, setActiveScene] = useState<string | null>(null)
    const queue = createQueue({
      timer,
      clock: { now: () => timer.now() },
      transport: {
        async postCommand(cmd) {
          commands.push(cmd.id)
          return { ackId: cmd.id }
        },
        async postRGB() {
          return { ackId: 'rgb' }
        },
      },
    })

    return (
      <ScenesStoreProvider
        value={{
          scenes,
          setScenes,
          fixtures,
          setFixtures,
          universes,
          activeSceneId: activeScene,
          setActiveSceneId: setActiveScene,
        }}
        queue={queue}
        timer={timer}
      >
        <div data-testid="val">{fixtures[0].channels[0].value}</div>
        <ScenesView />
      </ScenesStoreProvider>
    )
  }

  test('optimistic apply then revert on NACK', async () => {
    render(<Harness />)

    await act(async () => {
      fireEvent.click(screen.getByText('Obnovit'))
    })
    await Promise.resolve()
    await Promise.resolve()

    expect(screen.getByTestId('val')).toHaveTextContent('200')

    await Promise.resolve()
    await Promise.resolve()

    await act(async () => {
      notifyAck({ ack: commands[0], accepted: false } as any)
    })
    await Promise.resolve()

    expect(commands.length).toBeGreaterThan(0)
    await Promise.resolve()
    expect(screen.getByTestId('val')).toHaveTextContent('0')
  })
})
