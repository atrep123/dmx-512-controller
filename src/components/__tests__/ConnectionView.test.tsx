import { act } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import type { ServerClientOptions, ServerClient } from '@/lib/serverClient'
import ConnectionView from '../ConnectionView'

const clientOptions: ServerClientOptions[] = []
const setRgbMocks: Array<ReturnType<typeof vi.fn>> = []
const closeMocks: Array<ReturnType<typeof vi.fn>> = []
const sendCommandMocks: Array<ReturnType<typeof vi.fn>> = []
const originalFetch = globalThis.fetch

const createServerClientMock = vi.fn((opts: ServerClientOptions): ServerClient => {
  clientOptions.push(opts)
  const setRgb = vi.fn()
  const close = vi.fn()
  const sendCommand = vi.fn()
  setRgbMocks.push(setRgb)
  closeMocks.push(close)
  sendCommandMocks.push(sendCommand)
  return { setRgb, sendCommand, close }
})

vi.mock('@/lib/serverClient', () => ({
  createServerClient: (opts: ServerClientOptions) => createServerClientMock(opts),
}))

describe('ConnectionView', () => {
  beforeEach(() => {
    clientOptions.length = 0
    setRgbMocks.length = 0
    closeMocks.length = 0
    sendCommandMocks.length = 0
    createServerClientMock.mockClear()
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      text: async () => '',
      json: async () => ({ r: 0, g: 0, b: 0, seq: 1 }),
      headers: new Headers(),
    })) as unknown as typeof globalThis.fetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('handles WebSocket state updates and metrics', async () => {
    render(<ConnectionView />)

    const connectButton = screen.getByRole('button', { name: /pripojit/i })
    await act(async () => {
      connectButton.click()
    })

    expect(createServerClientMock).toHaveBeenCalledTimes(1)
    const opts = clientOptions[0]
    expect(opts).toBeDefined()

    act(() => {
      opts.onState?.({ type: 'state', r: 5, g: 15, b: 25, seq: 2 })
    })
    expect(screen.getByText(/RGB 5\/15\/25/)).toBeInTheDocument()

    const testButton = screen.getByRole('button', { name: /testovaci prikaz/i })
    await act(async () => {
      testButton.click()
    })

    expect(setRgbMocks[0]).toHaveBeenCalled()

    act(() => {
      opts.onState?.({ type: 'state', r: 10, g: 20, b: 30, seq: 3 })
    })
    // Metrics counters should reflect sent and received packets
    expect(screen.getByTestId('packets-sent')).toHaveTextContent('1')
    expect(screen.getByTestId('packets-received')).toHaveTextContent('2')
  })
})
