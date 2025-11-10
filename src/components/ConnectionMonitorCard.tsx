import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { WifiHigh, WifiSlash, Warning, Lightning } from '@phosphor-icons/react'
import { buildBackendUrl } from '@/lib/env'
import { parseDmxMetrics, type DmxMetrics } from '@/lib/metrics'

type MonitorStatus = 'loading' | 'online' | 'degraded' | 'offline'

type ConnectionMonitorCardProps = {
  pollInterval?: number
}

const STATUS_TEXT: Record<MonitorStatus, string> = {
  loading: 'Načítám…',
  online: 'Backend běží',
  degraded: 'Bez aktivních klientů',
  offline: 'Nedostupný',
}

export default function ConnectionMonitorCard({ pollInterval = 8000 }: ConnectionMonitorCardProps) {
  const [status, setStatus] = useState<MonitorStatus>('loading')
  const [metrics, setMetrics] = useState<DmxMetrics>({})
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const evaluateStatus = useCallback((data: DmxMetrics): MonitorStatus => {
    if (!data) return 'loading'
    if ((data.dmx_core_ws_clients ?? 0) > 0 || (data.dmx_ws_clients ?? 0) > 0) {
      return 'online'
    }
    if (Object.keys(data).length > 0) {
      return 'degraded'
    }
    return 'offline'
  }, [])

  const fetchMetrics = useCallback(async () => {
    setRefreshing(true)
    try {
      const response = await fetch(buildBackendUrl('/metrics'), { cache: 'no-store' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const text = await response.text()
      const parsed = parseDmxMetrics(text)
      setMetrics(parsed)
      setStatus(evaluateStatus(parsed))
      setLastUpdated(Date.now())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus('offline')
    } finally {
      setRefreshing(false)
    }
  }, [evaluateStatus])

  useEffect(() => {
    let cancelled = false
    const tick = async () => {
      if (cancelled) return
      await fetchMetrics()
    }
    void tick()
    const id = window.setInterval(tick, pollInterval)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [fetchMetrics, pollInterval])

  const queueDepth = metrics.dmx_core_queue_depth ?? metrics.dmx_engine_queue_depth ?? 0
  const queuePercent = Math.min(100, Math.round(((queueDepth ?? 0) / 64) * 100))
  const applyLatency = metrics.dmx_core_apply_latency_ms_last ?? metrics.dmx_engine_last_latency_ms ?? null

  const statusIcon = useMemo(() => {
    switch (status) {
      case 'online':
        return <WifiHigh size={20} className="text-accent" />
      case 'degraded':
        return <Lightning size={20} className="text-yellow-500" />
      case 'offline':
        return <WifiSlash size={20} className="text-destructive" />
      default:
        return <Warning size={20} className="text-muted-foreground animate-pulse" />
    }
  }, [status])

  return (
    <Card className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Backend</p>
          <div className="flex items-center gap-2">
            {statusIcon}
            <p className="text-sm font-semibold">{STATUS_TEXT[status]}</p>
          </div>
          {error ? <p className="text-xs text-destructive mt-1">Chyba: {error}</p> : null}
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>WS klienti: {metrics.dmx_core_ws_clients ?? metrics.dmx_ws_clients ?? 0}</p>
          <p>Cmds total: {metrics.dmx_core_cmds_total ?? metrics.dmx_engine_processed_total ?? 0}</p>
          <p>
            Latence:{' '}
            {typeof applyLatency === 'number' ? `${applyLatency.toFixed(1)} ms` : '—'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span>Queue depth</span>
          <Badge variant="outline">{queueDepth ?? 0}</Badge>
        </div>
        <Progress value={queuePercent} />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Aktualizováno: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—'}</span>
        <Button variant="outline" size="sm" onClick={() => fetchMetrics()} disabled={refreshing}>
          {refreshing ? 'Obnovuji…' : 'Obnovit'}
        </Button>
      </div>
    </Card>
  )
}
