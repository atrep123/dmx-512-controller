import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import { createTestKVProvider } from '@/test/utils/createTestKVProvider'

const kvProvider = createTestKVProvider()

vi.mock('@github/spark/hooks', () => kvProvider)

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.clearAllTimers()
  vi.useRealTimers()
})
