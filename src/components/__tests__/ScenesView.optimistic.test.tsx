import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import React, { useState } from 'react'
import ScenesView from '@/components/ScenesView'
import type { Fixture, Scene, Universe } from '@/lib/types'
import { registerServerClient, notifyAck } from '@/lib/transport'

describe('ScenesView optimistic revert on NACK', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    registerServerClient(null as any)
  })

  function Harness() {
    const universes: Universe[] = [{ id: 'u0', name: 'U0', number: 0 }]
    const [fixtures, setFixtures] = useState<Fixture[]>([{
      id: 'fx1', name: 'Fx', dmxAddress: 1, channelCount: 1, universeId: 'u0',
      channels: [{ id: 'ch1', number: 1, name: 'Ch1', value: 0 }], fixtureType: 'generic'
    }])
    const [scenes, setScenes] = useState<Scene[]>([{
      id: 's1', name: 'S1', channelValues: { ch1: 200 }, timestamp: Date.now()
    }])
    const [activeScene, setActiveScene] = useState<string | null>(null)

    return (
      <div>
        <div data-testid="val">{fixtures[0].channels[0].value}</div>
        <ScenesView
          scenes={scenes}
          setScenes={setScenes}
          fixtures={fixtures}
          setFixtures={setFixtures}
          universes={universes}
          activeScene={activeScene}
          setActiveScene={setActiveScene}
        />
      </div>
    )
  }

  test('optimistic apply then revert on NACK', async () => {
    // Mock client: whenever a command is sent, immediately NACK it
    registerServerClient({
      sendCommand: (cmd: any) => {
        // schedule ack in same tick but after rAF to simulate network
        notifyAck({ ack: cmd.id, accepted: false } as any)
      },
      setRgb: () => {},
      close: () => {},
    } as any)

    render(<Harness />)

    // Click "Obnovit" on the single scene
    const btn = await screen.findByText('Obnovit')
    fireEvent.click(btn)

    // Optimistic: value becomes 200
    expect(await screen.findByTestId('val')).toHaveTextContent('200')

    // rAF flush sends command and triggers NACK
    vi.advanceTimersByTime(20)

    // Reverted back to 0 after NACK
    expect(await screen.findByTestId('val')).toHaveTextContent('0')
  })
})

