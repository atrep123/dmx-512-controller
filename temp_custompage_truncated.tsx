import { useMemo, useState, useCallback, useEffect, useRef, type ChangeEvent } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PlusCircle, Trash, DotsSixVertical, ArrowCounterClockwise, ArrowClockwise, CopySimple, UploadSimple } from '@phosphor-icons/react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { CustomLayoutRenderer } from '@/components/CustomLayoutRenderer'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useCanvasPreferences } from '@/hooks/useCanvasPreferences'
import { useCustomBlockPalette } from '@/hooks/useCustomBlockPalette'
import { BLOCK_KIND_LABELS, defaultBlockPalette } from '@/components/customLayoutShared'
import type { AppearancePreset } from '@/components/customLayoutShared'
import { CUSTOM_BLOCK_KIND_ORDER } from '@/config/customBlocks'
import { toast } from 'sonner'

import type {
  Effect,
  Fixture,
  StepperMotor,
  Servo,
  Scene,
  CustomBlockKind,
  CustomBlock,
  CustomLayout,
  SceneButtonBlock,
  EffectToggleBlock,
  FixtureSliderBlock,
  MotorPadBlock,
  MasterDimmerBlock,
  ServoKnobBlock,
  MarkdownNoteBlock,
  CustomBlockPosition,
} from '@/lib/types'
import type React from 'react'
import { cn } from '@/lib/utils'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const BUILDER_CANVAS_PREFS_KEY = 'custom-builder-canvas-prefs'
const BUILDER_APPEARANCE_OPTIONS: AppearancePreset[] = ['soft', 'flat', 'glass', 'custom']
const BUILDER_BLOCK_PALETTE_KEY = 'custom-builder-block-palette'

const isLayoutEqual = (a: CustomLayout | null, b: CustomLayout | null) => {
  if (a === b) return true
  if (!a || !b) return false
  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch {
    return false
  }
}

interface CustomPageBuilderProps {
  scenes: Scene[]
  effects: Effect[]
  fixtures: Fixture[]
  stepperMotors: StepperMotor[]
  servos: Servo[]
  setEffects: React.Dispatch<React.SetStateAction<Effect[]>>
  setFixtures: React.Dispatch<React.SetStateAction<Fixture[]>>
  setStepperMotors: React.Dispatch<React.SetStateAction<StepperMotor[]>>
  setServos: React.Dispatch<React.SetStateAction<Servo[]>>
  customLayout: CustomLayout | null
  setCustomLayout: (updater: (layout: CustomLayout | null) => CustomLayout | null) => void
}

export default function CustomPageBuilder({
  scenes,
  effects,
  fixtures,
  stepperMotors,
  servos,
  setEffects,
  setFixtures,
  setStepperMotors,
  setServos,
  customLayout,
  setCustomLayout: setCustomLayoutProp,
}: CustomPageBuilderProps) {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [modifier, setModifier] = useState<'none' | 'duplicate' | 'delete' | 'multi'>('none')
  const [blockFilter, setBlockFilter] = useState('')
  const undoStackRef = useRef<CustomLayout[]>([])
  const redoStackRef = useRef<CustomLayout[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [historyLengths, setHistoryLengths] = useState({ undo: 0, redo: 0 })
  const GRID_MAX_ROWS = 128
  const syncHistoryLengths = useCallback(() => {
    setHistoryLengths({
      undo: undoStackRef.current.length,
      redo: redoStackRef.current.length,
    })
  }, [])
  const pushHistorySnapshot = useCallback(
    (snapshot: CustomLayout | null) => {
      if (!snapshot) return
      undoStackRef.current = [...undoStackRef.current, snapshot].slice(-30)
      redoStackRef.current = []
      syncHistoryLengths()
    },
    [syncHistoryLengths]
  )
  const ensurePosition = useCallback(
    (position?: CustomBlockPosition | null): CustomBlockPosition => ({
      col: position?.col ?? 0,
      row: position?.row ?? 0,
      width: position?.width ?? 3,
      height: position?.height ?? 1,
    }),
    []
  )
  const clampValue = useCallback((value: number, min: number, max: number) => Math.max(min, Math.min(max, value)), [])
  const applyLayoutUpdate = useCallback(
    (updater: (layout: CustomLayout | null) => CustomLayout | null) => {
      setCustomLayoutProp((current) => {
        const next = updater(current)
        if (!isLayoutEqual(current ?? null, next ?? null)) {
          pushHistorySnapshot(current ?? null)
          return next
        }
        return current
      })
    },
    [setCustomLayoutProp, pushHistorySnapshot]
  )
  const getSelectionIds = useCallback(() => (selectedIds.length ? selectedIds : selectedBlockId ? [selectedBlockId] : []), [selectedIds, selectedBlockId])
  useEffect(() => {
    syncHistoryLengths()
  }, [syncHistoryLengths])
  const {
    appearance: builderAppearance,
    setAppearance: setBuilderAppearance,
    showGuides: showBuilderGuides,
    setShowGuides: setShowBuilderGuides,
    showSummary: showBuilderSummary,
    setShowSummary: setShowBuilderSummary,
    resetPreferences: resetBuilderCanvasPrefs,
  } = useCanvasPreferences(
    BUILDER_CANVAS_PREFS_KEY,
    { appearance: 'soft', showGuides: true, showSummary: false },
    { allowedAppearances: BUILDER_APPEARANCE_OPTIONS }
  )
  const {
    palette: builderPalette,
    overrides: builderPaletteOverrides,
    setPaletteEntry: setBuilderPaletteEntry,
    resetPalette: resetBuilderPalette,
  } = useCustomBlockPalette(BUILDER_BLOCK_PALETTE_KEY, defaultBlockPalette)
  const hasBuilderPaletteOverrides = Object.keys(builderPaletteOverrides).length > 0

  const availableBlocks: Array<{
    kind: CustomBlockKind
    title: string
    description: string
    configHint: string
  }> = useMemo(
    () => [
      {
        kind: 'master-dimmer',
        title: 'Master dimmer',
        description: 'Jednoduchý slidery nebo kolečko pro ovládání celkové intenzity se zobrazením procent.',
        configHint: 'Napojíš na useKV("master-dimmer") a helper setMasterDimmerScale – viz LiveControlView.',
      },
      {
        kind: 'scene-button',
        title: 'Scénické tlačítko',
        description: 'Spustí/preview konkrétní scénu jedním klikem, ideální pro dotykové ovládání.',
        configHint: `Vyber ID scény ze seznamu ScenesView (fixtures: ${fixtures.length}).`,
      },
      {
        kind: 'effect-toggle',
        title: 'Přepínač efektu',
        description: 'Toggle/on/off pro chase, rainbow nebo custom effect.',
        configHint: `Napojuj na effectId z aktuálních efektů (${effects.length} položek).`,
      },
      {
        kind: 'fixture-slider',
        title: 'Slider kanálu',
        description: 'Přímé řízení konkrétního DMX kanálu (např. dimmer, barva, iris).',
        configHint: 'Vyber fixture + channelId, hodnoty se zapisují přes setFixtures ⇒ persistShowSnapshot.',
      },
      {
        kind: 'motor-pad',
        title: 'Motorický pad',
        description: '2D pad/joystick pro směrování stepper motoru nebo pan/tilt pohybu.',
        configHint: `Využij stepperMotors (${stepperMotors.length}) a metody v MotorsView.`,
      },
      {
        kind: 'servo-knob',
        title: 'Servo knob',
        description: 'Malý kruhový ovladač pro servo úhel, s možností ukázat cílovou hodnotu.',
        configHint: `Serva k dispozici: ${servos.length}. Hodnoty zapisuj přes setServos.`,
      },
      {
        kind: 'markdown-note',
        title: 'Poznámka/Markdown',
        description: 'Statický blok s instrukcemi, QR kódem nebo rozcestníkem.',
        configHint: 'Uložený text se bude renderovat přes markdown renderer – vhodné pro ops handover.',
      },
    ],
    [effects.length, fixtures.length, servos.length, stepperMotors.length]
  )
