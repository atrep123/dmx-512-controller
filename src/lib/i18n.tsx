import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'app.locale'
const SUPPORTED_LOCALES = ['cs', 'en'] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

const baseMessages = {
  'app.header.title': 'DMX 512 Kontrolér',
  'app.header.subtitle': 'Profesionální řízení osvětlení a motorů',
  'app.tabs.custom': 'Moje stránka',
  'app.tabs.blocks': 'UI bloky',
  'app.tabs.live': 'Kontrola',
  'app.tabs.fixtures': 'Světla',
  'app.tabs.motors': 'Motory',
  'app.tabs.effects': 'Efekty',
  'app.tabs.scenes': 'Scény',
  'app.tabs.connection': 'Připojení',
  'app.tabs.setup': 'Nastavení',
  'app.loading': 'Načítám…',
  'toast.show.save_error': 'Nepodařilo se uložit konfiguraci',
  'toast.show.load_error': 'Nepodařilo se načíst konfiguraci',
  'toast.scenes.load_error': 'Nepodařilo se načíst scény',
  'toast.scenes.save_error': 'Nepodařilo se uložit scény',
  'desktop.onboarding.steps.welcome.title': 'Vítej v Atmosfil Desktop',
  'desktop.onboarding.steps.welcome.description': 'Nastavíme DMX uzly, ochranu a aktualizace.',
  'desktop.onboarding.steps.consent.title': 'Licence a diagnostika',
  'desktop.onboarding.steps.consent.description': 'Potvrď podmínky a sběr anonymních logů.',
  'desktop.onboarding.steps.detect.title': 'Detekce DMX zařízení',
  'desktop.onboarding.steps.detect.description': 'Prohledáme USB/Art-Net a připravíme test.',
  'desktop.onboarding.steps.test.title': 'Ověření výstupu',
  'desktop.onboarding.steps.test.description': 'Vyšleme krátký DMX impuls na zvolený kanál.',
  'desktop.onboarding.steps.channel.title': 'Aktualizační kanál',
  'desktop.onboarding.steps.channel.description': 'Zvol beta nebo stable feed pro auto-update.',
  'desktop.onboarding.steps.finish.title': 'Hotovo',
  'desktop.onboarding.steps.finish.description': 'Uložíme nastavení a spustíme hlavní aplikaci.',
  'desktop.onboarding.actions.back': 'Zpět',
  'desktop.onboarding.actions.next': 'Pokračovat',
  'desktop.onboarding.actions.finish': 'Dokončit a spustit',
  'desktop.onboarding.summary.title': 'Shrnutí',
  'desktop.onboarding.summary.device': 'Zařízení',
  'desktop.onboarding.summary.device.none': 'není vybráno',
  'desktop.onboarding.summary.telemetry': 'Telemetrie',
  'desktop.onboarding.summary.telemetry.enabled': 'zapnuta',
  'desktop.onboarding.summary.telemetry.disabled': 'vypnuta',
  'desktop.onboarding.summary.channel': 'Update kanál',
  'desktop.onboarding.summary.body':
    'Po dokončení spustíme hlavní UI, backend poběží jako sidecar (PyInstaller). Průvodce můžete kdykoliv znovu otevřít v Nastavení > Desktop.',
  'desktop.onboarding.channel.helper':
    'Tauri updater kontroluje GitHub Releases. Stable kanál obsahuje podepsané buildy po QA, beta přináší nejnovější DMX funkce (může být méně stabilní).',
  'desktop.onboarding.channel.stable.title': 'Stable',
  'desktop.onboarding.channel.stable.description': 'Doporučeno pro živé eventy. Aktualizace jen po plné QA.',
  'desktop.onboarding.channel.beta.title': 'Beta',
  'desktop.onboarding.channel.beta.description':
    'Nejnovější funkce (wizard, timecode, AI asistence). Může obsahovat breaking changes.',
  'desktop.onboarding.status.loadingPrefs': 'Načítám uložené nastavení…',
  'desktop.onboarding.error.load_prefs': 'Nepodařilo se načíst uložené nastavení.',
  'desktop.onboarding.error.save_prefs': 'Nepodařilo se uložit desktopové nastavení.',
  'desktop.onboarding.toast.complete': 'Desktop průvodce dokončen. Spouštíme aplikaci.',
  'desktop.onboarding.toast.no_device': 'Vyber zařízení pro test DMX rámce.',
  'desktop.onboarding.toast.test_success': 'Testovací DMX rámec odeslán',
  'desktop.onboarding.toast.test_error': 'DMX test selhal – zkontroluj kabeláž nebo IP adresu.',
  'desktop.onboarding.test.success': 'Rámec doručen ({target})',
  'desktop.backend.waiting': 'Cekam na desktop backend...',
  'desktop.backend.ready': 'Desktop backend je pripraven.',
  'desktop.backend.error': 'Desktop backend se nepodarilo spustit.',
  'desktop.onboarding.test.errorUnknown': 'Test DMX selhal',
} as const

export type TranslationKey = keyof typeof baseMessages

const csMessages: Record<TranslationKey, string> = { ...baseMessages }

const enMessages: Record<TranslationKey, string> = {
  'app.header.title': 'DMX 512 Controller',
  'app.header.subtitle': 'Professional lighting and motion control',
  'app.tabs.custom': 'My page',
  'app.tabs.blocks': 'UI blocks',
  'app.tabs.live': 'Live control',
  'app.tabs.fixtures': 'Fixtures',
  'app.tabs.motors': 'Motors',
  'app.tabs.effects': 'Effects',
  'app.tabs.scenes': 'Scenes',
  'app.tabs.connection': 'Connection',
  'app.tabs.setup': 'Settings',
  'app.loading': 'Loading…',
  'toast.show.save_error': 'Failed to save configuration',
  'toast.show.load_error': 'Failed to load configuration',
  'toast.scenes.load_error': 'Failed to load scenes',
  'toast.scenes.save_error': 'Failed to save scenes',
  'desktop.onboarding.steps.welcome.title': 'Welcome to Atmosfil Desktop',
  'desktop.onboarding.steps.welcome.description': 'We will configure DMX nodes, safety and updates.',
  'desktop.onboarding.steps.consent.title': 'License & diagnostics',
  'desktop.onboarding.steps.consent.description': 'Accept the terms and telemetry collection.',
  'desktop.onboarding.steps.detect.title': 'Detect DMX devices',
  'desktop.onboarding.steps.detect.description': 'Scan USB/Art-Net and prepare the test.',
  'desktop.onboarding.steps.test.title': 'Output verification',
  'desktop.onboarding.steps.test.description': 'Send a short DMX pulse to the selected channel.',
  'desktop.onboarding.steps.channel.title': 'Update channel',
  'desktop.onboarding.steps.channel.description': 'Choose stable or beta feed for auto-updates.',
  'desktop.onboarding.steps.finish.title': 'All set',
  'desktop.onboarding.steps.finish.description': 'Save preferences and start the main app.',
  'desktop.onboarding.actions.back': 'Back',
  'desktop.onboarding.actions.next': 'Continue',
  'desktop.onboarding.actions.finish': 'Finish and launch',
  'desktop.onboarding.summary.title': 'Summary',
  'desktop.onboarding.summary.device': 'Device',
  'desktop.onboarding.summary.device.none': 'not selected',
  'desktop.onboarding.summary.telemetry': 'Telemetry',
  'desktop.onboarding.summary.telemetry.enabled': 'enabled',
  'desktop.onboarding.summary.telemetry.disabled': 'disabled',
  'desktop.onboarding.summary.channel': 'Update channel',
  'desktop.onboarding.summary.body':
    'After finishing we will launch the main UI and keep the backend sidecar (PyInstaller) running. You can rerun this wizard anytime under Settings > Desktop.',
  'desktop.onboarding.channel.helper':
    'The Tauri updater checks GitHub Releases. Stable contains signed builds after QA, beta ships the latest DMX features (potentially less stable).',
  'desktop.onboarding.channel.stable.title': 'Stable',
  'desktop.onboarding.channel.stable.description': 'Recommended for live shows. Updates land after full QA.',
  'desktop.onboarding.channel.beta.title': 'Beta',
  'desktop.onboarding.channel.beta.description':
    'Newest features (wizard, timecode, AI assistant). May contain breaking changes.',
  'desktop.onboarding.status.loadingPrefs': 'Loading saved preferences…',
  'desktop.onboarding.error.load_prefs': 'Could not load saved preferences.',
  'desktop.onboarding.error.save_prefs': 'Could not save desktop preferences.',
  'desktop.onboarding.toast.complete': 'Desktop onboarding finished. Launching the app.',
  'desktop.onboarding.toast.no_device': 'Select a device before running the DMX test.',
  'desktop.onboarding.toast.test_success': 'DMX test frame sent',
  'desktop.onboarding.toast.test_error': 'DMX test failed – check cables or IP address.',
  'desktop.onboarding.test.success': 'Frame delivered ({target})',
  'desktop.backend.waiting': 'Waiting for desktop backend...',
  'desktop.backend.ready': 'Desktop backend is ready.',
  'desktop.backend.error': 'Desktop backend failed to start.',
  'desktop.onboarding.test.errorUnknown': 'DMX test failed',
}

const translations: Record<Locale, Record<TranslationKey, string>> = {
  cs: csMessages,
  en: enMessages,
}

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

const fallbackLocale: Locale = 'cs'

const I18nContext = createContext<I18nContextValue>({
  locale: fallbackLocale,
  setLocale: () => {},
  t: (key) => translations[fallbackLocale][key] ?? key,
})

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

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
