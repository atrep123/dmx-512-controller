import { useCallback, useMemo, useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { marked } from 'marked'
import { useKV } from '@github/spark/hooks'
import { setMasterDimmerScale } from '@/lib/masterDimmer'
import { setChannel } from '@/lib/dmxQueue'
import type {
  CustomLayout,
  Effect,
  Fixture,
  Scene,
  StepperMotor,
  Servo,
  CustomBlock,
  CustomBlockKind,
  CustomBlockPosition,
  Universe,
} from '@/lib/types'
import {
  CustomLayoutRenderer,
  type BlockRendererMap,
  type BlockPalette,
  type AppearancePreset,
  BLOCK_KIND_LABELS,
} from '@/components/CustomLayoutRenderer'
import { cn } from '@/lib/utils'
import ConnectionMonitorCard from '@/components/ConnectionMonitorCard'
import { useCanvasPreferences } from '@/hooks/useCanvasPreferences'
import { useCustomBlockPalette } from '@/hooks/useCustomBlockPalette'
import { CUSTOM_BLOCK_KIND_ORDER } from '@/config/customBlocks'

interface CustomDashboardProps {
  layout: CustomLayout | null
  fixtures: Fixture[]
  scenes: Scene[]
  effects: Effect[]
  stepperMotors: StepperMotor[]
  servos: Servo[]
  universes: Universe[]
  setFixtures: (updater: (fixtures: Fixture[]) => Fixture[]) => void
  setEffects: (updater: (effects: Effect[]) => Effect[]) => void
  setActiveScene: (sceneId: string | null) => void
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const DASHBOARD_BLOCK_PALETTE: BlockPalette = {
  'master-dimmer': 'from-slate-900/40 via-slate-900/0 to-slate-900/60',
  'scene-button': 'from-rose-500/30 via-transparent to-rose-900/40',
  'effect-toggle': 'from-amber-400/30 via-transparent to-amber-900/40',
  'fixture-slider': 'from-blue-400/30 via-transparent to-blue-900/40',
  'motor-pad': 'from-emerald-400/30 via-transparent to-emerald-900/40',
  'servo-knob': 'from-purple-400/30 via-transparent to-purple-900/40',
  'markdown-note': 'from-muted/40 via-transparent to-muted-foreground/40',
}

const APPEARANCE_OPTIONS: AppearancePreset[] = ['soft', 'flat', 'glass', 'custom']
const DASHBOARD_CANVAS_PREFS_KEY = 'custom-dashboard-canvas-prefs'
const DASHBOARD_BLOCK_PALETTE_KEY = 'custom-dashboard-block-palette'

type DashboardCanvasPrefs = {
  appearance: AppearancePreset
  showGuides: boolean
  showSummary: boolean
}

const formatMarkdown = (content: string | undefined) =>
  content?.trim() ? marked.parse(content) : '<p class="text-muted-foreground">??dn? obsah</p>'


export default function CustomDashboard({
  layout,
  fixtures,
  scenes,
  effects,
  stepperMotors,
  servos,
  universes,
  setFixtures,
  setEffects,
  setActiveScene,
}: CustomDashboardProps) {
  const {
    appearance: canvasAppearance,
    setAppearance: setCanvasAppearance,
    showGuides: showDashboardGridGuides,
    setShowGuides: setShowDashboardGridGuides,
    showSummary: showDashboardSummary,
    setShowSummary: setShowDashboardSummary,
    resetPreferences: resetDashboardCanvasPrefs,
  } = useCanvasPreferences(
    DASHBOARD_CANVAS_PREFS_KEY,
    { appearance: 'flat', showGuides: false, showSummary: false },
    { allowedAppearances: APPEARANCE_OPTIONS }
  )
  const {
    palette: dashboardCustomPalette,
    overrides: dashboardCustomPaletteOverrides,
    setPaletteEntry: setDashboardPaletteEntry,
    resetPalette: resetDashboardPalette,
  } = useCustomBlockPalette(DASHBOARD_BLOCK_PALETTE_KEY, DASHBOARD_BLOCK_PALETTE)
  const [masterDimmer, setMasterDimmer] = useKV<number>('master-dimmer', 255)
  const masterDimmerValue = typeof masterDimmer === 'number' ? clamp(masterDimmer, 0, 255) : 255

  const handleMasterChange = useCallback(
    (value: number) => {
      const normalized = clamp(Math.round(value), 0, 255)
      setMasterDimmer(normalized)
      setMasterDimmerScale(Math.max(0, Math.min(1, normalized / 255)))
    },
    [setMasterDimmer]
  )

  const applyScene = useCallback(
    (sceneId: string) => {
      const target = scenes.find((scene) => scene.id === sceneId)
      if (!target) {
        toast.error('Scéna nenalezena')
        return
      }
      setFixtures((current) =>
        current.map((fixture) => {
          const channels = fixture.channels.map((channel) => {
            const nextVal = target.channelValues[channel.id]
            return typeof nextVal === 'number' ? { ...channel, value: nextVal } : channel
          })
          return { ...fixture, channels }
        })
      )
      setActiveScene(target.id)
      try {
        const patches = new Map<number, { ch: number; val: number }[]>()
        fixtures.forEach((fixture) => {
          const universe = universes.find((u) => u.id === fixture.universeId)
          if (!universe) return
          fixture.channels.forEach((channel) => {
            const val = target.channelValues[channel.id]
            if (typeof val !== 'number') return
            const base = typeof fixture.dmxAddress === 'number' ? fixture.dmxAddress : 1
            const offset = typeof channel.number === 'number' ? channel.number - 1 : 0
            const absCh = clamp(base + offset, 1, 512)
            const list = patches.get(universe.number) ?? []
            list.push({ ch: absCh, val })
            patches.set(universe.number, list)
          })
        })
        for (const [universeNumber, entries] of patches) {
          entries.forEach((entry) => setChannel(universeNumber, entry.ch, entry.val))
        }
      } catch (error) {
        console.error('dashboard_scene_apply_failed', error)
      }
    },
    [fixtures, scenes, setActiveScene, setFixtures, universes]
  )

  const toggleEffect = useCallback(
    (effectId: string, behavior: 'toggle' | 'on' | 'off') => {
      setEffects((current) =>
        current.map((effect) => {
          if (effect.id !== effectId) return effect
          let nextActive = effect.isActive
          if (behavior === 'toggle') {
            nextActive = !effect.isActive
          } else if (behavior === 'on') {
            nextActive = true
          } else if (behavior === 'off') {
            nextActive = false
          }
          return { ...effect, isActive: nextActive }
        })
      )
    },
    [setEffects]
  )

  const renderers = useMemo<BlockRendererMap>(() => {
    const buildMissing = (block: CustomBlock, message: string) => (
      <Card className="flex h-full flex-col justify-between border border-dashed p-4 text-xs text-muted-foreground">
        <p className="font-semibold text-sm">{block.title || 'Blok není připraven'}</p>
        <p>{message}</p>
      </Card>
    )

    const masterRenderer = (block: CustomBlock) => (
      <Card className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Master dimmer</p>
            <p className="text-sm font-semibold">{block.title || 'Master'}</p>
          </div>
          <Badge variant="outline">{Math.round((masterDimmerValue / 255) * 100)}%</Badge>
        </div>
        <Slider
          value={[masterDimmerValue]}
          min={0}
          max={255}
          onValueChange={(values) => handleMasterChange(values[0] ?? masterDimmerValue)}
        />
      </Card>
    )

    const sceneRenderer = (block: CustomBlock & { sceneId?: string | null; behavior?: string }) => {
      if (!block.sceneId) {
        return buildMissing(block, 'Není nastavena scéna')
      }
      const scene = scenes.find((s) => s.id === block.sceneId)
      if (!scene) {
        return buildMissing(block, 'Scéna nebyla nalezena')
      }
      return (
        <Card className="flex h-full flex-col gap-2 p-4">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Scéna</p>
            <p className="text-sm font-semibold">{block.title || scene.name}</p>
          </div>
          <Button variant="default" onClick={() => applyScene(scene.id)}>
            {block.behavior === 'preview' ? 'Preview' : 'Recall'}
          </Button>
        </Card>
      )
    }

    const effectRenderer = (block: CustomBlock & { effectId?: string | null; behavior?: 'toggle' | 'on' | 'off' }) => {
      if (!block.effectId) {
        return buildMissing(block, 'Není přiřazen efekt')
      }
      const effect = effects.find((e) => e.id === block.effectId)
      if (!effect) {
            return buildMissing(block, 'Efekt nebyl nalezen')
      }
      const nextStateLabel =
        block.behavior === 'on' ? 'Zapnout' : block.behavior === 'off' ? 'Vypnout' : effect.isActive ? 'Vypnout' : 'Zapnout'
      return (
        <Card className="flex h-full flex-col gap-2 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Efekt</p>
              <p className="text-sm font-semibold">{block.title || effect.name}</p>
            </div>
            <Badge variant={effect.isActive ? 'default' : 'outline'}>{effect.isActive ? 'Aktivní' : 'Stop'}</Badge>
          </div>
          <Button variant="outline" onClick={() => toggleEffect(effect.id, block.behavior ?? 'toggle')}>
            {nextStateLabel}
          </Button>
        </Card>
      )
    }

    const fixtureRenderer = (block: CustomBlock & { fixtureId?: string | null; channelId?: string | null; min?: number; max?: number; showValue?: boolean }) => {
      const fixture = fixtures.find((f) => f.id === block.fixtureId)
      if (!fixture) {
        return buildMissing(block, 'Svítidlo nebylo nastaveno')
      }
      const channel = fixture.channels.find((ch) => ch.id === block.channelId) ?? fixture.channels[0]
      if (!channel) {
        return buildMissing(block, 'Kanál nebyl nalezen')
      }
      const minValue = typeof block.min === 'number' ? block.min : 0
      const maxValue = typeof block.max === 'number' ? block.max : 255
      const sliderValue = clamp(channel.value ?? 0, minValue, maxValue)
      return (
        <Card className="flex h-full flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-muted-foreground">{fixture.name}</p>
              <p className="text-sm font-semibold">{channel.name || `Kanál ${channel.number ?? ''}`}</p>
            </div>
            {block.showValue !== false && <Badge variant="outline">{sliderValue}</Badge>}
          </div>
          <Slider
            min={minValue}
            max={maxValue}
            value={[sliderValue]}
            onValueChange={(values) => {
              const next = clamp(values[0] ?? sliderValue, minValue, maxValue)
              setFixtures((current) =>
                current.map((fx) => {
                  if (fx.id !== fixture.id) return fx
                  return {
                    ...fx,
                    channels: fx.channels.map((ch) => (ch.id === channel.id ? { ...ch, value: next } : ch)),
                  }
                })
              )
              const universe = universes.find((u) => u.id === fixture.universeId)
              if (universe) {
                const base = typeof fixture.dmxAddress === 'number' ? fixture.dmxAddress : 1
                const offset = typeof channel.number === 'number' ? channel.number - 1 : 0
                setChannel(universe.number, clamp(base + offset, 1, 512), next)
              }
            }}
          />
        </Card>
      )
    }

    const markdownRenderer = (block: CustomBlock & { content?: string }) => (
      <Card className="h-full overflow-auto bg-muted/20 p-4 text-sm">
        <div
          className="prose max-w-none text-foreground prose-sm prose-headings:mb-2 prose-headings:text-foreground prose-p:mb-2 prose-ul:mb-2 prose-li:marker:text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: formatMarkdown(block.content) || '' }}
        />
      </Card>
    )

    const blockMessage = (label: string) => (block: CustomBlock) =>
      buildMissing(block, `${label} zatím není implementován`)

    const renderMap: BlockRendererMap = {
      'master-dimmer': masterRenderer,
      'scene-button': sceneRenderer,
      'effect-toggle': effectRenderer,
      'fixture-slider': fixtureRenderer,
      'markdown-note': markdownRenderer,
      'motor-pad': (block) => (
        <Card className="flex h-full flex-col justify-center gap-2 p-4 text-sm text-muted-foreground">
          <p className="font-semibold">{block.title || 'Motorický ovladač'}</p>
          <p>Joystick pro motory připravujeme – zatím použij panel „Motors“.</p>
        </Card>
      ),
      'servo-knob': blockMessage('Servo ovladač'),
    }

    return renderMap
  }, [applyScene, effects, fixtures, handleMasterChange, masterDimmerValue, scenes, setEffects, setFixtures, toggleEffect, universes])

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <ConnectionMonitorCard />
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            Dashboard pou??v? layout ulo?en? v show snapshotu. P?id?vej nebo upravuj bloky v sekci ?Custom? a zm?ny se zde projev?
            po synchronizaci. Pokud nejsou bloky definovan?, pou?ij builder nebo importuj layout p?es `/import`.
          </p>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Zobrazení plátna</p>
              <p className="text-xs text-muted-foreground">Runtime sdílí stejné téma jako builder.</p>
            </div>
            <Select value={canvasAppearance} onValueChange={(value: AppearancePreset) => setCanvasAppearance(value)}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPEARANCE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === 'soft' ? 'Soft' : option === 'flat' ? 'Flat' : option === 'glass' ? 'Glass' : 'Custom'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div>
              <p className="text-xs font-medium">Grid guides</p>
              <p className="text-xs text-muted-foreground">Zvýrazní skrytou mřížkovou síť.</p>
            </div>
            <Switch checked={showDashboardGridGuides} onCheckedChange={setShowDashboardGridGuides} />
          </div>
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div>
              <p className="text-xs font-medium">Souhrn mřížky</p>
              <p className="text-xs text-muted-foreground">Karta nad plátnem s parametry.</p>
            </div>
            <Switch checked={showDashboardSummary} onCheckedChange={setShowDashboardSummary} />
          </div>
          {canvasAppearance === 'custom' ? (
            <div className="space-y-3 rounded-lg border bg-muted/10 p-3">
              <p className="text-xs text-muted-foreground">Tailwind gradienty se aplikují na runtime bloky. Změny se ukládají jen lokálně.</p>
              {CUSTOM_BLOCK_KIND_ORDER.map((kind) => (
                <div key={kind} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">{BLOCK_KIND_LABELS[kind]}</Label>
                    {dashboardCustomPaletteOverrides[kind] ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={() => setDashboardPaletteEntry(kind, DASHBOARD_BLOCK_PALETTE[kind] ?? '')}
                      >
                        Reset
                      </Button>
                    ) : null}
                  </div>
                  <Input
                    value={dashboardCustomPaletteOverrides[kind] ?? DASHBOARD_BLOCK_PALETTE[kind] ?? ''}
                    onChange={(event) => setDashboardPaletteEntry(kind, event.target.value)}
                  />
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={resetDashboardPalette}>
                Obnovit paletu
              </Button>
            </div>
          ) : null}
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                resetDashboardCanvasPrefs()
                resetDashboardPalette()
              }}
            >
              Obnovit výchozí vzhled
            </Button>
          </div>
        </Card>
      </div>
      <CustomLayoutRenderer
        layout={layout}
        renderers={renderers}
        showEmptyState
        appearance={canvasAppearance}
        blockPalette={canvasAppearance === 'custom' ? dashboardCustomPalette : DASHBOARD_BLOCK_PALETTE}
        showGridGuides={showDashboardGridGuides}
        showGridSummary={showDashboardSummary}
      />
    </div>
  )
}
