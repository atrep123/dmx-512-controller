import type { MidiMessage } from "@/hooks/useMidiBridge"

export type MidiAction =
  | {
      type: "channel"
      channel: number // 1-based DMX channel index across fixtures
    }
  | {
      type: "scene"
      sceneId: string
    }
  | {
      type: "effect-toggle"
      effectId: string
      behavior?: "toggle" | "on" | "off"
    }
  | {
      type: "effect-intensity"
      effectId: string
    }
  | {
      type: "master-dimmer"
    }

export type MidiMapping = {
  id: string
  deviceId?: string | null
  deviceName?: string | null
  command: string
  controller: number
  action: MidiAction
}

export function normalizeMidiValue(value: number): number {
  const clamped = Math.max(0, Math.min(127, Math.round(value)))
  return Math.round((clamped / 127) * 255)
}

export function midiValueToPercent(value: number): number {
  const clamped = Math.max(0, Math.min(127, Math.round(value)))
  return Math.round((clamped / 127) * 100)
}

export function matchMidiMapping(message: MidiMessage, mappings: MidiMapping[]): MidiMapping | undefined {
  if (!mappings?.length) {
    return undefined
  }
  return mappings.find((mapping) => {
    if (mapping.command !== message.command) {
      return false
    }
    if (mapping.controller !== message.data?.[1]) {
      return false
    }
    if (mapping.deviceId && message.deviceId && mapping.deviceId !== message.deviceId) {
      return false
    }
    return true
  })
}
