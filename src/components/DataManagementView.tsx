import { useRef, useState, type ChangeEvent } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowsClockwise, CircleNotch, WarningCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Effect, Fixture, Scene, Servo, StepperMotor, Universe } from '@/lib/types'
import type { ShowSnapshot } from '@/lib/showClient'
import { uploadShow, downloadShow } from '@/lib/showClient'

interface DataManagementViewProps {
  universes: Universe[]
  fixtures: Fixture[]
  scenes: Scene[]
  effects: Effect[]
  stepperMotors: StepperMotor[]
  servos: Servo[]
  showLoading: boolean
  showError: string | null
  showDirty: boolean
  lastExportedAt?: number | string | null
  onRefreshShow?: () => Promise<boolean>
  setUniverses: (updater: (universes: Universe[]) => Universe[]) => void
  setFixtures: (updater: (fixtures: Fixture[]) => Fixture[]) => void
  setScenes: (updater: (scenes: Scene[]) => Scene[]) => void
  setEffects: (updater: (effects: Effect[]) => Effect[]) => void
  setStepperMotors: (updater: (motors: StepperMotor[]) => StepperMotor[]) => void
  setServos: (updater: (servos: Servo[]) => Servo[]) => void
}

type ImportMode = 'replace' | 'merge'

export default function DataManagementView({
  universes,
  fixtures,
  scenes,
  effects,
  stepperMotors,
  servos,
  showLoading,
  showError,
  showDirty,
  lastExportedAt,
  onRefreshShow,
  setUniverses,
  setFixtures,
  setScenes,
  setEffects,
  setStepperMotors,
  setServos,
}: DataManagementViewProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [importMode, setImportMode] = useState<ImportMode>('replace')
  const [refreshing, setRefreshing] = useState(false)

  const disableActions = showLoading || refreshing
  const formattedExportedAt = formatExportedAt(lastExportedAt)

  const handleRefreshShow = async () => {
    if (!onRefreshShow) return
    setRefreshing(true)
    try {
      const result = await onRefreshShow()
      if (result) {
        toast.success('Konfigurace synchronizovana')
      } else {
        toast.error('Synchronizace se nepovedla')
      }
    } catch (error) {
      console.error('show_refresh_failed', error)
      toast.error('Synchronizace se nepovedla')
    } finally {
      setRefreshing(false)
    }
  }

  const buildSnapshot = (): ShowSnapshot => ({
    version: '1.1',
    exportedAt: new Date().toISOString(),
    universes,
    fixtures,
    scenes,
    effects,
    stepperMotors,
    servos,
  })

  const handleExport = async () => {
    if (disableActions) return
    try {
      let payload: ShowSnapshot
      try {
        payload = await downloadShow()
      } catch {
        payload = buildSnapshot()
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `dmx-controller-backup-${new Date().toISOString().replace(/[:]/g, '-')}.json`
      anchor.click()
      URL.revokeObjectURL(url)
      toast.success('Konfigurace exportována ze serveru')
    } catch (error) {
      console.error('export_error', error)
      toast.error('Export selhal')
    }
  }

  const handleImportClick = () => {
    if (disableActions) return
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const payload = JSON.parse(text)
      const snapshot = applyImport(payload)
      await uploadShow(snapshot)
      toast.success(`Import dokončen (${importMode === 'replace' ? 'nahrazení' : 'sloučení'})`)
    } catch (error) {
      console.error('import_error', error)
      toast.error('Soubor se nepodařilo zpracovat')
    } finally {
      event.target.value = ''
    }
  }

  const applyImport = (payload: Partial<ShowSnapshot>): ShowSnapshot => {
    const safeArray = <T extends { id: string }>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : [])
    const merge = <T extends { id: string }>(current: T[], incoming: T[]) =>
      importMode === 'replace' ? incoming : mergeById(current, incoming)

    const nextUniverses = merge(universes, safeArray<Universe>(payload.universes))
    const nextFixtures = merge(fixtures, safeArray<Fixture>(payload.fixtures))
    const nextScenes = merge(scenes, safeArray<Scene>(payload.scenes))
    const nextEffects = merge(effects, safeArray<Effect>(payload.effects))
    const nextStepper = merge(stepperMotors, safeArray<StepperMotor>(payload.stepperMotors))
    const nextServos = merge(servos, safeArray<Servo>(payload.servos))

    setUniverses(() => nextUniverses)
    setFixtures(() => nextFixtures)
    setScenes(() => nextScenes)
    setEffects(() => nextEffects)
    setStepperMotors(() => nextStepper)
    setServos(() => nextServos)

    return {
      version: typeof payload.version === 'string' ? payload.version : '1.1',
      exportedAt: new Date().toISOString(),
      universes: nextUniverses,
      fixtures: nextFixtures,
      scenes: nextScenes,
      effects: nextEffects,
      stepperMotors: nextStepper,
      servos: nextServos,
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Export & Import</h3>
          <p className="text-sm text-muted-foreground">
            Zalohujte konfiguraci (univerza, svetla, sceny, efekty, motory) do JSON souboru nebo ji opetovne nactete.
          </p>
          <p className="text-xs text-muted-foreground">
            Posledni serverovy export:{' '}
            <span className="font-medium text-foreground">{formattedExportedAt}</span>
            {showDirty && (
              <span className="ml-2 text-amber-600 font-semibold">cekaji na upload</span>
            )}
          </p>
        </div>
        {onRefreshShow && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-2 sm:w-auto"
            onClick={handleRefreshShow}
            disabled={disableActions}
          >
            {refreshing ? <CircleNotch className="h-4 w-4 animate-spin" /> : <ArrowsClockwise className="h-4 w-4" />}
            Synchronizovat
          </Button>
        )}
      </div>

      {showLoading && (
        <Alert className="border-primary/40 bg-primary/5">
          <CircleNotch className="h-4 w-4 animate-spin text-primary" weight="bold" />
          <AlertTitle>Prob??h?? synchronizace show</AlertTitle>
          <AlertDescription>Na??t??me konfiguraci p??mo ze serveru.</AlertDescription>
        </Alert>
      )}

      {showError && (
        <Alert variant="destructive">
          <WarningCircle className="h-4 w-4" weight="bold" />
          <AlertTitle>Nepoda?tilo se na????st show</AlertTitle>
          <AlertDescription>
            <p>{showError}</p>
            {onRefreshShow && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={handleRefreshShow}
                disabled={disableActions}
              >
                Zkusit znovu
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-muted/40 p-3 text-sm">
          <p className="text-muted-foreground">Univerza</p>
          <p className="text-2xl font-semibold text-foreground">{universes.length}</p>
        </div>
        <div className="rounded-lg border bg-muted/40 p-3 text-sm">
          <p className="text-muted-foreground">Světla</p>
          <p className="text-2xl font-semibold text-foreground">{fixtures.length}</p>
        </div>
        <div className="rounded-lg border bg-muted/40 p-3 text-sm">
          <p className="text-muted-foreground">Scény</p>
          <p className="text-2xl font-semibold text-foreground">{scenes.length}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="import-mode">Režim importu</Label>
          <Select value={importMode} onValueChange={(value) => setImportMode(value as ImportMode)}>
            <SelectTrigger id="import-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="replace">Nahradit stávající data</SelectItem>
              <SelectItem value="merge">Sloučit podle ID</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-1 gap-2">
          <Button className="flex-1 gap-2" onClick={handleExport} disabled={disableActions}>
            Exportovat JSON
          </Button>
          <Button variant="outline" className="flex-1 gap-2" onClick={handleImportClick} disabled={disableActions}>
            Importovat JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </Card>
  )
}

function mergeById<T extends { id: string }>(current: T[], incoming: T[]): T[] {
  const map = new Map(current.map((item) => [item.id, item]))
  for (const item of incoming) {
    map.set(item.id, item)
  }
  return Array.from(map.values())
}

function formatExportedAt(value?: number | string | null): string {
  if (value === undefined || value === null) {
    return '---'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '---'
  }
  try {
    return date.toLocaleString('cs-CZ')
  } catch {
    return date.toISOString()
  }
}
