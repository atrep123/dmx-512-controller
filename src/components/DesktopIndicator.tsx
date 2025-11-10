import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { buildBackendUrl } from '@/lib/env'

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
        const response = await fetch(buildBackendUrl('/desktop/preferences'))
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        if (!cancelled) {
          setPrefs(data.preferences ?? {})
        }
      } catch (error) {
        if (!cancelled) {
          toast.error('Nepodarilo se nacist desktopova nastaveni')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    void loadPrefs()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return null
  }

  return (
    <div className="text-xs text-muted-foreground">
      Kanal: <strong>{prefs?.channel === 'beta' ? 'Beta' : 'Stable'}</strong> • Telemetrie:{' '}
      {prefs?.telemetryOptIn ? 'zapnuta' : 'vypnuta'}
    </div>
  )
}
