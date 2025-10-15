export interface DMXChannel {
  id: string
  number: number
  name: string
  value: number
}

export interface Fixture {
  id: string
  name: string
  dmxAddress: number
  channelCount: number
  universeId: string
  channels: DMXChannel[]
  fixtureType: 'generic' | 'rgb' | 'rgbw' | 'moving-head'
}

export interface Universe {
  id: string
  name: string
  number: number
}

export interface Scene {
  id: string
  name: string
  channelValues: Record<string, number>
  timestamp: number
}

export interface AppState {
  universes: Universe[]
  fixtures: Fixture[]
  scenes: Scene[]
  activeScene: string | null
}
