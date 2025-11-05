import { act } from 'react'
import { render, screen } from '@testing-library/react'
import type { ServerClientOptions, ServerClient } from '@/lib/serverClient'
import ConnectionView from '../ConnectionView'

const createServerClientMock = vi.fn((opts: ServerClientOptions): ServerClient => {
  void opts
  return {
    setRgb: vi.fn(),
    sendCommand: vi.fn(),
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
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url === '/command') {
        return {
          ok: false,
          text: async () => '',
          json: async () => ({}),
        } as Response
      }
      return {
        ok: true,
        text: async () => '',
        json: async () => ({}),
        headers: new Headers(init?.headers),
      } as Response
    })
    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch

    try {
      render(<ConnectionView />)

      const testButton = screen.getByRole('button', { name: /testovaci prikaz/i })
      await act(async () => {
        testButton.click()
      })

      expect(fetchMock).toHaveBeenCalledWith(
        '/command',
        expect.objectContaining({
          method: 'POST',
        })
      )
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
