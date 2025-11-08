import { useRef, useState, useEffect, useCallback, type ChangeEvent } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { ArrowsClockwise, CircleNotch, WarningCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Effect, Fixture, Scene, Servo, StepperMotor, Universe, ProjectMeta, BackupVersion } from '@/lib/types'
import type { ShowSnapshot } from '@/lib/showClient'
import { uploadShow, downloadShow } from '@/lib/showClient'
import {
  fetchProjects,
  createProject,
  selectProject,
  updateProject,
  listProjectBackups,
  createProjectBackup,
  restoreProjectBackup,
} from '@/lib/projectsClient'

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
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState<string | null>(null)
  const [projects, setProjects] = useState<ProjectMeta[]>([])
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [projectForm, setProjectForm] = useState({
    name: '',
    venue: '',
    eventDate: '',
    notes: '',
  })
  const [savingProjectMeta, setSavingProjectMeta] = useState(false)
  const [backups, setBackups] = useState<BackupVersion[]>([])
  const [backupsLoading, setBackupsLoading] = useState(false)
  const [backupError, setBackupError] = useState<string | null>(null)
  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null

  const disableActions = showLoading || refreshing
  const formattedExportedAt = formatExportedAt(lastExportedAt)

  const loadBackups = useCallback(
    async (projectId: string) => {
      setBackupsLoading(true)
      try {
        const response = await listProjectBackups(projectId)
        setBackups(response.versions ?? [])
        setBackupError(null)
      } catch (error) {
        console.error('backup_list_failed', error)
        setBackups([])
        setBackupError('Nepodarilo se nacist seznam zaloh')
      } finally {
        setBackupsLoading(false)
      }
    },
    []
  )

  const loadProjects = useCallback(async () => {
    setProjectsLoading(true)
    try {
      const response = await fetchProjects()
      setProjects(response.projects ?? [])
      setActiveProjectId(response.activeId ?? null)
      setProjectsError(null)
      if (response.activeId) {
        await loadBackups(response.activeId)
      } else {
        setBackups([])
      }
    } catch (error) {
      console.error('projects_fetch_failed', error)
      setProjects([])
      setActiveProjectId(null)
      setProjectsError('Server nepodporuje projekty nebo nastala chyba pri nacitani.')
      setBackups([])
    } finally {
      setProjectsLoading(false)
    }
  }, [loadBackups])

  useEffect(() => {
    void loadProjects()
  }, [loadProjects])

  useEffect(() => {
    if (activeProject) {
      setProjectForm({
        name: activeProject.name ?? '',
        venue: activeProject.venue ?? '',
        eventDate: activeProject.eventDate ?? '',
        notes: activeProject.notes ?? '',
      })
    } else {
      setProjectForm({
        name: '',
        venue: '',
        eventDate: '',
        notes: '',
      })
    }
  }, [activeProject])

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

  const projectDirty =
    !!activeProject &&
    (projectForm.name !== (activeProject.name ?? '') ||
      (projectForm.venue ?? '') !== (activeProject.venue ?? '') ||
      (projectForm.eventDate ?? '') !== (activeProject.eventDate ?? '') ||
      (projectForm.notes ?? '') !== (activeProject.notes ?? ''))

  const handleProjectSelect = async (projectId: string) => {
    if (!projectId || projectId === activeProjectId) return
    setProjectsLoading(true)
    try {
      const response = await selectProject(projectId)
      setProjects(response.projects ?? [])
      setActiveProjectId(response.activeId ?? projectId)
      toast.success('Projekt prepnout')
      await loadBackups(projectId)
      if (onRefreshShow) {
        await onRefreshShow()
      }
    } catch (error) {
      console.error('project_select_failed', error)
      toast.error('Nepodarilo se prepnout projekt')
    } finally {
      setProjectsLoading(false)
    }
  }

  const handleCreateProject = async () => {
    const name = window.prompt('Nazev noveho projektu?')
    if (!name) return
    setProjectsLoading(true)
    try {
      const response = await createProject({
        name: name.trim(),
        templateId: activeProjectId ?? undefined,
      })
      setProjects(response.projects ?? [])
      setActiveProjectId(response.activeId ?? null)
      toast.success('Projekt vytvoren')
      if (response.activeId) {
        await loadBackups(response.activeId)
        if (onRefreshShow) {
          await onRefreshShow()
        }
      }
    } catch (error) {
      console.error('project_create_failed', error)
      toast.error('Nepodarilo se vytvorit projekt')
    } finally {
      setProjectsLoading(false)
    }
  }

  const handleProjectFieldChange = (field: keyof typeof projectForm, value: string) => {
    setProjectForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProjectMeta = async () => {
    if (!activeProjectId) return
    setSavingProjectMeta(true)
    try {
      const payload = {
        name: projectForm.name.trim() || activeProject?.name || 'Projekt',
        venue: projectForm.venue.trim() || null,
        eventDate: projectForm.eventDate.trim() || null,
        notes: projectForm.notes.trim() || null,
      }
      const updated = await updateProject(activeProjectId, payload)
      setProjects((prev) => prev.map((project) => (project.id === updated.id ? { ...project, ...updated } : project)))
      toast.success('Metadata projektu ulozena')
    } catch (error) {
      console.error('project_update_failed', error)
      toast.error('Nepodarilo se ulozit metadata')
    } finally {
      setSavingProjectMeta(false)
    }
  }

  const handleCreateBackup = async () => {
    if (!activeProjectId) {
      toast.error('Vyberte projekt')
      return
    }
    const label = window.prompt('Popisek zalohy?', `Auto-${new Date().toLocaleString('cs-CZ')}`) ?? undefined
    setBackupsLoading(true)
    try {
      await createProjectBackup(activeProjectId, label)
      toast.success('Zaloha vytvorena')
      await loadBackups(activeProjectId)
    } catch (error) {
      console.error('backup_create_failed', error)
      toast.error('Nepodarilo se vytvorit zalohu')
    } finally {
      setBackupsLoading(false)
    }
  }

  const handleRestoreBackup = async (versionId: string) => {
    if (!activeProjectId) return
    const confirmed = window.confirm('Opravdu obnovit tuto zalohu?')
    if (!confirmed) return
    setBackupsLoading(true)
    try {
      await restoreProjectBackup(activeProjectId, versionId)
      toast.success('Zaloha obnovena')
      if (onRefreshShow) {
        await onRefreshShow()
      }
    } catch (error) {
      console.error('backup_restore_failed', error)
      toast.error('Obnova zalohy selhala')
    } finally {
      setBackupsLoading(false)
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
    <div className="space-y-4">
      <Card className="p-6 space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1 space-y-1">
              <h3 className="text-lg font-semibold">Projekty</h3>
              <p className="text-sm text-muted-foreground">
                Oddělte konfigurace pro různá vystoupení, venue nebo klienty. Projekty lze kdykoli přepnout a nezávisle
                zálohovat.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={projectsLoading} onClick={handleCreateProject}>
                Vytvořit projekt
              </Button>
              {projectsError === null && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadProjects()}
                  disabled={projectsLoading}
                  className="gap-2"
                >
                  {projectsLoading ? <CircleNotch className="h-4 w-4 animate-spin" /> : <ArrowsClockwise className="h-4 w-4" />}
                  Obnovit seznam
                </Button>
              )}
            </div>
          </div>

          {projectsError && (
            <Alert variant="destructive">
              <WarningCircle className="h-4 w-4" weight="bold" />
              <AlertTitle>Projekty nejsou dostupné</AlertTitle>
              <AlertDescription>{projectsError}</AlertDescription>
            </Alert>
          )}

          {!projectsError && (
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                  <Label>Aktivní projekt</Label>
                  <Select value={activeProjectId ?? ''} onValueChange={handleProjectSelect} disabled={projectsLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder={projectsLoading ? 'Načítám…' : 'Vyberte projekt'} />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCreateBackup} disabled={backupsLoading || projectsLoading}>
                    Zálohovat nyní
                  </Button>
                </div>
              </div>

              {activeProject && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Název</Label>
                    <Input
                      id="project-name"
                      value={projectForm.name}
                      onChange={(event) => handleProjectFieldChange('name', event.target.value)}
                      disabled={projectsLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-venue">Venue / Lokace</Label>
                    <Input
                      id="project-venue"
                      value={projectForm.venue}
                      onChange={(event) => handleProjectFieldChange('venue', event.target.value)}
                      disabled={projectsLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-date">Datum</Label>
                    <Input
                      id="project-date"
                      placeholder="2025-03-10"
                      value={projectForm.eventDate}
                      onChange={(event) => handleProjectFieldChange('eventDate', event.target.value)}
                      disabled={projectsLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-notes">Poznámky</Label>
                    <Input
                      id="project-notes"
                      value={projectForm.notes}
                      onChange={(event) => handleProjectFieldChange('notes', event.target.value)}
                      disabled={projectsLoading}
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!projectDirty || savingProjectMeta}
                      onClick={handleSaveProjectMeta}
                      className="gap-2"
                    >
                      {savingProjectMeta ? <CircleNotch className="h-4 w-4 animate-spin" /> : null}
                      Uložit metadata
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-base font-semibold">Historie záloh</h4>
                {backupError && (
                  <Alert variant="destructive">
                    <WarningCircle className="h-4 w-4" weight="bold" />
                    <AlertTitle>Zálohy nejsou dostupné</AlertTitle>
                    <AlertDescription>{backupError}</AlertDescription>
                  </Alert>
                )}
                {!backupError && (
                  <div className="space-y-2">
                    {backupsLoading && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <CircleNotch className="h-4 w-4 animate-spin" /> Načítám zálohy…
                      </p>
                    )}
                    {!backupsLoading && backups.length === 0 && (
                      <p className="text-sm text-muted-foreground">Zatím neexistují žádné zálohy.</p>
                    )}
                    {!backupsLoading &&
                      backups.map((backup) => (
                        <div
                          key={backup.versionId}
                          className="flex flex-col gap-1 rounded-lg border bg-muted/30 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {formatTimestamp(backup.createdAt)} · {backup.label ?? 'bez popisu'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {backup.provider.toUpperCase()} · {Math.round(backup.size / 1024)} kB ·{' '}
                              {backup.encrypted ? 'šifrováno' : 'plaintext'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRestoreBackup(backup.versionId)}
                              disabled={backupsLoading}
                            >
                              Obnovit
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Card>

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
    </div>
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
  return formatDateTime(value)
}

function formatTimestamp(value?: number | string | null): string {
  return formatDateTime(value)
}

function formatDateTime(value?: number | string | null): string {
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
