import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  Broadcast,
  CheckCircle,
  Lightning,
  Plugs,
  ShieldCheck,
  Sparkle,
  CircleNotch,
} from '@phosphor-icons/react'

export const ONBOARDING_STORAGE_KEY = 'desktop.onboarding'

const STEPS = [
  { id: 'welcome', title: 'Vítej v Atmosfil Desktop', description: 'Nastavíme DMX uzly, ochranu a aktualizace.' },
  { id: 'consent', title: 'Licence a diagnostika', description: 'Potvrď podmínky a sběr anonymních logů.' },
  { id: 'detect', title: 'Detekce DMX zařízení', description: 'Prohledáme USB/Art-Net a připravíme test.' },
  { id: 'test', title: 'Ověření výstupu', description: 'Vyšleme krátký DMX impuls na zvolený kanál.' },
  { id: 'channel', title: 'Aktualizační kanál', description: 'Zvol beta nebo stable feed pro auto-update.' },
  { id: 'finish', title: 'Hotovo', description: 'Uložíme nastavení a spustíme hlavní aplikaci.' },
] as const

type StepId = (typeof STEPS)[number]['id']

type SerialDevice = {
  type: 'serial'
  path: string
  vendor?: string
  product?: string
  serialNumber?: string | null
  capabilities?: string[]
}

type ArtNetNode = {
  type: 'artnet'
  ip: string
  shortName?: string
  longName?: string
}

type DiscoveredDevice = SerialDevice | ArtNetNode

type UpdateChannel = 'stable' | 'beta'

type DesktopPreferencesPayload = {
  channel: UpdateChannel
  telemetryOptIn: boolean
  completedAt: number
}

interface DesktopOnboardingProps {
  onComplete?: () => void
}

function deviceKey(device: DiscoveredDevice): string {
  return device.type === 'serial' ? `serial:${device.path}` : `artnet:${device.ip}`
}

function buildDeviceLabel(device: DiscoveredDevice): string {
  if (device.type === 'serial') {
    return device.product || device.vendor || device.path
  }
  return device.longName || device.shortName || device.ip
}

function buildDeviceSubtitle(device: DiscoveredDevice): string {
  if (device.type === 'serial') {
    return `${device.vendor ?? 'USB'} • ${device.path}`
  }
  return `Art-Net • ${device.ip}`
}

function DeviceCard({
  device,
  selected,
  onClick,
}: {
  device: DiscoveredDevice
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/60'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="font-semibold">{buildDeviceLabel(device)}</span>
          <span className="text-xs text-muted-foreground">{buildDeviceSubtitle(device)}</span>
        </div>
        <Badge variant={selected ? 'default' : 'outline'} className="flex items-center gap-1">
          {device.type === 'serial' ? <Plugs size={14} /> : <Broadcast size={14} />}
          {device.type === 'serial' ? 'USB' : 'Art-Net'}
        </Badge>
      </div>
      {device.type === 'serial' && device.capabilities?.length ? (
        <p className="mt-2 text-xs text-muted-foreground">Funkce: {device.capabilities.join(', ')}</p>
      ) : null}
    </button>
  )
}

export function DesktopOnboarding({ onComplete }: DesktopOnboardingProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [telemetryOptIn, setTelemetryOptIn] = useState(false)
  const [devices, setDevices] = useState<{ serial: SerialDevice[]; artnet: ArtNetNode[] }>({ serial: [], artnet: [] })
  const [devicesLoading, setDevicesLoading] = useState(false)
  const [devicesError, setDevicesError] = useState<string | null>(null)
  const [lastScanTs, setLastScanTs] = useState<number | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<DiscoveredDevice | null>(null)
  const [testChannel, setTestChannel] = useState(1)
  const [testValue, setTestValue] = useState(255)
  const [testStatus, setTestStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState<string | null>(null)
  const [updateChannel, setUpdateChannel] = useState<UpdateChannel>('stable')
  const [prefsHydrated, setPrefsHydrated] = useState(false)

  const apiBase = useMemo(() => {
    if (typeof window === 'undefined') return ''
    return '__TAURI_INTERNALS__' in window ? 'http://127.0.0.1:8080' : ''
  }, [])

  const step = STEPS[stepIndex]
  const progressValue = (stepIndex / (STEPS.length - 1)) * 100
  const isLastStep = stepIndex === STEPS.length - 1

  const buildUrl = useCallback(
    (path: string) => {
      if (apiBase && path.startsWith('http')) return path
      return apiBase ? `${apiBase}${path}` : path
    },
    [apiBase]
  )

  const fetchDevices = useCallback(async () => {
    setDevicesLoading(true)
    setDevicesError(null)
    try {
      const response = await fetch(buildUrl('/dmx/devices'))
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const body = (await response.json()) as { serial?: SerialDevice[]; artnet?: ArtNetNode[] }
      const next = {
        serial: Array.isArray(body.serial) ? body.serial : [],
        artnet: Array.isArray(body.artnet) ? body.artnet : [],
      }
      setDevices(next)
      setLastScanTs(Date.now())
      const preferred: DiscoveredDevice | null =
        (next.serial.length ? next.serial[0] : null) ?? (next.artnet.length ? next.artnet[0] : null)
      if (preferred) {
        setSelectedDevice((current) => current ?? preferred)
      }
    } catch (error) {
      setDevicesError(error instanceof Error ? error.message : 'Neznámá chyba při detekci.')
    } finally {
      setDevicesLoading(false)
    }
  }, [buildUrl])

  useEffect(() => {
    if (step.id === 'detect') {
      void fetchDevices()
    }
  }, [fetchDevices, step.id])

  useEffect(() => {
    if (step.id !== 'test') {
      setTestStatus('idle')
      setTestMessage(null)
    }
  }, [step.id])

  useEffect(() => {
    if (prefsHydrated) {
      return
    }
    let cancelled = false
    const loadPrefs = async () => {
      try {
        const response = await fetch(buildUrl('/desktop/preferences'))
        if (!response.ok) return
        const body = (await response.json()) as {
          preferences?: Partial<DesktopPreferencesPayload> & { telemetryOptIn?: boolean }
        }
        if (cancelled) return
        const prefs = body.preferences ?? {}
        if (prefs.channel === 'beta' || prefs.channel === 'stable') {
          setUpdateChannel(prefs.channel)
        }
        if (typeof prefs.telemetryOptIn === 'boolean') {
          setTelemetryOptIn(prefs.telemetryOptIn)
        }
      } catch (error) {
        console.warn('desktop_prefs_load_failed', error)
      } finally {
        if (!cancelled) {
          setPrefsHydrated(true)
        }
      }
    }
    loadPrefs()
    return () => {
      cancelled = true
    }
  }, [buildUrl, prefsHydrated])

  const persistPreferences = useCallback(
    async (payload: DesktopPreferencesPayload) => {
      try {
        const response = await fetch(buildUrl('/desktop/preferences'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!response.ok) {
          const text = await response.text()
          throw new Error(text || `HTTP ${response.status}`)
        }
      } catch (error) {
        console.warn('desktop_prefs_save_failed', error)
        toast.error('Nepodařilo se uložit desktopové nastavení')
      }
    },
    [buildUrl]
  )

  const allDevices: DiscoveredDevice[] = useMemo(
    () => [...devices.serial, ...devices.artnet],
    [devices.serial, devices.artnet]
  )

  const nextDisabled = useMemo(() => {
    switch (step.id) {
      case 'consent':
        return !acceptedTerms
      case 'detect':
        return !selectedDevice
      case 'test':
        return testStatus !== 'success'
      case 'channel':
        return !updateChannel
      default:
        return false
    }
  }, [acceptedTerms, selectedDevice, step.id, testStatus, updateChannel])

  const goNext = () => {
    if (isLastStep) {
      void finishOnboarding()
    } else {
      setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1))
    }
  }

  const goBack = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0))
  }

  const finishOnboarding = useCallback(async () => {
    const completedAt = Date.now()
    if (typeof window !== 'undefined') {
      try {
        const record = {
          completedAt: new Date(completedAt).toISOString(),
          telemetryOptIn,
          updateChannel,
          device:
            selectedDevice?.type === 'serial'
              ? {
                  type: selectedDevice.type,
                  path: selectedDevice.path,
                  vendor: selectedDevice.vendor,
                  product: selectedDevice.product,
                }
              : selectedDevice
              ? {
                  type: selectedDevice.type,
                  ip: selectedDevice.ip,
                  shortName: selectedDevice.shortName,
                  longName: selectedDevice.longName,
                }
              : null,
        }
        window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(record))
      } catch (error) {
        console.warn('onboarding_persist_failed', error)
      }
    }
    await persistPreferences({ channel: updateChannel, telemetryOptIn, completedAt })
    toast.success('Desktop průvodce dokončen. Spouštíme aplikaci.')
    onComplete?.()
  }, [onComplete, persistPreferences, selectedDevice, telemetryOptIn, updateChannel])

  const handleTest = async () => {
    if (!selectedDevice) {
      toast.error('Vyber zařízení pro test DMX rámce.')
      return
    }

    setTestStatus('pending')
    setTestMessage(null)
    const payload =
      selectedDevice.type === 'serial'
        ? {
            type: 'serial' as const,
            path: selectedDevice.path,
            channel: Number.isFinite(testChannel) ? testChannel : 1,
            value: Number.isFinite(testValue) ? testValue : 255,
          }
        : {
            type: 'artnet' as const,
            ip: selectedDevice.ip,
            channel: Number.isFinite(testChannel) ? testChannel : 1,
            value: Number.isFinite(testValue) ? testValue : 255,
          }
    try {
      const response = await fetch(buildUrl('/dmx/test'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `HTTP ${response.status}`)
      }
      const body = (await response.json()) as { target: string }
      setTestStatus('success')
      setTestMessage(`Rámec doručen (${body.target})`)
      toast.success('Testovací DMX rámec odeslán')
    } catch (error) {
      setTestStatus('error')
      setTestMessage(error instanceof Error ? error.message : 'Test DMX selhal')
      toast.error('DMX test selhal – zkontroluj kabeláž nebo IP adresu.')
    }
  }

  const renderStepContent = () => {
    switch (step.id) {
      case 'welcome':
        const selectedKey = selectedDevice ? deviceKey(selectedDevice) : null
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Tento průvodce nakonfiguruje lokální backend (PyInstaller) i UI wrapper (Tauri), aby bylo možné během
              3 minut spustit DMX server na Windows bez Dockeru. Připravte USB rozhraní nebo Art-Net gateway a DMX rig.
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Plugs size={18} className="text-primary" />
                  USB / Serial
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Automaticky hledáme FTDI/ENTTEC/DMXKing zařízení.</p>
              </div>
              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Broadcast size={18} className="text-primary" />
                  Art-Net
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Odešleme ArtPoll a zobrazíme nalezené nody.</p>
              </div>
              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck size={18} className="text-primary" />
                  Auto-update
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Vyberete si stable nebo beta kanál pro aktualizace.</p>
              </div>
            </div>
          </div>
        )
      case 'consent':
        return (
          <div className="space-y-4">
            <div className="rounded-xl border p-4 flex items-start gap-3">
              <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={(checked) => setAcceptedTerms(Boolean(checked))} />
              <Label htmlFor="terms" className="text-sm leading-relaxed">
                Souhlasím s licenčními podmínkami Atmosfil Desktop (GNU + proprietární DMX komponenty) a potvrzuji, že mám
                práva nasadit software na této stanici.
              </Label>
            </div>
            <div className="rounded-xl border p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-sm">Anonymní diagnostika</p>
                <p className="text-xs text-muted-foreground">
                  Pomůže nám sledovat pády a výkon Tauri wrapperu. Odesílají se pouze hashované logy bez scénářů.
                </p>
              </div>
              <Switch checked={telemetryOptIn} onCheckedChange={(checked) => setTelemetryOptIn(Boolean(checked))} />
            </div>
          </div>
        )
      case 'detect':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Nalezená zařízení</p>
                <p className="text-xs text-muted-foreground">
                  {lastScanTs ? `Aktualizováno ${new Date(lastScanTs).toLocaleTimeString()}` : 'Čekám na první scan'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {devicesLoading ? (
                  <Badge variant="outline" className="gap-2 text-xs">
                    <CircleNotch className="animate-spin" size={14} /> Hledám
                  </Badge>
                ) : null}
                <Button variant="outline" size="sm" onClick={() => fetchDevices()}>
                  Znovu vyhledat
                </Button>
              </div>
            </div>
            <ScrollArea className="max-h-64 rounded-xl border p-4">
              <div className="space-y-3">
                {devicesError ? <p className="text-sm text-destructive">Chyba: {devicesError}</p> : null}
                {!devicesError && !devicesLoading && allDevices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nic jsme nenašli. Připoj USB DMX nebo povol Art-Net uzly a skenuj znovu.</p>
                ) : null}
                {allDevices.map((device) => {
                  const identity = deviceKey(device)
                  return (
                    <DeviceCard
                      key={identity}
                      device={device}
                      selected={selectedKey === identity}
                      onClick={() => {
                        setSelectedDevice(device)
                        setTestStatus('idle')
                        setTestMessage(null)
                      }}
                    />
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        )
      case 'test':
        return (
          <div className="space-y-6">
            <div className="rounded-xl border p-4">
              <p className="text-sm font-medium">Testovaný uzel</p>
              {selectedDevice ? (
                <div className="mt-2 flex flex-col gap-1 text-sm">
                  <span className="font-semibold">{buildDeviceLabel(selectedDevice)}</span>
                  <span className="text-muted-foreground">{buildDeviceSubtitle(selectedDevice)}</span>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Vyber zařízení v předchozím kroku.</p>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="test-channel">DMX kanál</Label>
                <Input
                  id="test-channel"
                  type="number"
                  min={1}
                  max={512}
                  value={testChannel}
                  onChange={(event) => setTestChannel(Number(event.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-value">Hodnota</Label>
                <Input
                  id="test-value"
                  type="number"
                  min={0}
                  max={255}
                  value={testValue}
                  onChange={(event) => setTestValue(Number(event.target.value) || 0)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleTest} disabled={!selectedDevice || testStatus === 'pending'}>
                {testStatus === 'pending' ? (
                  <>
                    <CircleNotch className="mr-2 animate-spin" size={16} /> Odesílám DMX rámec
                  </>
                ) : (
                  <>
                    <Lightning className="mr-2" size={16} /> Spustit test
                  </>
                )}
              </Button>
              {testStatus === 'success' ? (
                <Badge className="gap-2 bg-emerald-500/15 text-emerald-600">
                  <CheckCircle size={14} /> {testMessage ?? 'Úspěch'}
                </Badge>
              ) : null}
              {testStatus === 'error' ? (
                <Badge variant="destructive" className="gap-2">
                  <ShieldCheck size={14} /> {testMessage ?? 'Chyba testu'}
                </Badge>
              ) : null}
            </div>
          </div>
        )
      case 'channel':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tauri updater kontroluje GitHub Releases. Stable kanál obsahuje podepsané buildy po QA, beta přináší nejnovější
              DMX funkce (může být méně stabilní).
            </p>
            <RadioGroup value={updateChannel} onValueChange={(value) => setUpdateChannel(value as UpdateChannel)}>
              <div className="rounded-xl border p-4">
                <div className="flex items-start gap-3">
                  <RadioGroupItem id="channel-stable" value="stable" className="mt-1" />
                  <div>
                    <Label htmlFor="channel-stable" className="font-medium">
                      Stable
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Doporučeno pro živé eventy. Aktualizace jen po plné QA.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="flex items-start gap-3">
                  <RadioGroupItem id="channel-beta" value="beta" className="mt-1" />
                  <div>
                    <Label htmlFor="channel-beta" className="font-medium flex items-center gap-1">
                      Beta <Sparkle size={14} className="text-primary" />
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Nejnovější funkce (wizard, timecode, AI asistence). Může obsahovat breaking changes.
                    </p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>
        )
      case 'finish':
        return (
          <div className="space-y-4">
            <div className="rounded-xl border p-4">
              <p className="text-sm font-semibold">Shrnutí</p>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li>• Zařízení: {selectedDevice ? buildDeviceLabel(selectedDevice) : 'není vybráno'}</li>
                <li>• Telemetrie: {telemetryOptIn ? 'zapnuta' : 'vypnuta'}</li>
                <li>• Update kanál: {updateChannel === 'beta' ? 'beta' : 'stable'}</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Po dokončení spustíme hlavní UI, backend zůstane běžet jako sidecar (PyInstaller). Průvodce můžete kdykoliv znovu otevřít
              v Nastavení &gt; Desktop.
            </p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-4xl">
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">{step.title}</CardTitle>
            <CardDescription>{step.description}</CardDescription>
            <div className="mt-4">
              <Progress value={progressValue} />
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {STEPS.map((entry, index) => (
                  <span
                    key={entry.id}
                    className={cn(
                      'rounded-full border px-3 py-1',
                      index === stepIndex ? 'border-primary text-primary' : 'border-border'
                    )}
                  >
                    {index + 1}. {entry.title}
                  </span>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
          <CardFooter className="flex items-center justify-between">
            <Button variant="ghost" disabled={stepIndex === 0} onClick={goBack}>
              Zpět
            </Button>
            <div className="flex items-center gap-3">
              {step.id === 'finish' ? (
                <Button onClick={() => void finishOnboarding()}>Dokončit a spustit</Button>
              ) : (
                <Button onClick={goNext} disabled={nextDisabled}>
                  Pokračovat
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export type { UpdateChannel, DiscoveredDevice }
