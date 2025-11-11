import { createContext } from 'react'
import {
  SUPPORTED_LOCALES,
  csMessages,
  enMessages,
  type TranslationKey,
} from './i18nMessages'

export type Locale = (typeof SUPPORTED_LOCALES)[number]

export type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

export const fallbackLocale: Locale = 'cs'

export const translations: Record<Locale, Record<TranslationKey, string>> = {
  cs: csMessages,
  en: enMessages,
}

export const I18nContext = createContext<I18nContextValue>({
  locale: fallbackLocale,
  setLocale: () => {},
  t: (key) => translations[fallbackLocale][key] ?? key,
})
