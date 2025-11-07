import type { DmxPatchEntry } from '@/shared/types'

const DMX_CHANNELS = 512
const DMX_FRAME_LENGTH = DMX_CHANNELS + 1 // leading start code byte

export type UsbPortInfo = SerialPortInfo | undefined

export function isWebSerialSupported() {
  if (typeof navigator === 'undefined') return false
  return Boolean((navigator as Navigator & { serial?: Serial }).serial)
}

export class UsbDmxBridge {
  private port: SerialPort | null = null
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null
  private framesSent = 0
  private lastFrameTs = 0
  private buffers = new Map<number, Uint8Array>()

  async open(): Promise<UsbPortInfo> {
    if (!isWebSerialSupported()) {
      throw new Error('Web Serial API is not available in this browser')
    }
    const port = await getSerial().requestPort()
    await port.open({
      baudRate: 250_000,
      dataBits: 8,
      stopBits: 2,
      parity: 'none',
      bufferSize: DMX_FRAME_LENGTH,
      flowControl: 'none',
    } as SerialOptions)
    const writer = port.writable?.getWriter()
    if (!writer) {
      await port.close()
      throw new Error('Selected USB DMX interface does not expose a writable stream')
    }
    this.port = port
    this.writer = writer
    this.framesSent = 0
    this.lastFrameTs = 0
    this.buffers.clear()
    return port.getInfo?.()
  }

  async close() {
    try {
      await this.writer?.close()
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('usb_dmx_writer_close_error', error)
      }
    }
    try {
      await this.port?.close()
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('usb_dmx_port_close_error', error)
      }
    }
    this.writer = null
    this.port = null
    this.framesSent = 0
    this.lastFrameTs = 0
    this.buffers.clear()
  }

  isOpen() {
    return Boolean(this.port)
  }

  getInfo(): UsbPortInfo {
    return this.port?.getInfo?.()
  }

  getFramesSent() {
    return this.framesSent
  }

  getLastFrameTs() {
    return this.lastFrameTs
  }

  private ensureFrame(universe: number) {
    let frame = this.buffers.get(universe)
    if (!frame) {
      frame = new Uint8Array(DMX_FRAME_LENGTH)
      frame[0] = 0 // DMX start code
      this.buffers.set(universe, frame)
    }
    return frame
  }

  async sendPatch(universe: number, patch: DmxPatchEntry[]) {
    if (!this.writer) {
      throw new Error('USB DMX interface is not ready')
    }
    const frame = this.ensureFrame(universe)
    for (const { ch, val } of patch) {
      const chIndex = Math.min(DMX_CHANNELS, Math.max(1, Math.trunc(ch)))
      frame[chIndex] = Math.min(255, Math.max(0, Math.trunc(val)))
    }
    await this.writer.write(frame)
    this.framesSent += 1
    this.lastFrameTs = Date.now()
    return this.framesSent
  }
}

function getSerial() {
  if (typeof navigator === 'undefined') {
    throw new Error('Web Serial API is not available in this browser')
  }
  const serial = (navigator as Navigator & { serial?: Serial }).serial
  if (!serial) {
    throw new Error('Web Serial API is not available in this browser')
  }
  return serial
}
