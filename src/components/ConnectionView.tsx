import { useState, useEffect, useRef, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  WifiHigh,
  WifiSlash,
  Plugs,
  CloudArrowDown,
  CloudArrowUp,
  CheckCircle,
  XCircle,
  Warning,
  Trash,
  Lightning,
} from '@phosphor-icons/react'
import { createServerClient, type ServerClient, type RgbStateMsg } from '@/lib/serverClient'
import { registerServerClient } from '@/lib/transport'

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

interface ConnectionSettings {
  protocol: 'artnet' | 'sacn' | 'usb'
  ipAddress: string
  port: number
  universe: number
  autoConnect: boolean
  sendRate: number
}

interface ConnectionProfile {
  id: string
  name: string
  settings: ConnectionSettings
}

type Metrics = Partial<{
  dmx_core_cmds_total: number
  dmx_core_queue_depth: number
  dmx_core_ws_clients: number
  dmx_core_apply_latency_ms_last: number
  dmx_engine_processed_total: number
  dmx_engine_queue_depth: number
  dmx_ws_clients: number
  dmx_engine_last_latency_ms: number
}>

const DEFAULT_SETTINGS: ConnectionSettings = {
  protocol: 'artnet',
  ipAddress: '192.168.1.100',
  port: 6454,
  universe: 0,
  autoConnect: false,
  sendRate: 40,
}

const STATUS_LABELS: Record<ConnectionStatus, string> = {
  connected: 'Připojeno',
  connecting: 'Připojování…',
  disconnected: 'Odpojeno',
  error: 'Chyba připojení',
}

const STATUS_COLORS: Record<ConnectionStatus, string> = {
  connected: 'bg-accent',
  connecting: 'bg-primary',
  disconnected: 'bg-muted',
  error: 'bg-destructive',
}

function parsePrometheus(text: string): Metrics {
  const out: Metrics = {}
  const lines = text.split('\n')
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue
    const [name, value] = line.split(/\s+/)
    if (!name || !value) continue
    const numeric = Number(value)
    if (Number.isNaN(numeric)) continue
    if (name.includes('dmx_core_cmds_total')) out.dmx_core_cmds_total = numeric
    else if (name.includes('dmx_core_queue_depth')) out.dmx_core_queue_depth = numeric
    else if (name.includes('dmx_core_ws_clients')) out.dmx_core_ws_clients = numeric
    else if (name.includes('dmx_core_apply_latency_ms_last')) out.dmx_core_apply_latency_ms_last = numeric
    else if (name.includes('dmx_engine_processed_total')) out.dmx_engine_processed_total = numeric
    else if (name.includes('dmx_engine_queue_depth')) out.dmx_engine_queue_depth = numeric
    else if (name.includes('dmx_ws_clients')) out.dmx_ws_clients = numeric
    else if (name.includes('dmx_engine_last_latency_ms')) out.dmx_engine_last_latency_ms = numeric
  }
  return out
}

function getStatusIcon(status: ConnectionStatus) {
  switch (status) {
    case 'connected':
      return <CheckCircle size={24} weight="fill" className="text-accent" />
    case 'connecting':
      return <WifiHigh size={24} className="text-primary animate-pulse" />
    case 'error':
      return <XCircle size={24} weight="fill" className="text-destructive" />
    default:
      return <WifiSlash size={24} className="text-muted-foreground" />
  }
}

function connectionSummary(settings?: ConnectionSettings) {
  if (!settings) return 'Nepřipojeno k DMX síti'
  if (settings.protocol === 'usb') return 'USB DMX rozhraní'
  return `${settings.protocol.toUpperCase()} – ${settings.ipAddress}:${settings.port}`
}

function formatTimestamp(ts?: number) {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return '—'
  }
}

function randomColorValue() {
  return Math.floor(Math.random() * 256)
}

const metricsValueOrDash = (value?: number) => (typeof value === 'number' && Number.isFinite(value) ? value : '—')

export default function ConnectionView() {
  const [connectionSettings, setConnectionSettings] = useKV<ConnectionSettings>('dmx-connection-settings', DEFAULT_SETTINGS)
  const [connectionProfiles, setConnectionProfiles] = useKV<ConnectionProfile[]>('dmx-connection-profiles', [])
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [isConnected, setIsConnected] = useState(false)
  const [serverState, setServerState] = useState<RgbStateMsg | null>(null)
  const [metrics, setMetrics] = useState<Metrics>({})
  const initialOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  const [online, setOnline] = useState(initialOnline)
  const [packetsSent, setPacketsSent] = useState(0)
  const [packetsReceived, setPacketsReceived] = useState(0)
  const [latencyMs, setLatencyMs] = useState<number | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)
  const [profileName, setProfileName] = useState('')
  const [editIp, setEditIp] = useState(connectionSettings?.ipAddress ?? DEFAULT_SETTINGS.ipAddress)
  const [editPort, setEditPort] = useState(connectionSettings?.port?.toString() ?? String(DEFAULT_SETTINGS.port))
  const [editUniverse, setEditUniverse] = useState(connectionSettings?.universe?.toString() ?? String(DEFAULT_SETTINGS.universe))
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [isRefreshingState, setIsRefreshingState] = useState(false)

  const clientRef = useRef<ServerClient | null>(null)
  const pendingCommandTsRef = useRef<number | null>(null)
  const connectToastShownRef = useRef(false)
  const autoConnectPrevRef = useRef(connectionSettings?.autoConnect ?? false)

  useEffect(() => {
    if (!connectionSettings) return
    setEditIp(connectionSettings.ipAddress)
    setEditPort(String(connectionSettings.port))
    setEditUniverse(String(connectionSettings.universe))
  }, [connectionSettings])

  const startClient = useCallback(() => {
    clientRef.current?.close()
    setConnectionStatus('connecting')
    setLastError(null)
    setPacketsSent(0)
    setPacketsReceived(0)
    setLatencyMs(null)
    setIsConnected(false)
    connectToastShownRef.current = false

    const client = createServerClient({
      onState: (message) => {
        setServerState(message)
        setPacketsReceived((prev) => prev + 1)
        setConnectionStatus('connected')
        setIsConnected(true)
        if (!connectToastShownRef.current) {
          toast.success('Připojeno k DMX backendu')
          connectToastShownRef.current = true
        }
        if (pendingCommandTsRef.current !== null) {
          setLatencyMs(Math.round(performance.now() - pendingCommandTsRef.current))
          pendingCommandTsRef.current = null
        }
      },
      on401: () => {
        setConnectionStatus('error')
        setLastError('Server odmítl token (401)')
        toast.error('Server odmítl token (401)')
      },
      onConnect: () => {
        setConnectionStatus((prev) => (prev === 'disconnected' ? 'connecting' : prev))
      },
      onDisconnect: () => {
        setIsConnected(false)
        setConnectionStatus((prev) => (prev === 'disconnected' ? prev : 'connecting'))
        registerServerClient(null)
      },
      onAck: (ack) => {
        if (ack.accepted && pendingCommandTsRef.current !== null) {
          setLatencyMs(Math.round(performance.now() - pendingCommandTsRef.current))
          pendingCommandTsRef.current = null
        }
      },
    })
    registerServerClient(client)
    clientRef.current = client
  }, [])

  const refreshMetrics = useCallback(async () => {
    try {
      const response = await fetch('/metrics', { cache: 'no-store' })
      if (!response.ok) throw new Error(`status ${response.status}`)
      const text = await response.text()
      setMetrics(parsePrometheus(text))
    } catch (error) {
      toast.error('Nepodařilo se načíst metriky')
      console.error('metrics_error', error)
    }
  }, [])

  const handleRefreshState = useCallback(async () => {
    try {
      setIsRefreshingState(true)
      const response = await fetch('/rgb', { cache: 'no-store' })
      if (!response.ok) throw new Error(`status ${response.status}`)
      const payload = (await response.json()) as Record<string, unknown>
      if (typeof payload.r === 'number' && typeof payload.g === 'number' && typeof payload.b === 'number') {
        const seq = typeof payload.seq === 'number' ? payload.seq : 0
        setServerState({ type: 'state', r: payload.r, g: payload.g, b: payload.b, seq })
      }
    } catch (error) {
      toast.error('Nepodařilo se načíst aktuální stav')
      console.error('refresh_state_error', error)
    } finally {
      setIsRefreshingState(false)
    }
  }, [])

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true)
      if (connectionSettings?.autoConnect ?? false) {
        startClient()
      }
    }
    const handleOffline = () => {
      setOnline(false)
      setIsConnected(false)
      setConnectionStatus('error')
      clientRef.current?.close()
      clientRef.current = null
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clientRef.current?.close()
      registerServerClient(null)
      clientRef.current = null
    }
  }, [connectionSettings?.autoConnect, startClient])

  useEffect(() => {
    const auto = connectionSettings?.autoConnect ?? false
    if (auto && !autoConnectPrevRef.current) {
      startClient()
    }
    autoConnectPrevRef.current = auto
  }, [connectionSettings?.autoConnect, startClient])

  useEffect(() => {
    if (!isConnected) return
    const interval = window.setInterval(() => {
      setPacketsSent((prev) => prev + (connectionSettings?.sendRate ?? 40))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [isConnected, connectionSettings?.sendRate])

  useEffect(() => {
    refreshMetrics().catch(() => undefined)
  }, [refreshMetrics])

  const handleConnect = useCallback(() => {
    if (isConnected || connectionStatus === 'connecting') {
      clientRef.current?.close()
      clientRef.current = null
      setIsConnected(false)
      setConnectionStatus('disconnected')
      toast.info('Odpojeno od DMX sítě')
      return
    }
    startClient()
  }, [connectionStatus, isConnected, startClient])

  const handleProtocolChange = (protocol: ConnectionSettings['protocol']) => {
    setConnectionSettings((current) => ({
      ...(current ?? DEFAULT_SETTINGS),
      protocol,
    }))
  }

  const handleSendRateChange = (rate: number) => {
    setConnectionSettings((current) => ({
      ...(current ?? DEFAULT_SETTINGS),
      sendRate: rate,
    }))
  }

  const handleAutoConnectChange = (enabled: boolean) => {
    setConnectionSettings((current) => ({
      ...(current ?? DEFAULT_SETTINGS),
      autoConnect: enabled,
    }))
    if (!enabled) {
      autoConnectPrevRef.current = false
      clientRef.current?.close()
      clientRef.current = null
      setIsConnected(false)
      setConnectionStatus('disconnected')
    } else {
      startClient()
    }
  }

  const handleSaveSettings = () => {
    const port = Number.parseInt(editPort, 10)
    const universe = Number.parseInt(editUniverse, 10)

    if (Number.isNaN(port) || port < 1 || port > 65535) {
      toast.error('Port musí být mezi 1 a 65535')
      return
    }
    if (Number.isNaN(universe) || universe < 0 || universe > 32767) {
      toast.error('Univerzum musí být mezi 0 a 32767')
      return
    }
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!ipPattern.test(editIp)) {
      toast.error('Zadejte platnou IPv4 adresu')
      return
    }

    setConnectionSettings(() => ({
      ...(connectionSettings ?? DEFAULT_SETTINGS),
      ipAddress: editIp,
      port,
      universe,
    }))
    toast.success('Nastavení připojení uloženo')
  }

  const handleQuickConnect = (profile: ConnectionProfile) => {
    setConnectionSettings(() => profile.settings)
    setEditIp(profile.settings.ipAddress)
    setEditPort(profile.settings.port.toString())
    setEditUniverse(profile.settings.universe.toString())
    toast.success(`Profil „${profile.name}” načten`)
  }

  const handleSaveProfile = () => {
    if (!profileName.trim()) {
      toast.error('Zadejte název profilu')
      return
    }
    const newProfile: ConnectionProfile = {
      id: Date.now().toString(),
      name: profileName.trim(),
      settings: connectionSettings ?? DEFAULT_SETTINGS,
    }
    setConnectionProfiles((current = []) => [...current, newProfile])
    setProfileName('')
    toast.success(`Profil „${newProfile.name}” uložen`)
  }

  const handleDeleteProfile = (profileId: string) => {
    setConnectionProfiles((current = []) => current.filter((profile) => profile.id !== profileId))
    toast.success('Profil odstraněn')
  }

  const handleSendTestCommand = async () => {
    const r = randomColorValue()
    const g = randomColorValue()
    const b = randomColorValue()
    try {
      setIsSendingTest(true)
      pendingCommandTsRef.current = performance.now()
      clientRef.current?.setRgb(r, g, b)
      if (connectionStatus !== 'connected') {
        const body = JSON.stringify({
          type: 'dmx.patch',
          id: crypto.randomUUID(),
          ts: Date.now(),
          universe: 0,
          patch: [
            { ch: 1, val: r },
            { ch: 2, val: g },
            { ch: 3, val: b },
          ],
        })
        // Prefer legacy REST endpoint for compatibility; fallback to unified /command
        let ok = false
        try {
          const resRgb = await fetch('/rgb', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ cmdId: crypto.randomUUID(), src: 'ui', r, g, b }),
          })
          ok = resRgb.ok
        } catch {
          ok = false
        }
        if (!ok) {
          await fetch('/command', { method: 'POST', headers: { 'content-type': 'application/json' }, body })
        }
      }
      setPacketsSent((prev) => prev + 1)
      toast.success(`Testovací barva odeslána (${r}, ${g}, ${b})`)
    } catch (error) {
      pendingCommandTsRef.current = null
      toast.error('Nepodařilo se odeslat testovací příkaz')
      console.error('test_command_error', error)
    } finally {
      setIsSendingTest(false)
    }
  }

  const metricsDisplay = {
    commands: metrics.dmx_core_cmds_total ?? metrics.dmx_engine_processed_total,
    queue: metrics.dmx_core_queue_depth ?? metrics.dmx_engine_queue_depth,
    ws: metrics.dmx_core_ws_clients ?? metrics.dmx_ws_clients,
    latency: metrics.dmx_core_apply_latency_ms_last ?? metrics.dmx_engine_last_latency_ms,
  }

  return (
    <div className="space-y-6">
      {!online && (
        <div className="rounded-md border border-yellow-400 bg-yellow-100 px-3 py-2 text-sm text-yellow-900">
          Offline – klient zkusí automaticky obnovit připojení, jakmile bude síť dostupná.
        </div>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => refreshMetrics()}>
            <Lightning size={16} />
            Refresh metrics
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => handleRefreshState()}
            disabled={isRefreshingState}
          >
            <CloudArrowDown size={16} />
            {isRefreshingState ? 'Načítám…' : 'Načíst stav'}
          </Button>
        </div>
        <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
          <span>cmds_total: {metricsValueOrDash(metricsDisplay.commands)}</span>
          <span>queue: {metricsValueOrDash(metricsDisplay.queue)}</span>
          <span>ws: {metricsValueOrDash(metricsDisplay.ws)}</span>
          <span>last_ms: {metricsValueOrDash(metricsDisplay.latency)}</span>
        </div>
      </div>

      <Card className="p-6 space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className={`rounded-full ${STATUS_COLORS[connectionStatus]}/20 p-3`}>
              {getStatusIcon(connectionStatus)}
            </div>
            <div>
              <h3 className="font-semibold">{STATUS_LABELS[connectionStatus]}</h3>
              <p className="text-sm text-muted-foreground">{connectionSummary(connectionSettings)}</p>
              {serverState && (
                <p className="text-xs text-muted-foreground mt-2">
                  Poslední stav · RGB {serverState.r}/{serverState.g}/{serverState.b} · Seq {serverState.seq}
                </p>
              )}
              {lastError && (
                <div className="mt-2 flex items-center gap-2 text-xs text-destructive">
                  <Warning size={14} weight="fill" />
                  <span>{lastError}</span>
                </div>
              )}
            </div>
          </div>
          <Badge variant={isConnected ? 'default' : 'outline'} className={isConnected ? STATUS_COLORS[connectionStatus] : ''}>
            {isConnected ? 'Aktivní' : 'Neaktivní'}
          </Badge>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button
            onClick={handleConnect}
            className="flex-1 gap-2"
            size="lg"
            variant={connectionStatus === 'error' ? 'destructive' : 'default'}
          >
            <Plugs weight="bold" />
            {connectionStatus === 'connecting'
              ? 'Připojování…'
              : isConnected
                ? 'Odpojit'
                : 'Připojit'}
          </Button>
          <Button variant="secondary" onClick={() => handleSendTestCommand()} disabled={isSendingTest} className="flex-1 gap-2">
            <CloudArrowUp size={18} />
            {isSendingTest ? 'Odesílám…' : 'Testovací příkaz'}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2 mb-1">
              <CloudArrowUp size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Odeslané příkazy</span>
            </div>
            <p className="text-xl font-bold" data-testid="packets-sent">
              {packetsSent.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2 mb-1">
              <CloudArrowDown size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Přijaté stavy</span>
            </div>
            <p className="text-xl font-bold" data-testid="packets-received">
              {packetsReceived.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2 mb-1">
              <Lightning size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Poslední latence</span>
            </div>
            <p className="text-xl font-bold" data-testid="latency-ms">
              {latencyMs === null ? '—' : `${latencyMs} ms`}
            </p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings">Nastavení</TabsTrigger>
          <TabsTrigger value="profiles">Profily</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-1">Nastavení sítě</h3>
              <p className="text-sm text-muted-foreground">Konfigurace protokolu a síťových parametrů</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="protocol">Protokol</Label>
                <Select value={connectionSettings?.protocol} onValueChange={handleProtocolChange}>
                  <SelectTrigger id="protocol">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="artnet">Art-Net</SelectItem>
                    <SelectItem value="sacn">sACN (E1.31)</SelectItem>
                    <SelectItem value="usb">USB DMX</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {connectionSettings?.protocol === 'artnet'
                    ? 'Art-Net protokol pro ethernetové DMX.'
                    : connectionSettings?.protocol === 'sacn'
                      ? 'sACN (E1.31) streaming DMX protokol.'
                      : 'USB DMX rozhraní.'}
                </p>
              </div>

              {connectionSettings?.protocol !== 'usb' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="ip-address">IP adresa</Label>
                    <Input id="ip-address" value={editIp} onChange={(event) => setEditIp(event.target.value)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="port">Port</Label>
                      <Input
                        id="port"
                        type="number"
                        value={editPort}
                        onChange={(event) => setEditPort(event.target.value)}
                        placeholder="6454"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="universe">Univerzum</Label>
                      <Input
                        id="universe"
                        type="number"
                        value={editUniverse}
                        onChange={(event) => setEditUniverse(event.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="send-rate">
                  Frekvence odesílání: {connectionSettings?.sendRate ?? DEFAULT_SETTINGS.sendRate} Hz
                </Label>
                <input
                  id="send-rate"
                  type="range"
                  min="20"
                  max="60"
                  step="5"
                  value={connectionSettings?.sendRate ?? DEFAULT_SETTINGS.sendRate}
                  onChange={(event) => handleSendRateChange(Number(event.target.value))}
                  className="w-full cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Vyšší frekvence = plynulejší řízení, ale větší síťový provoz.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor="auto-connect" className="cursor-pointer">
                    Automatické připojení při startu
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Automaticky naváže spojení při otevření aplikace
                  </p>
                </div>
                <Switch
                  id="auto-connect"
                  checked={connectionSettings?.autoConnect ?? false}
                  onCheckedChange={handleAutoConnectChange}
                />
              </div>

              <Button onClick={handleSaveSettings} variant="default" className="w-full gap-2">
                <CloudArrowUp weight="bold" />
                Uložit nastavení
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4 mt-4">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Profily připojení</h3>
              <p className="text-sm text-muted-foreground">Ukládání a načítání přednastavených konfigurací</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-name">Uložit aktuální jako profil</Label>
              <div className="flex gap-2">
                <Input
                  id="profile-name"
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                  placeholder="např. Venue A, Studio"
                />
                <Button onClick={handleSaveProfile} disabled={!profileName.trim()}>
                  Uložit
                </Button>
              </div>
            </div>

            {(connectionProfiles ?? []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Zatím žádné uložené profily</div>
            ) : (
              <div className="space-y-2">
                <Label>Uložené profily</Label>
                {(connectionProfiles ?? []).map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{profile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {profile.settings.protocol.toUpperCase()} · {profile.settings.ipAddress}:{profile.settings.port}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleQuickConnect(profile)}>
                        Načíst
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteProfile(profile.id)}>
                        <Trash size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
