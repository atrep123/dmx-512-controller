import type { Fixture, Scene, Universe } from '@/lib/types'

export interface BuildSceneInput {
  fixtures: Fixture[]
  name: string
  clock?: { now(): number }
  idFactory?: () => string
}

export function buildScene({
  fixtures,
  name,
  clock = { now: () => Date.now() },
  idFactory = () => crypto.randomUUID(),
}: BuildSceneInput): Scene {
  const channelValues: Record<string, number> = {}
  for (const fixture of fixtures) {
    for (const channel of fixture.channels) {
      channelValues[channel.id] = channel.value
    }
  }
  return {
    id: idFactory(),
    name,
    channelValues,
    timestamp: clock.now(),
  }
}

export interface ApplySceneInput {
  fixtures: Fixture[]
  scene: Scene
  setFixtures: (next: Fixture[]) => void
}

export function applySceneToFixtures({
  fixtures,
  scene,
  setFixtures,
}: ApplySceneInput) {
  const next = fixtures.map((fixture) => ({
    ...fixture,
    channels: fixture.channels.map((channel) => ({
      ...channel,
      value: scene.channelValues[channel.id] ?? channel.value,
    })),
  }))
  setFixtures(next)
}

export interface GroupChannelsInput {
  scene: Scene
  fixtures: Fixture[]
  universes: Universe[]
}

export type GroupedChannels = Map<number, { channel: number; value: number }[]>

export function groupChannelsByUniverse({
  scene,
  fixtures,
  universes,
}: GroupChannelsInput): GroupedChannels {
  const grouped: GroupedChannels = new Map()
  for (const fixture of fixtures) {
    const universeNumber =
      universes.find((uni) => uni.id === fixture.universeId)?.number ?? 0
    for (const channel of fixture.channels) {
      const value = scene.channelValues[channel.id]
      if (typeof value !== 'number') continue
      const absoluteChannel = fixture.dmxAddress + (channel.number - 1)
      const list = grouped.get(universeNumber) ?? []
      list.push({ channel: absoluteChannel, value })
      grouped.set(universeNumber, list)
    }
  }
  return grouped
}
