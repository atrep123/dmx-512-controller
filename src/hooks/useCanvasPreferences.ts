import { useEffect, useState } from 'react'
import type { AppearancePreset } from '@/components/CustomLayoutRenderer'

const DEFAULT_APPEARANCES: AppearancePreset[] = ['soft', 'flat', 'glass']

export type CanvasPreferencesState = {
  appearance: AppearancePreset
  showGuides: boolean
  showSummary: boolean
}

export type UseCanvasPreferencesOptions = {
  allowedAppearances?: AppearancePreset[]
}

export type UseCanvasPreferencesReturn = {
  appearance: AppearancePreset
  setAppearance: (appearance: AppearancePreset) => void
  showGuides: boolean
  setShowGuides: (value: boolean) => void
  showSummary: boolean
  setShowSummary: (value: boolean) => void
  resetPreferences: () => void
}

export function useCanvasPreferences(
  storageKey: string,
  defaults: CanvasPreferencesState,
  options?: UseCanvasPreferencesOptions
): UseCanvasPreferencesReturn {
  const allowedAppearances = options?.allowedAppearances ?? DEFAULT_APPEARANCES
  const [appearance, setAppearance] = useState<AppearancePreset>(defaults.appearance)
  const [showGuides, setShowGuides] = useState(defaults.showGuides)
  const [showSummary, setShowSummary] = useState(defaults.showSummary)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) {
        return
      }
      const parsed = JSON.parse(raw) as Partial<CanvasPreferencesState>
      if (parsed.appearance && allowedAppearances.includes(parsed.appearance)) {
        setAppearance(parsed.appearance)
      }
      if (typeof parsed.showGuides === 'boolean') {
        setShowGuides(parsed.showGuides)
      }
      if (typeof parsed.showSummary === 'boolean') {
        setShowSummary(parsed.showSummary)
      }
    } catch (error) {
      console.error('canvas_prefs_load_failed', error)
    }
  }, [allowedAppearances, storageKey])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const payload: CanvasPreferencesState = {
      appearance,
      showGuides,
      showSummary,
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(payload))
    } catch (error) {
      console.error('canvas_prefs_save_failed', error)
    }
  }, [appearance, showGuides, showSummary, storageKey])

  const resetPreferences = () => {
    setAppearance(defaults.appearance)
    setShowGuides(defaults.showGuides)
    setShowSummary(defaults.showSummary)
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(storageKey)
      } catch (error) {
        console.error('canvas_prefs_reset_failed', error)
      }
    }
  }

  return {
    appearance,
    setAppearance,
    showGuides,
    setShowGuides,
    showSummary,
    setShowSummary,
    resetPreferences,
  }
}
