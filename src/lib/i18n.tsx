import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { STORAGE_KEY, SUPPORTED_LOCALES, type TranslationKey } from './i18nMessages'
import {
  I18nContext,
  fallbackLocale,
  translations,
  type I18nContextValue,
  type Locale,
} from './i18nContext'

export type { TranslationKey } from './i18nMessages'
export type { Locale } from './i18nContext'

function formatMessage(template: string, vars?: Record<string, string | number>): string {
  if (!vars) {
    return template
  }
  return template.replace(/\{(\w+)\}/g, (_, token) => {
    const value = vars[token]
    return value === undefined ? '' : String(value)
  })
}

function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return fallbackLocale
  }
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored && isLocale(stored)) {
    return stored
  }
  const browser = window.navigator.language.toLowerCase()
  const match = SUPPORTED_LOCALES.find((locale) => browser.startsWith(locale))
  return match ?? fallbackLocale
}

function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectInitialLocale())

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next)
    }
  }, [])

  const translate = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const dictionary = translations[locale] ?? translations[fallbackLocale]
      const template = dictionary[key] ?? key
      return formatMessage(template, vars)
    },
    [locale]
  )

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: translate,
    }),
    [locale, setLocale, translate]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
