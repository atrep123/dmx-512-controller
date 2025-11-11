import '@testing-library/jest-dom'

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!globalThis.ResizeObserver) {
  // @ts-expect-error - mocking global for jsdom
  globalThis.ResizeObserver = ResizeObserverMock
}
