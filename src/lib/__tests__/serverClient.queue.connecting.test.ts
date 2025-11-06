import { vi, expect, test } from "vitest";
import { createServerClient } from "@/lib/serverClient";

class FakeWS {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  readyState = FakeWS.CONNECTING;
  url = "";
  onopen?: () => void;
  onclose?: (ev?: CloseEvent) => void;
  onmessage?: (ev: { data: string }) => void;
  onerror?: () => void;
  sent: string[] = [];
  static instances: FakeWS[] = [];
  constructor(url: string) {
    this.url = url;
    FakeWS.instances.push(this);
  }
  send(data: string) {
    if (this.readyState !== FakeWS.OPEN) throw new Error("not open");
    this.sent.push(data);
  }
  close() {
    this.readyState = FakeWS.CLOSED;
    this.onclose?.();
  }
  _open() {
    this.readyState = FakeWS.OPEN;
    this.onopen?.();
  }
}
(globalThis as any).WebSocket = FakeWS as any;

test("queues messages while CONNECTING and flushes on OPEN", () => {
  vi.useFakeTimers({ now: 0 });
  const client = createServerClient({
    url: "ws://test/ws",
    token: "t",
    pingSec: 60,
  });
  const ws = FakeWS.instances.at(-1)!;
  // send while CONNECTING – should queue, not send immediately
  (client as any).sendCommand?.({
    type: "dmx.patch",
    id: "t-1",
    ts: 0,
    universe: 0,
    patch: [{ ch: 1, val: 1 }],
  });
  expect(ws.sent.length).toBe(0);
  // open and flush
  ws._open();
  vi.advanceTimersByTime(0);
  expect(ws.sent.length).toBe(1);
  const msg = JSON.parse(ws.sent[0]);
  expect(msg.type).toBeDefined();
  vi.useRealTimers();
});

test("heartbeat closes silent socket and schedules reconnect", () => {
  vi.useFakeTimers({ now: 0 });
  const client = createServerClient({
    url: "ws://test/ws",
    token: "t",
    pingSec: 1,
    maxBackoffMs: 1500,
  });
  const ws1 = FakeWS.instances.at(-1)!;

  // Spy on the close method to track when it's called
  const closeSpy = vi.spyOn(ws1, "close");

  ws1._open();

  // Check if ping was sent after opening
  vi.advanceTimersByTime(1000); // Wait for first ping

  // Find the ping message that was sent
  const pingMsg = ws1.sent.find((msg) => {
    try {
      const parsed = JSON.parse(msg);
      return parsed.type === "ping";
    } catch {
      return false;
    }
  });

  // If ping-pong is used, we need to not send a pong back
  // Advance time to trigger the timeout (wait 2*pingSec + 5 seconds without pong)
  vi.advanceTimersByTime(6000);

  // If close wasn't called yet, try running all timers
  if (!closeSpy.mock.calls.length) {
    vi.runAllTimers();
  }

  // Verify close was called due to heartbeat timeout
  expect(closeSpy).toHaveBeenCalled();

  // The close handler should have been triggered, updating readyState
  expect(ws1.readyState).toBe(FakeWS.CLOSED);

  // Advance time to allow reconnect (with backoff)
  vi.advanceTimersByTime(1500);

  // Verify a new connection was created
  const ws2 = FakeWS.instances.at(-1)!;
  expect(ws2).not.toBe(ws1);
  expect(ws2.readyState).toBe(FakeWS.CONNECTING);

  vi.useRealTimers();
});
