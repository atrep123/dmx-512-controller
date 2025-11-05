import { vi, expect, test } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React, { useState } from 'react'
import ScenesView from '@/components/ScenesView'
import type { Fixture, Scene, Universe } from '@/lib/types'
import { registerServerClient } from '@/lib/transport'

function makeFixture(universeId: string, start: number, count: number): Fixture {
  return {
    id: `${universeId}-fx-${start}`,
    name: `Fx-${start}`,
    dmxAddress: start,
    channelCount: count,
    universeId,
    channels: Array.from({ length: count }, (_, i) => ({
      id: `${universeId}-ch-${start + i}`,
      number: i + 1,
      name: `Ch${i + 1}`,
      value: 0,
    })),
    fixtureType: 'generic',
  }
}

test('large scene splits into ≤64-sized dmx.patch chunks per universe', async () => {
  vi.useFakeTimers()
  const sent: any[] = []
  registerServerClient({ sendCommand: (c: any) => sent.push(c), setRgb: () => {}, close: () => {} } as any)

  function Harness() {
    const universes: Universe[] = [
      { id: 'u0', name: 'U0', number: 0 },
      { id: 'u1', name: 'U1', number: 1 },
    ]
    // u0: 100 kanálů (jeden fixture se startem 1)
    const f0 = makeFixture('u0', 1, 100)
    // u1: 70 kanálů (jeden fixture se startem 1)
    const f1 = makeFixture('u1', 1, 70)
    const [fixtures, setFixtures] = useState<Fixture[]>([f0, f1])
    const [scenes, setScenes] = useState<Scene[]>([{
      id: 's1', name: 'S1', timestamp: Date.now(),
      channelValues: Object.fromEntries([...f0.channels, ...f1.channels].map((c, i) => [c.id, (i + 1) % 256]))
    }])
    const [activeScene, setActiveScene] = useState<string | null>(null)
    return (
      <ScenesView
        scenes={scenes}
        setScenes={setScenes}
        fixtures={fixtures}
        setFixtures={setFixtures}
        universes={universes}
        activeScene={activeScene}
        setActiveScene={setActiveScene}
      />
    )
  }

  render(<Harness />)
  // klik na první "Obnovit"
  const btn = await screen.findByText('Obnovit')
  fireEvent.click(btn)
  // rAF flush
  vi.advanceTimersByTime(20)

  // očekáváme 4 chunkované patche: u0 64+36, u1 64+6
  expect(sent.length).toBe(4)
  sent.forEach((p) => expect(p.patch.length).toBeLessThanOrEqual(64))

  vi.useRealTimers()
})

