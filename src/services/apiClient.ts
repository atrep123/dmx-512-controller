/**
 * Centralized API client with silent fallback to mock data
 */

import { buildBackendUrl, buildWebSocketUrl } from '@/lib/env'

class ApiClient {
  private mockMode = false
  private wsConnection: WebSocket | null = null

  async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 500)

      const response = await fetch(buildBackendUrl(endpoint), {
        ...options,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      this.mockMode = false
      return (await response.json()) as T
    } catch {
      // Silently fallback to mock data
      this.mockMode = true
      return this.getMockData(endpoint) as T
    }
  }

  private getMockData(endpoint: string): any {
    const mockData: Record<string, any> = {
      '/metrics': { status: 'mock', channels: 0, timestamp: Date.now() },
      '/rgb': { r: 0, g: 0, b: 0, mock: true },
      '/command': { success: true, mock: true },
    }

    return mockData[endpoint] || { mock: true }
  }

  connectWebSocket(onMessage?: (data: any) => void): void {
    try {
      this.wsConnection = new WebSocket(buildWebSocketUrl('/ws'))

      this.wsConnection.onerror = () => {
        this.wsConnection = null
        this.mockMode = true
      }

      if (onMessage) {
        this.wsConnection.onmessage = (event) => {
          try {
            onMessage(JSON.parse(event.data))
          } catch {
            // ignore malformed frames
          }
        }
      }
    } catch {
      this.mockMode = true
    }
  }

  get isMockMode(): boolean {
    return this.mockMode
  }
}

export const apiClient = new ApiClient()
