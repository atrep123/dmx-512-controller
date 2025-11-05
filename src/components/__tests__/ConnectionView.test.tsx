import '../../test/setup'
import { useState, act } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ServerClientOptions, ServerClient } from '@/lib/serverClient'
import ConnectionView from '../ConnectionView'

const clientOptions: ServerClientOptions[] = []
const setRgbMocks: Array<ReturnType<typeof vi.fn>> = []
const closeMocks: Array<ReturnType<typeof vi.fn>> = []
const originalFetch = globalThis.fetch

vi.mock('@github/spark/hooks', () => ({
  useKV: <T,>(key: string, initial: T) => useState(initial),
}))

const createServerClientMock = vi.fn((opts: ServerClientOptions): ServerClient => {
  clientOptions.push(opts)
  const setRgb = vi.fn()
  const close = vi.fn()
  setRgbMocks.push(setRgb)
  closeMocks.push(close)
  return { setRgb, close }
})

vi.mock('@/lib/serverClient', () => ({
  createServerClient: (opts: ServerClientOptions) => createServerClientMock(opts),
}))

describe('ConnectionView', () => {
  beforeEach(() => {
    clientOptions.length = 0
    setRgbMocks.length = 0
    closeMocks.length = 0
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

  it('handles WebSocket state updates and metrics', async () => {
    const user = userEvent.setup()
    render(<ConnectionView />)

    const connectButton = screen.getByRole('button', { name: /připojit/i })
    await user.click(connectButton)

    expect(createServerClientMock).toHaveBeenCalledTimes(1)
    const opts = clientOptions[0]
    expect(opts).toBeDefined()

    act(() => {
      opts.onState?.({ type: 'state', r: 5, g: 15, b: 25, seq: 2 })
    })
    await waitFor(() => expect(screen.getByText(/RGB 5\/15\/25/)).toBeInTheDocument())

    const testButton = screen.getByRole('button', { name: /testovací příkaz/i })
    await user.click(testButton)

    expect(setRgbMocks[0]).toHaveBeenCalled()

    act(() => {
      opts.onState?.({ type: 'state', r: 10, g: 20, b: 30, seq: 3 })
    })
    await waitFor(() => expect(screen.getByTestId('packets-sent')).toHaveTextContent('1'))
    await waitFor(() => expect(screen.getByTestId('packets-received')).toHaveTextContent('2'))
  })
})
