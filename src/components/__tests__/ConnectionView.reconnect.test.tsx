import '../../test/setup'
import { useState, act } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ServerClientOptions, ServerClient } from '@/lib/serverClient'
import ConnectionView from '../ConnectionView'

const clientOptions: ServerClientOptions[] = []
const originalFetch = globalThis.fetch

vi.mock('@github/spark/hooks', () => ({
  useKV: <T,>(key: string, initial: T) => useState(initial),
}))

const createServerClientMock = vi.fn((opts: ServerClientOptions): ServerClient => {
  clientOptions.push(opts)
  return {
    setRgb: vi.fn(),
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
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: async () => '',
      })
    ) as unknown as typeof globalThis.fetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('transitions to connecting after disconnect and accepts new state', async () => {
    const user = userEvent.setup()
    render(<ConnectionView />)

    const connectButton = screen.getByRole('button', { name: /připojit/i })
    await user.click(connectButton)

    const opts = clientOptions[0]
    expect(opts).toBeDefined()

    act(() => {
      opts.onState?.({ type: 'state', r: 1, g: 2, b: 3, seq: 1 })
    })
    await waitFor(() => expect(screen.getByText(/RGB 1\/2\/3/)).toBeInTheDocument())

    act(() => {
      opts.onDisconnect?.()
    })
    await waitFor(() => expect(connectButton).toHaveTextContent('Připojování'))

    act(() => {
      opts.onState?.({ type: 'state', r: 4, g: 5, b: 6, seq: 2 })
    })
    await waitFor(() => expect(screen.getByText(/RGB 4\/5\/6/)).toBeInTheDocument())
  })
})
