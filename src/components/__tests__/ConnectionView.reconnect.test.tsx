import { act } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import type { ServerClientOptions, ServerClient } from '@/lib/serverClient'
import ConnectionView from '../ConnectionView'

const clientOptions: ServerClientOptions[] = []
const originalFetch = globalThis.fetch

const createServerClientMock = vi.fn((opts: ServerClientOptions): ServerClient => {
  clientOptions.push(opts)
  return {
    setRgb: vi.fn(),
    sendCommand: vi.fn(),
    close: vi.fn(),
  }
})

vi.mock('@/lib/serverClient', () => ({
  createServerClient: (opts: ServerClientOptions) => createServerClientMock(opts),
}))

describe('ConnectionView reconnect behaviour', () => {
  beforeEach(() => {
    clientOptions.length = 0
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

  it('transitions to connecting after disconnect and accepts new state', async () => {
    render(<ConnectionView />)

    const connectButton = screen.getByRole('button', { name: /pripojit/i })
    await act(async () => {
      connectButton.click()
    })

    const opts = clientOptions[0]
    expect(opts).toBeDefined()

    act(() => {
      opts.onState?.({ type: 'state', r: 1, g: 2, b: 3, seq: 1 })
    })
    expect(screen.getByText(/RGB 1\/2\/3/)).toBeInTheDocument()

    act(() => {
      opts.onDisconnect?.()
    })
    expect(connectButton).toHaveTextContent('Pripojovani')

    act(() => {
      opts.onState?.({ type: 'state', r: 4, g: 5, b: 6, seq: 2 })
    })
    expect(screen.getByText(/RGB 4\/5\/6/)).toBeInTheDocument()
  })
})
