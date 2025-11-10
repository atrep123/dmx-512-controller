/**
 * Silent fetch wrapper that doesn't log connection errors
 */
export async function silentFetch(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(1000), // 1 second timeout
    });
    return await response.json();
  } catch (error) {
    // Return mock data based on endpoint
    if (url.includes("/metrics")) {
      return { status: "mock", channels: 0, timestamp: Date.now() };
    } else if (url.includes("/rgb")) {
      return { r: 0, g: 0, b: 0, mock: true };
    } else {
      return { success: true, mock: true };
    }
  }
}

// WebSocket with silent fallback
export class SilentWebSocket {
  private ws: WebSocket | null = null;
  private mockMode = false;

  constructor(url: string) {
    try {
      this.ws = new WebSocket(url);
      this.ws.onerror = () => {
        this.mockMode = true;
        this.ws = null;
      };
    } catch {
      this.mockMode = true;
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    }
    // Silently ignore if not connected
  }

  onmessage(callback: (data: any) => void) {
    if (this.ws) {
      this.ws.onmessage = (event) => callback(event.data);
    }
  }

  get isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  get isMockMode() {
    return this.mockMode;
  }
}
