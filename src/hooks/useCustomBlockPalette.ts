import { useEffect, useState } from 'react'
import type { CustomBlockKind } from '@/lib/types'
import type { BlockPalette } from '@/components/CustomLayoutRenderer'

type PaletteOverrides = Partial<BlockPalette>

type UseCustomBlockPaletteReturn = {
  palette: BlockPalette
  overrides: PaletteOverrides
  setPaletteEntry: (kind: CustomBlockKind, value: string) => void
  resetPalette: () => void
}

export function useCustomBlockPalette(
  storageKey: string,
  basePalette: BlockPalette
): UseCustomBlockPaletteReturn {
  const [overrides, setOverrides] = useState<PaletteOverrides>({})

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) {
        return
      }
      const parsed = JSON.parse(raw) as PaletteOverrides
      if (parsed && typeof parsed === 'object') {
        setOverrides(parsed)
      }
    } catch (error) {
      console.error('custom_palette_load_failed', error)
    }
  }, [storageKey])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      if (Object.keys(overrides).length === 0) {
        window.localStorage.removeItem(storageKey)
      } else {
        window.localStorage.setItem(storageKey, JSON.stringify(overrides))
      }
    } catch (error) {
      console.error('custom_palette_save_failed', error)
    }
  }, [overrides, storageKey])

  const setPaletteEntry = (kind: CustomBlockKind, value: string) => {
    setOverrides((current) => {
      const next = { ...current }
      const normalized = value.trim()
      if (!normalized || normalized === basePalette[kind]) {
        delete next[kind]
      } else {
        next[kind] = normalized
      }
      return next
    })
  }

  const resetPalette = () => {
    setOverrides({})
  }

  return {
    palette: { ...basePalette, ...overrides },
    overrides,
    setPaletteEntry,
    resetPalette,
  }
}
