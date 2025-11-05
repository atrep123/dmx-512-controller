import { useEffect, useMemo, useState } from 'react'

export type MediaQueryProvider = (query: string) => {
  matches: boolean
  addEventListener?: (type: 'change', listener: (ev: MediaQueryListEvent) => void) => void
  removeEventListener?: (type: 'change', listener: (ev: MediaQueryListEvent) => void) => void
  addListener?: (listener: (ev: MediaQueryListEvent) => void) => void
  removeListener?: (listener: (ev: MediaQueryListEvent) => void) => void
}

const MOBILE_BREAKPOINT = 768

const defaultProvider: MediaQueryProvider = (query) => {
  if (typeof globalThis.matchMedia === 'function') {
    return globalThis.matchMedia(query)
  }
  return {
    matches: false,
  }
}

export function useIsMobile(mediaQueryProvider: MediaQueryProvider = defaultProvider) {
  const [isMobile, setIsMobile] = useState(false)
  const mql = useMemo(
    () => mediaQueryProvider(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`),
    [mediaQueryProvider],
  )

  useEffect(() => {
    const handleChange = (event?: MediaQueryListEvent) => {
      setIsMobile(event ? event.matches : mql.matches)
    }

    if (mql.addEventListener) {
      mql.addEventListener('change', handleChange)
    } else if (mql.addListener) {
      mql.addListener(handleChange)
    }

    handleChange()

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleChange)
      } else if (mql.removeListener) {
        mql.removeListener(handleChange)
      }
    }
  }, [mql])

  return isMobile
}
