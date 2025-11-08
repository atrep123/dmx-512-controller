import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type Preferences = {
  channel?: string
  telemetryOptIn?: boolean
  completedAt?: number
}

export function DesktopIndicator() {
  const [prefs, setPrefs] = useState<Preferences | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const loadPrefs = async () => {
      try {
        const response = await fetch('/desktop/preferences')
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        if (!cancelled) {
          setPrefs(data.preferences ?? {})
        }
      } catch (error) {
        if (!cancelled) {
          toast.error('Nepodařilo se načíst desktopové nastavení')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    loadPrefs()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return null
  }

  return (
    <div className="text-xs text-muted-foreground">
      Kanál: <strong>{prefs?.channel === 'beta' ? 'Beta' : 'Stable'}</strong> • Telemetrie:{' '}
      {prefs?.telemetryOptIn ? 'zapnuta' : 'vypnuta'}
    </div>
  )
}
