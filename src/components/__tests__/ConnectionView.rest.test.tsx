import '../../test/setup'
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ServerClientOptions, ServerClient } from '@/lib/serverClient'
import ConnectionView from '../ConnectionView'

vi.mock('@github/spark/hooks', () => ({
  useKV: <T,>(key: string, initial: T) => useState(initial),
}))

const createServerClientMock = vi.fn((opts: ServerClientOptions): ServerClient => {
  void opts
  return {
    setRgb: vi.fn(),
    close: vi.fn(),
  }
})

vi.mock('@/lib/serverClient', () => ({
  createServerClient: (opts: ServerClientOptions) => createServerClientMock(opts),
}))

describe('ConnectionView REST fallback', () => {
  beforeEach(() => {
    createServerClientMock.mockClear()
  })

  it('falls back to REST when WS is not connected', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
      })
    )
    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch

    try {
      render(<ConnectionView />)

      const testButton = screen.getByRole('button', { name: /testovací příkaz/i })
      await user.click(testButton)

      expect(fetchMock).toHaveBeenCalledWith(
        '/rgb',
        expect.objectContaining({
          method: 'POST',
        })
      )
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})
