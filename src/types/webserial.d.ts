interface SerialPortInfo {
  usbVendorId?: number
  usbProductId?: number
  serialNumber?: string
  manufacturer?: string
  productId?: string
}

interface SerialOptions {
  baudRate: number
  dataBits?: number
  stopBits?: number
  parity?: 'none' | 'even' | 'odd'
  bufferSize?: number
  flowControl?: 'none' | 'hardware'
}

interface SerialPort {
  open(options: SerialOptions): Promise<void>
  close(): Promise<void>
  readonly writable?: WritableStream<Uint8Array>
  readonly readable?: ReadableStream<Uint8Array>
  getInfo?: () => SerialPortInfo
}

interface Serial {
  requestPort(): Promise<SerialPort>
  addEventListener(type: 'connect' | 'disconnect', listener: EventListener): void
  removeEventListener(type: 'connect' | 'disconnect', listener: EventListener): void
}

interface Navigator {
  serial?: Serial
}
