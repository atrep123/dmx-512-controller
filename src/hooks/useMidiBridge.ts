import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export type MidiDevice = {
  id: string
  name?: string
  manufacturer?: string
  state?: string
}

export type MidiMessage = {
  deviceId: string
  deviceName?: string
  manufacturer?: string
  status: number
  command: string
  channel?: number
  data: number[]
  timestamp: number
}

type UseMidiBridgeOptions = {
  onMessage?: (message: MidiMessage) => void
}

const COMMAND_NAMES: Record<number, string> = {
  0x80: "note-off",
  0x90: "note-on",
  0xa0: "poly-aftertouch",
  0xb0: "control-change",
  0xc0: "program-change",
  0xd0: "channel-aftertouch",
  0xe0: "pitch-bend",
  0xf8: "clock",
}

function toArray(inputs: MIDIAccess["inputs"]): MIDIInput[] {
  if (!inputs) {
    return []
  }
  if (typeof (inputs as Map<string, MIDIInput>).forEach === "function") {
    const list: MIDIInput[] = []
    ;(inputs as Map<string, MIDIInput>).forEach((input) => {
      list.push(input)
    })
    return list
  }
  return Array.from(inputs as Iterable<MIDIInput>)
}

function decodeMessage(event: MIDIMessageEvent, device?: MidiDevice): MidiMessage {
  const data = Array.from(event.data || [])
  const status = data[0] ?? 0
  const commandId = status & 0xf0
  const channel = status <= 0xef ? status & 0x0f : undefined
  const command = COMMAND_NAMES[commandId] ?? `0x${commandId.toString(16)}`
  return {
    deviceId: device?.id ?? "unknown",
    deviceName: device?.name,
    manufacturer: device?.manufacturer,
    status,
    command,
    channel,
    data,
    timestamp: event.receivedTime ?? performance.now(),
  }
}

export function useMidiBridge(options: UseMidiBridgeOptions = {}) {
  const { onMessage } = options
  const [supported] = useState<boolean>(
    typeof navigator !== "undefined" && typeof navigator.requestMIDIAccess === "function"
  )
  const [enabled, setEnabled] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<MidiDevice[]>([])
  const accessRef = useRef<MIDIAccess | null>(null)
  const messageCb = useRef<UseMidiBridgeOptions["onMessage"]>(onMessage)

  useEffect(() => {
    messageCb.current = onMessage
  }, [onMessage])

  const refreshDevices = useCallback(() => {
    const access = accessRef.current
    if (!access) {
      setDevices([])
      return
    }
    const list = toArray(access.inputs).map((input) => ({
      id: input.id,
      name: input.name || "Neznámé zařízení",
      manufacturer: input.manufacturer || undefined,
      state: input.state,
    }))
    setDevices(list)
  }, [])

  const handleMessage = useCallback(
    (input: MIDIInput) =>
      (event: MIDIMessageEvent) => {
        const device = {
          id: input.id,
          name: input.name || undefined,
          manufacturer: input.manufacturer || undefined,
        }
        const payload = decodeMessage(event, device)
        messageCb.current?.(payload)
        document.dispatchEvent(new CustomEvent("dmx-midi", { detail: payload }))
      },
    []
  )

  const attachInputs = useCallback(() => {
    const access = accessRef.current
    if (!access) return
    toArray(access.inputs).forEach((input) => {
      input.onmidimessage = handleMessage(input)
    })
  }, [handleMessage])

  const detachInputs = useCallback(() => {
    const access = accessRef.current
    if (!access) return
    toArray(access.inputs).forEach((input) => {
      input.onmidimessage = null
    })
  }, [])

  const enable = useCallback(async () => {
    if (!supported) {
      setError("Web MIDI API není v tomto prohlížeči dostupné.")
      return
    }
    if (enabled) {
      return
    }
    setPending(true)
    setError(null)
    try {
      const access = await navigator.requestMIDIAccess?.({ sysex: false })
      if (!access) {
        throw new Error("requestMIDIAccess vrátil null")
      }
      accessRef.current = access
      attachInputs()
      const stateHandler = () => {
        refreshDevices()
        attachInputs()
      }
      access.onstatechange = stateHandler
      refreshDevices()
      setEnabled(true)
    } catch (err) {
      console.error("midi_enable_failed", err)
      setError(err instanceof Error ? err.message : "Nepodařilo se získat přístup k MIDI.")
    } finally {
      setPending(false)
    }
  }, [attachInputs, enabled, refreshDevices, supported])

  const disable = useCallback(() => {
    const access = accessRef.current
    if (!access) {
      setEnabled(false)
      return
    }
    access.onstatechange = null
    detachInputs()
    accessRef.current = null
    setDevices([])
    setEnabled(false)
  }, [detachInputs])

  useEffect(
    () => () => {
      disable()
    },
    [disable]
  )

  const summary = useMemo(
    () => ({
      supported,
      enabled,
      pending,
      error,
      devices,
      enable,
      disable,
    }),
    [supported, enabled, pending, error, devices, enable, disable]
  )

  return summary
}
