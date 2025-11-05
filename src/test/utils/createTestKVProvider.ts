import { useState } from 'react'
import type { UseKVHook } from '@/state/kvProvider'

export function createTestKVProvider(
  initialState: Record<string, unknown> = {},
): { useKV: UseKVHook } {
  return {
    useKV: <T,>(key: string, initialValue: T) => {
      const value =
        (initialState[key] as T | undefined) ??
        initialValue
      return useState<T>(value)
    },
  }
}
