import type { Timer } from '@/lib/dmxQueue'

export class FakeTimer implements Timer {
  nowValue = 0
  private timeouts = new Map<number, { at: number; handler: () => void }>()
  private rafs = new Map<number, { handler: (timestamp: number) => void }>()
  private nextId = 1

  now(): number {
    return this.nowValue
  }

  tick(ms: number) {
    this.nowValue += ms
    for (const [id, timeout] of [...this.timeouts]) {
      if (timeout.at <= this.nowValue) {
        this.timeouts.delete(id)
        timeout.handler()
      }
    }
    for (const [id, raf] of [...this.rafs]) {
      this.rafs.delete(id)
      raf.handler(this.nowValue)
    }
  }

  setTimeout(handler: () => void, delay: number): number {
    const id = this.nextId++
    this.timeouts.set(id, { at: this.nowValue + delay, handler })
    return id
  }

  clearTimeout(id: number): void {
    this.timeouts.delete(id)
  }

  requestAnimationFrame(cb: FrameRequestCallback): number {
    const id = this.nextId++
    this.rafs.set(id, { handler: cb })
    return id
  }

  cancelAnimationFrame(id: number): void {
    this.rafs.delete(id)
  }
}
