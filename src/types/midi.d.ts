declare global {
  interface MIDIMessageEvent extends Event {
    data: Uint8Array
    receivedTime: number
    target: MIDIInput | null
  }

  interface MIDIConnectionEvent extends Event {
    port: MIDIPort
  }

  interface MIDIPort extends EventTarget {
    id: string
    manufacturer?: string | null
    name?: string | null
    type: "input" | "output"
    state: "connected" | "disconnected"
    connection: "open" | "closed" | "pending"
  }

  interface MIDIInput extends MIDIPort {
    onmidimessage: ((this: MIDIInput, event: MIDIMessageEvent) => void) | null
  }

  interface MIDIAccess extends EventTarget {
    inputs: Map<string, MIDIInput> | Iterable<MIDIInput>
    onstatechange: ((event: MIDIConnectionEvent) => void) | null
  }

  interface Navigator {
    requestMIDIAccess?: (options?: { sysex?: boolean }) => Promise<MIDIAccess>
  }
}

export {}
