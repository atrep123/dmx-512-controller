import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PlusCircle, Trash, DotsSixVertical, ArrowCounterClockwise, ArrowClockwise } from '@phosphor-icons/react'
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

const isLayoutEqual = (a: CustomLayout | null, b: CustomLayout | null) => {
  if (a === b) return true
  if (!a || !b) return false
  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch {
    return false
  }
}
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
  const undoStackRef = useRef<CustomLayout[]>([])
  const redoStackRef = useRef<CustomLayout[]>([])
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
  const availableBlocks: Array<{
    kind: CustomBlockKind
    title: string
    description: string
    configHint: string
  }> = [
    {
      kind: 'master-dimmer',
      title: 'Master dimmer',
      description: 'Jednoduch├Ż slidery nebo kole─Źko pro ovl├íd├ín├ş celkov├ę intenzity se zobrazen├şm procent.',
      configHint: 'Napoj├ş┼í na useKV("master-dimmer") a helper setMasterDimmerScale ÔÇô viz LiveControlView.',
    },
    {
      kind: 'scene-button',
      title: 'Sc├ęnick├ę tla─Ź├ştko',
      description: 'Spust├ş/preview konkr├ętn├ş sc├ęnu jedn├şm klikem, ide├íln├ş pro dotykov├ę ovl├íd├ín├ş.',
      configHint: 'Vyber ID sc├ęny ze seznamu ScenesView (fixtures: ' + fixtures.length + ').',
    },
    {
      kind: 'effect-toggle',
      title: 'P┼Öep├şna─Ź efektu',
      description: 'Toggle/on/off pro chase, rainbow nebo custom effect.',
      configHint: 'Napojuj na effectId z aktu├íln├şch efekt┼» (' + effects.length + ' polo┼żek).',
    },
    {
      kind: 'fixture-slider',
      title: 'Slider kan├ílu',
      description: 'P┼Ö├şm├ę ┼Ö├şzen├ş konkr├ętn├şho DMX kan├ílu (nap┼Ö. dimmer, barva, iris).',
      configHint: 'Vyber fixture + channelId, hodnoty se zapisuj├ş p┼Öes setFixtures Ôçĺ persistShowSnapshot.',
    },
    {
      kind: 'motor-pad',
      title: 'Motorick├Ż pad',
      description: '2D pad/joystick pro sm─Ťrov├ín├ş stepper motoru nebo pan/tilt pohybu.',
      configHint: 'Vyu┼żij stepperMotors (' + stepperMotors.length + ') a metody v MotorsView.',
    },
    {
      kind: 'servo-knob',
      title: 'Servo knob',
      description: 'Mal├Ż kruhov├Ż ovlada─Ź pro servo ├║hel, s mo┼żnost├ş uk├ízat c├şlovou hodnotu.',
      configHint: 'Serva k dispozici: ' + servos.length + '. Hodnoty zapisuj p┼Öes setServos.',
    },
    {
      kind: 'markdown-note',
      title: 'Pozn├ímka/Markdown',
      description: 'Statick├Ż blok s instrukcemi, QR k├│dem nebo rozcestn├şkem.',
      configHint: 'Ulo┼żen├Ż text se bude renderovat p┼Öes markdown renderer ÔÇô vhodn├ę pro ops handover.',
    },
  ]

  const blocks = useMemo(() => customLayout?.blocks ?? [], [customLayout])
  useEffect(() => {
    if (!customLayout) {
      setSelectedIds(selectedBlockId ? [selectedBlockId] : [])
      return
    }
    const validIds = new Set(customLayout.blocks.map((block) => block.id))
    setSelectedIds((current) => current.filter((id) => validIds.has(id)))
    if (selectedBlockId && !validIds.has(selectedBlockId)) {
      setSelectedBlockId(customLayout.blocks[0]?.id ?? null)
    }
  }, [customLayout, selectedBlockId])
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  const blockStats = useMemo(() => {
    const summary: Record<CustomBlockKind, number> = {
      'master-dimmer': 0,
      'scene-button': 0,
      'effect-toggle': 0,
      'fixture-slider': 0,
      'motor-pad': 0,
      'servo-knob': 0,
      'markdown-note': 0,
    }
    blocks.forEach((block) => {
      summary[block.kind] += 1
    })
    return summary
  }, [blocks])
  const selectedBlock =
    (selectedBlockId ? blocks.find((block) => block.id === selectedBlockId) : null) ?? (blocks[0] ?? null)

  const ensureLayoutBase = (layout?: CustomLayout | null) => {
    if (layout) {
      return layout
    }
    return {
      id: 'custom-layout',
      name: 'Vlastn├ş ovl├íd├ín├ş',
      grid: { columns: 12, rowHeight: 1, gap: 1 },
      blocks: [],
      updatedAt: Date.now(),
    } satisfies CustomLayout
  }

  const layoutPreview = ensureLayoutBase(customLayout)
  const gridBackgroundStyle = useMemo(() => {
    const base = layoutPreview.grid
    const colCount = base?.columns ?? 12
    const gapRem = base?.gap ?? 1
    const size = Math.max(24, Math.round((100 / colCount) * 4))
    const gapPx = Math.max(8, gapRem * 12)
    const cell = Math.max(24, size - gapPx * 0.2)
    return {
      backgroundImage: `
        linear-gradient(0deg, rgba(255,255,255,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
      `,
      backgroundSize: `${cell}px ${cell}px`,
    } as React.CSSProperties
  }, [layoutPreview.grid])
  const selectionIds = getSelectionIds()
  const selectionCount = selectionIds.length

  const createDefaultBlock = (kind: CustomBlockKind): CustomBlock => {
    const uuid = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `block-${Date.now()}`
    const basePosition = {
      col: 0,
      row: blocks.length,
      width: kind === 'markdown-note' ? 12 : kind === 'master-dimmer' ? 4 : 3,
      height: kind === 'markdown-note' ? 2 : 1,
    }
    switch (kind) {
      case 'master-dimmer':
        return {
          id: uuid,
          kind,
          title: 'Master dimmer',
          size: 'md',
          position: basePosition,
          showPercent: true,
        }
      case 'scene-button':
        return {
          id: uuid,
          kind,
          title: 'Obl├şben├í sc├ęna',
          size: 'sm',
          position: basePosition,
          sceneId: scenes[0]?.id ?? null,
          behavior: 'recall',
        }
      case 'effect-toggle':
        return {
          id: uuid,
          kind,
          title: 'Efekt',
          size: 'sm',
          position: basePosition,
          effectId: effects[0]?.id ?? null,
          behavior: 'toggle',
        }
      case 'fixture-slider': {
        const firstFixture = fixtures[0]
        const firstChannel = firstFixture?.channels?.[0]
        return {
          id: uuid,
          kind,
          title: firstFixture ? `${firstFixture.name} ${firstChannel?.name ?? ''}`.trim() : 'Kan├íl',
          size: 'md',
          position: basePosition,
          fixtureId: firstFixture?.id ?? null,
          channelId: firstChannel?.id ?? null,
          min: 0,
          max: 255,
          showValue: true,
        }
      }
      case 'motor-pad':
        return {
          id: uuid,
          kind,
          title: 'Motorick├Ż pad',
          size: 'md',
          position: basePosition,
          motorId: stepperMotors[0]?.id ?? null,
          axis: 'pan',
          speedScale: 1,
        }
      case 'servo-knob':
        return {
          id: uuid,
          kind,
          title: 'Servo',
          size: 'sm',
          position: basePosition,
          servoId: servos[0]?.id ?? null,
          showTarget: true,
        }
      case 'markdown-note':
      default:
        return {
          id: uuid,
          kind: 'markdown-note',
          title: 'Pozn├ímka',
          size: 'lg',
          position: basePosition,
          content: '### Instrukce\n- P┼Öidej vlastn├ş text\n- Nebo vlo┼ż QR/URL',
        }
    }
  }

  const handleAddBlock = (kind: CustomBlockKind) => {
    applyLayoutUpdate((current) => {
      const base = ensureLayoutBase(current)
      const nextBlock = createDefaultBlock(kind)
      setSelectedBlockId(nextBlock.id)
      return {
        ...base,
        updatedAt: Date.now(),
        blocks: [...(base.blocks ?? []), nextBlock],
      }
    })
  }

  const handleRemoveBlock = useCallback((blockId: string) => {
    applyLayoutUpdate((current) => {
      if (!current) {
        return current
      }
      const nextBlocks = current.blocks.filter((block) => block.id !== blockId)
      const nextSelectionTarget = nextBlocks[0]?.id ?? null
      setSelectedBlockId((currentSelected) => (currentSelected === blockId ? nextSelectionTarget : currentSelected))
      setSelectedIds((ids) => ids.filter((id) => id !== blockId))
      return {
        ...current,
        updatedAt: Date.now(),
        blocks: nextBlocks,
      }
    })
  }, [applyLayoutUpdate])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveBlockId(null)
    if (!over || active.id === over.id) {
      return
    }
    const oldIndex = blocks.findIndex((block) => block.id === active.id)
    const newIndex = blocks.findIndex((block) => block.id === over.id)
    if (oldIndex === -1 || newIndex === -1) {
      return
    }
    const reordered = arrayMove(blocks, oldIndex, newIndex).map((block, index) => ({
      ...block,
      position: {
        col: block.position?.col ?? 0,
        row: index,
        width: block.position?.width ?? 3,
        height: block.position?.height ?? 1,
      },
    }))
    applyLayoutUpdate((current) => {
      const base = ensureLayoutBase(current)
      return {
        ...base,
        updatedAt: Date.now(),
        blocks: reordered,
      }
    })
    setSelectedBlockId(active.id as string)
  }

  const handleSelectBlock = useCallback(
    (blockId: string, mode: 'replace' | 'toggle' = 'replace') => {
      setSelectedBlockId(blockId)
      setSelectedIds((current) => {
        if (mode === 'toggle') {
          return current.includes(blockId) ? current.filter((id) => id !== blockId) : [...current, blockId]
        }
        return [blockId]
      })
    },
    []
  )

  const updateBlock = (blockId: string, updater: (block: CustomBlock) => CustomBlock) => {
    applyLayoutUpdate((current) => {
      if (!current) {
        return current
      }
      const index = current.blocks.findIndex((block) => block.id === blockId)
      if (index === -1) {
        return current
      }
      const updatedBlock = updater(current.blocks[index])
      const nextBlocks = [...current.blocks]
      nextBlocks[index] = updatedBlock
      return {
        ...current,
        updatedAt: Date.now(),
        blocks: nextBlocks,
      }
    })
  }

  const updateLayoutGrid = (partial: Partial<NonNullable<CustomLayout['grid']>>) => {
    applyLayoutUpdate((current) => {
      const base = ensureLayoutBase(current)
      const nextGrid = {
        columns: base.grid?.columns ?? 12,
        rowHeight: base.grid?.rowHeight ?? 1,
        gap: base.grid?.gap ?? 1,
        ...base.grid,
        ...partial,
      }
      return {
        ...base,
        grid: nextGrid,
        updatedAt: Date.now(),
      }
    })
  }

  const handleDuplicateBlock = useCallback((blockId: string) => {
    applyLayoutUpdate((current) => {
      if (!current) {
        return current
      }
      const index = current.blocks.findIndex((block) => block.id === blockId)
      if (index === -1) {
        return current
      }
      const source = current.blocks[index]
      const copy: CustomBlock = {
        ...source,
        id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `block-${Date.now()}`,
        title: source.title ? `${source.title} (kopie)` : source.title,
        position: {
          ...source.position,
          row: (source.position?.row ?? 0) + 1,
        },
      }
      const nextBlocks = [...current.blocks]
      nextBlocks.splice(index + 1, 0, copy)
      setSelectedBlockId(copy.id)
      setSelectedIds([copy.id])
      return {
        ...current,
        updatedAt: Date.now(),
        blocks: nextBlocks,
      }
    })
  }, [applyLayoutUpdate])

  const nudgeSelection = useCallback(
    (ids: string[], key: string, delta: number, resize: boolean) => {
      if (!ids.length) {
        return
      }
      applyLayoutUpdate((current) => {
        if (!current) {
          return current
        }
        const columns = current.grid?.columns ?? 12
        const maxRows = 100
        let mutated = false
        const nextBlocks = current.blocks.map((block) => {
          if (!ids.includes(block.id)) {
            return block
          }
          const pos = ensurePosition(block.position)
          const nextPos = { ...pos }
          if (resize) {
            if (key === 'ArrowRight') {
              nextPos.width = clampValue(nextPos.width + delta, 1, Math.max(1, columns - nextPos.col))
            } else if (key === 'ArrowLeft') {
              nextPos.width = clampValue(nextPos.width - delta, 1, columns)
            } else if (key === 'ArrowDown') {
              nextPos.height = clampValue(nextPos.height + delta, 1, maxRows)
            } else if (key === 'ArrowUp') {
              nextPos.height = clampValue(nextPos.height - delta, 1, maxRows)
            }
          } else {
            if (key === 'ArrowRight') {
              nextPos.col = clampValue(nextPos.col + delta, 0, Math.max(0, columns - nextPos.width))
            } else if (key === 'ArrowLeft') {
              nextPos.col = clampValue(nextPos.col - delta, 0, columns)
            } else if (key === 'ArrowDown') {
              nextPos.row = clampValue(nextPos.row + delta, 0, maxRows)
            } else if (key === 'ArrowUp') {
              nextPos.row = clampValue(nextPos.row - delta, 0, maxRows)
            }
          }
          if (
            nextPos.col === pos.col &&
            nextPos.row === pos.row &&
            nextPos.width === pos.width &&
            nextPos.height === pos.height
          ) {
            return block
          }
          mutated = true
          return { ...block, position: nextPos }
        })
        if (!mutated) {
          return current
        }
        return { ...current, updatedAt: Date.now(), blocks: nextBlocks }
      })
    },
    [applyLayoutUpdate, clampValue, ensurePosition]
  )
  const duplicateSelection = useCallback(() => {
    const ids = getSelectionIds()
    ids.forEach((id) => handleDuplicateBlock(id))
  }, [getSelectionIds, handleDuplicateBlock])
  const deleteSelection = useCallback(() => {
    const ids = getSelectionIds()
    ids.forEach((id) => handleRemoveBlock(id))
  }, [getSelectionIds, handleRemoveBlock])
  const undoChange = useCallback(() => {
    if (!undoStackRef.current.length) return
    const previous = undoStackRef.current.pop()
    if (!previous) return
    if (customLayout) {
      redoStackRef.current = [...redoStackRef.current, customLayout].slice(-30)
    }
    syncHistoryLengths()
    setSelectedBlockId(previous.blocks[0]?.id ?? null)
    setSelectedIds([])
    setCustomLayoutProp(() => previous)
  }, [customLayout, setCustomLayoutProp, syncHistoryLengths])
  const redoChange = useCallback(() => {
    if (!redoStackRef.current.length) return
    const next = redoStackRef.current.pop()
    if (!next) return
    if (customLayout) {
      undoStackRef.current = [...undoStackRef.current, customLayout].slice(-30)
    }
    syncHistoryLengths()
    setSelectedBlockId(next.blocks[0]?.id ?? null)
    setSelectedIds([])
    setCustomLayoutProp(() => next)
  }, [customLayout, setCustomLayoutProp, syncHistoryLengths])

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-2">Vlastn├ş str├ínka</h2>
        <p className="text-sm text-muted-foreground">
          Definovali jsme z├íkladn├ş typy blok┼» a layout se brzy bude ukl├ídat spolu s show snapshotem. Ka┼żd├Ż blok m┼»┼że m├şt vlastn├ş
          konfiguraci (fixture, sc├ęna, efekt) a renderer si zvol├ş v├Żslednou podobu.
        </p>
      </Card>
      <Card className="p-6">
        <h3 className="text-base font-semibold mb-4">Nastaven├ş m┼Ö├ş┼żky</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <Label>Po─Źet sloupc┼»</Label>
            <Input
              type="number"
              min={4}
              max={24}
              value={customLayout?.grid?.columns ?? 12}
              onChange={(event) => updateLayoutGrid({ columns: Math.min(24, Math.max(4, Number(event.target.value) || 12)) })}
            />
          </div>
          <div className="space-y-1">
            <Label>V├Ż┼íka ┼Ö├ídku</Label>
            <Input
              type="number"
              min={1}
              max={4}
              step={0.5}
              value={customLayout?.grid?.rowHeight ?? 1}
              onChange={(event) => updateLayoutGrid({ rowHeight: Math.max(0.5, Number(event.target.value) || 1) })}
            />
          </div>
          <div className="space-y-1">
            <Label>Mezera</Label>
            <Input
              type="number"
              min={0}
              max={8}
              step={0.5}
              value={customLayout?.grid?.gap ?? 1}
              onChange={(event) => updateLayoutGrid({ gap: Math.max(0, Number(event.target.value) || 1) })}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          ├Üprava parametr┼» m┼Ö├ş┼żky se projev├ş jak v pl├ítn─Ť, tak v runtime rendereru. Hodnoty se ukl├ídaj├ş do `customLayout.grid`.
          Tip: dr┼ż <kbd>Shift</kbd> a t├íhni bloky pro p┼Öesn─Ťj┼í├ş zarovn├ín├ş (p┼Öipravuje se snapÔÇĹtoÔÇĹgrid).
        </p>
      </Card>
      <Card className="p-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">Pl├ítno</h3>
            <p className="text-xs text-muted-foreground">
              {layoutPreview.grid?.columns ?? 12} sloupc┼» ┬Ě mezera {layoutPreview.grid?.gap ?? 1}
            </p>
          </div>
          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <span>Modifik├ítory:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={modifier === 'duplicate' ? 'default' : 'outline'}
                      onClick={() => setModifier(modifier === 'duplicate' ? 'none' : 'duplicate')}
                    >
                      Duplicita
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zapni pro rychl├ę klonov├ín├ş blok┼» kliknut├şm</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={modifier === 'delete' ? 'destructive' : 'outline'}
                      onClick={() => setModifier(modifier === 'delete' ? 'none' : 'delete')}
                    >
                      Maz├ín├ş
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zapni pro rychl├ę maz├ín├ş blok┼» kliknut├şm</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={modifier === 'multi' ? 'default' : 'outline'}
                      onClick={() => setModifier(modifier === 'multi' ? 'none' : 'multi')}
                    >
                      Multi v├Żb─Ťr
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>P┼Öid├ívej/odeb├şrej bloky do v├Żb─Ťru kliknut├şm</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Vybr├íno: {selectionCount}</Badge>
              <Button size="sm" variant="outline" onClick={duplicateSelection} disabled={!selectionCount}>
                Duplikovat v├Żb─Ťr
              </Button>
              <Button size="sm" variant="outline" onClick={deleteSelection} disabled={!selectionCount}>
                Smazat v├Żb─Ťr
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={undoChange} disabled={!historyLengths.undo}>
                      <ArrowCounterClockwise />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Ctrl/Cmd + Z</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={redoChange} disabled={!historyLengths.redo}>
                      <ArrowClockwise />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Ctrl/Cmd + Shift + Z</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        <div
          className="rounded-xl border border-dashed bg-muted/10 p-3"
          style={gridBackgroundStyle}
          onKeyDown={(event) => {
            const selection = selectionIds
            if (!selection.length) return
            if (event.key === 'Delete' || event.key === 'Backspace') {
              event.preventDefault()
              selection.forEach((id) => handleRemoveBlock(id))
            }
            if (event.key === 'd' && (event.ctrlKey || event.metaKey)) {
              event.preventDefault()
              selection.forEach((id) => handleDuplicateBlock(id))
            }
            if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
              event.preventDefault()
              if (event.shiftKey) {
                redoChange()
              } else {
                undoChange()
              }
            }
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
              event.preventDefault()
              const delta = event.shiftKey ? 2 : 1
              const resize = event.altKey
              nudgeSelection(selection, event.key, delta, resize)
            }
          }}
          tabIndex={0}
        >
          <CustomLayoutRenderer
            layout={layoutPreview}
            className="gap-3"
            selectedBlockId={selectedBlockId}
            selectedBlockIds={selectedIds}
            onBlockSelect={(blockId, event) => {
              if (modifier === 'duplicate') {
                handleDuplicateBlock(blockId)
              } else if (modifier === 'delete') {
                handleRemoveBlock(blockId)
              } else if (modifier === 'multi' || event?.metaKey || event?.ctrlKey || event?.shiftKey) {
                handleSelectBlock(blockId, 'toggle')
              } else {
                handleSelectBlock(blockId, 'replace')
              }
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Tip: Ctrl/Cmd + D klonuje vybran├Ż blok, Delete jej odebere. Alt + ┼íipky m─Ťn├ş velikost, samotn├ę ┼íipky posouvaj├ş v├Żb─Ťr (Shift = v─Ťt┼í├ş krok).
        </p>
      </Card>
      <Card className="p-6">
        <h3 className="text-base font-semibold mb-4">Dostupn├ę bloky</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {availableBlocks.map((block) => (
            <div key={block.kind} className="rounded-lg border p-4 flex flex-col gap-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{block.kind}</p>
              <p className="text-sm font-semibold mt-1">{block.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{block.description}</p>
              <p className="text-xs text-muted-foreground mt-3">
                <span className="font-medium">Workflow:</span> {block.configHint}
              </p>
              <div className="flex items-center justify-between pt-2">
                <Badge variant="outline">Blok┼»: {blockStats[block.kind]}</Badge>
                <Button size="sm" variant="outline" onClick={() => handleAddBlock(block.kind)} className="gap-2">
                  <PlusCircle size={16} />
                  P┼Öidat
                </Button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-6">
          Bloky p┼Öid├í┼í jedn├şm klikem a pot├ę je m┼»┼że┼í p┼Öetahovat n├ş┼że ÔÇô konfigurace se ukl├íd├í do{' '}
          <code className="mx-1 text-xs">customLayout</code> v show snapshotu.
        </p>
      </Card>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold">Aktu├íln├ş layout</h3>
          <p className="text-xs text-muted-foreground">
            {blocks.length ? `${blocks.length} blok┼» ┬Ě aktualizov├íno ${customLayout?.updatedAt ? new Date(customLayout.updatedAt).toLocaleString() : 'nikdy'}` : 'Zat├şm ┼ż├ídn├ę bloky'}
          </p>
        </div>
        <Separator className="my-3" />
        {blocks.length === 0 ? (
          <p className="text-sm text-muted-foreground">P┼Öidej prvn├ş blok v├Ż┼íe a layout se ulo┼ż├ş do show snapshotu.</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(event) => setActiveBlockId(event.active.id as string)}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveBlockId(null)}
          >
            <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {blocks.map((block) => (
                  <SortableBlockRow
                    key={block.id}
                    block={block}
                    isActive={activeBlockId === block.id}
                    isSelected={selectionIds.includes(block.id)}
                    multiEnabled={modifier === 'multi'}
                    onSelect={(id, mode) => handleSelectBlock(id, mode ?? (modifier === 'multi' ? 'toggle' : 'replace'))}
                    onDuplicate={handleDuplicateBlock}
                    onRemove={handleRemoveBlock}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </Card>
      <Card className="p-6">
        <h3 className="text-base font-semibold mb-4">Nastaven├ş bloku</h3>
        {selectionCount > 1 ? (
          <p className="text-sm text-muted-foreground">
            Vybr├íno {selectionCount} blok┼». Pou┼żij bulk akce v├Ż┼íe nebo zmen┼íi v├Żb─Ťr, pokud chce┼í upravovat konkr├ętn├ş blok.
          </p>
        ) : !selectedBlock ? (
          <p className="text-sm text-muted-foreground">Vyber blok v seznamu nebo na pl├ítn─Ť pro ├║pravu.</p>
        ) : (
          <BlockEditor
            block={selectedBlock}
            scenes={scenes}
            effects={effects}
            fixtures={fixtures}
            stepperMotors={stepperMotors}
            servos={servos}
            onUpdate={(updater) => updateBlock(selectedBlock.id, updater)}
            gridColumns={layoutPreview.grid?.columns ?? 12}
            maxRows={GRID_MAX_ROWS}
            clampGridValue={clampValue}
          />
        )}
      </Card>
    </div>
  )
}

function SortableBlockRow({
  block,
  isActive,
  isSelected,
  multiEnabled,
  onSelect,
  onDuplicate,
  onRemove,
}: {
  block: CustomBlock
  isActive: boolean
  isSelected: boolean
  multiEnabled: boolean
  onSelect: (id: string, mode?: 'toggle' | 'replace') => void
  onDuplicate: (id: string) => void
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(event) => onSelect(block.id, event.metaKey || event.ctrlKey || multiEnabled ? 'toggle' : 'replace')}
      className={cn(
        'flex flex-col gap-3 rounded-lg border bg-muted/30 p-3 sm:flex-row sm:items-center',
        'text-left transition',
        isDragging && 'ring-2 ring-primary bg-background shadow-lg',
        (isActive && !isDragging) || isSelected ? 'border-primary' : 'hover:border-primary/50'
      )}
    >
      <button
        type="button"
        className="cursor-grab rounded-md border bg-background px-2 py-1 text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
        aria-label="P┼Öesunout blok"
      >
        <DotsSixVertical size={16} weight="bold" />
      </button>
      <div className="flex-1">
        <p className="text-sm font-semibold">
          {block.title || block.kind}{' '}
          <span className="text-xs text-muted-foreground">{block.kind}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {block.position
            ? `Pos: c${block.position.col} r${block.position.row} w${block.position.width} h${block.position.height}`
            : 'Pozice bude nastavena v editoru'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline">{block.size ?? 'md'}</Badge>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation()
              onDuplicate(block.id)
            }}
          >
            Kop├şrovat
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation()
              onRemove(block.id)
            }}
            aria-label="Odebrat blok"
          >
            <Trash size={18} />
          </Button>
        </div>
      </div>
    </div>
  )
}

function BlockEditor({
  block,
  scenes,
  effects,
  fixtures,
  stepperMotors,
  servos,
  onUpdate,
  gridColumns,
  maxRows,
  clampGridValue,
}: {
  block: CustomBlock
  scenes: Scene[]
  effects: Effect[]
  fixtures: Fixture[]
  stepperMotors: StepperMotor[]
  servos: Servo[]
  onUpdate: (updater: (block: CustomBlock) => CustomBlock) => void
  gridColumns: number
  maxRows: number
  clampGridValue: (value: number, min: number, max: number) => number
}) {
  const updateCurrent = (partial: Partial<CustomBlock>) => {
    onUpdate((currentBlock) => ({ ...currentBlock, ...partial } as CustomBlock))
  }

  const handlePositionChange = (field: keyof CustomBlockPosition, value: number) => {
    if (Number.isNaN(value)) return
    const columns = Math.max(1, gridColumns)
    const position = {
      col: block.position?.col ?? 0,
      row: block.position?.row ?? 0,
      width: block.position?.width ?? 3,
      height: block.position?.height ?? 1,
      ...block.position,
    }
    const colMax = Math.max(0, columns - 1)
    const widthMax = Math.max(1, columns - position.col)
    const heightMax = Math.max(1, maxRows)
    const next = { ...position }
    if (field === 'col') {
      next.col = clampGridValue(value, 0, colMax)
      next.width = clampGridValue(next.width, 1, Math.max(1, columns - next.col))
    } else if (field === 'row') {
      next.row = clampGridValue(value, 0, heightMax)
    } else if (field === 'width') {
      next.width = clampGridValue(value, 1, widthMax)
    } else if (field === 'height') {
      next.height = clampGridValue(value, 1, heightMax)
    }
    updateCurrent({ position: next })
  }

  const sizeOptions: CustomBlockSize[] = ['xs', 'sm', 'md', 'lg']
  const blockContent: React.ReactNode = (() => {
    switch (block.kind) {
      case 'scene-button':
        return (
          <>
            <div className="space-y-1">
              <Label>Sc├ęna</Label>
              <Select
                value={block.sceneId ?? 'none'}
                onValueChange={(value) => updateCurrent({ sceneId: value === 'none' ? null : value } as SceneButtonBlock)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vyber sc├ęnu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">┼Ż├ídn├í</SelectItem>
                  {scenes.map((scene) => (
                    <SelectItem key={scene.id} value={scene.id}>
                      {scene.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Chov├ín├ş</Label>
              <Select value={block.behavior} onValueChange={(value: SceneButtonBlock['behavior']) => updateCurrent({ behavior: value } as SceneButtonBlock)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recall">Recall</SelectItem>
                  <SelectItem value="toggle">Toggle</SelectItem>
                  <SelectItem value="preview">Preview</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )
      case 'effect-toggle':
        return (
          <>
            <div className="space-y-1">
              <Label>Efekt</Label>
              <Select
                value={block.effectId ?? 'none'}
                onValueChange={(value) => updateCurrent({ effectId: value === 'none' ? null : value } as EffectToggleBlock)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vyber efekt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">┼Ż├ídn├Ż</SelectItem>
                  {effects.map((effect) => (
                    <SelectItem key={effect.id} value={effect.id}>
                      {effect.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Chov├ín├ş</Label>
              <Select value={block.behavior} onValueChange={(value: EffectToggleBlock['behavior']) => updateCurrent({ behavior: value } as EffectToggleBlock)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toggle">Toggle</SelectItem>
                  <SelectItem value="on">Zapnout</SelectItem>
                  <SelectItem value="off">Vypnout</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )
      case 'fixture-slider': {
        const selectedFixture = fixtures.find((fixture) => fixture.id === block.fixtureId) ?? fixtures[0]
        const channels = selectedFixture?.channels ?? []
        return (
          <>
            <div className="space-y-1">
              <Label>Sv├ştidlo</Label>
              <Select
                value={block.fixtureId ?? selectedFixture?.id ?? 'none'}
                onValueChange={(value) => {
                  if (value === 'none') {
                    updateCurrent({ fixtureId: null, channelId: null } as FixtureSliderBlock)
                    return
                  }
                  const nextFixture = fixtures.find((fixture) => fixture.id === value)
                  updateCurrent({
                    fixtureId: value,
                    channelId: nextFixture?.channels?.[0]?.id ?? null,
                  } as FixtureSliderBlock)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vyber fixture" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">┼Ż├ídn├ę</SelectItem>
                  {fixtures.map((fixture) => (
                    <SelectItem key={fixture.id} value={fixture.id}>
                      {fixture.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Kan├íl</Label>
              <Select
                value={block.channelId ?? 'none'}
                onValueChange={(value) => updateCurrent({ channelId: value === 'none' ? null : value } as FixtureSliderBlock)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vyber kan├íl" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">┼Ż├ídn├Ż</SelectItem>
                  {channels.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      {channel.name} (#{channel.number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Minimum</Label>
                <Input
                  type="number"
                  min={0}
                  max={255}
                  value={block.min ?? 0}
                  onChange={(event) => updateCurrent({ min: Number(event.target.value) || 0 } as FixtureSliderBlock)}
                />
              </div>
              <div className="space-y-1">
                <Label>Maximum</Label>
                <Input
                  type="number"
                  min={0}
                  max={255}
                  value={block.max ?? 255}
                  onChange={(event) => updateCurrent({ max: Number(event.target.value) || 255 } as FixtureSliderBlock)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showValue">Zobrazit hodnotu</Label>
              <Switch
                id="showValue"
                checked={block.showValue ?? true}
                onCheckedChange={(checked) => updateCurrent({ showValue: checked } as FixtureSliderBlock)}
              />
            </div>
          </>
        )
      }
      case 'motor-pad':
        return (
          <>
            <div className="space-y-1">
              <Label>Motor</Label>
              <Select
                value={block.motorId ?? 'none'}
                onValueChange={(value) => updateCurrent({ motorId: value === 'none' ? null : value } as MotorPadBlock)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vyber motor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">┼Ż├ídn├Ż</SelectItem>
                  {stepperMotors.map((motor) => (
                    <SelectItem key={motor.id} value={motor.id}>
                      {motor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Osa</Label>
              <Select value={block.axis} onValueChange={(value: MotorPadBlock['axis']) => updateCurrent({ axis: value } as MotorPadBlock)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pan">Pan</SelectItem>
                  <SelectItem value="tilt">Tilt</SelectItem>
                  <SelectItem value="linear">Line├írn├ş</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Rychlost (0-5)</Label>
              <Input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={block.speedScale ?? 1}
                onChange={(event) => updateCurrent({ speedScale: Number(event.target.value) || 1 } as MotorPadBlock)}
              />
            </div>
          </>
        )
      case 'servo-knob':
        return (
          <>
            <div className="space-y-1">
              <Label>Servo</Label>
              <Select
                value={block.servoId ?? 'none'}
                onValueChange={(value) => updateCurrent({ servoId: value === 'none' ? null : value } as ServoKnobBlock)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vyber servo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">┼Ż├ídn├ę</SelectItem>
                  {servos.map((servo) => (
                    <SelectItem key={servo.id} value={servo.id}>
                      {servo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="servo-show-target">Zobrazit c├şlovou hodnotu</Label>
              <Switch
                id="servo-show-target"
                checked={block.showTarget ?? true}
                onCheckedChange={(checked) => updateCurrent({ showTarget: checked } as ServoKnobBlock)}
              />
            </div>
          </>
        )
      case 'markdown-note':
        return (
          <div className="space-y-1">
            <Label>Obsah pozn├ímky (Markdown)</Label>
            <Textarea
              rows={6}
              value={block.content}
              onChange={(event) => updateCurrent({ content: event.target.value } as MarkdownNoteBlock)}
            />
          </div>
        )
      case 'master-dimmer':
      default:
        return (
          <div className="flex items-center justify-between">
            <Label htmlFor="show-percent">Zobrazit procenta</Label>
            <Switch
              id="show-percent"
              checked={(block as MasterDimmerBlock).showPercent ?? true}
              onCheckedChange={(checked) => updateCurrent({ showPercent: checked } as MasterDimmerBlock)}
            />
          </div>
        )
    }
  })()

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label>N├ízev</Label>
          <Input value={block.title ?? ''} onChange={(event) => updateCurrent({ title: event.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>Velikost</Label>
          <Select value={block.size ?? 'md'} onValueChange={(value: CustomBlockSize) => updateCurrent({ size: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sizeOptions.map((size) => (
                <SelectItem key={size} value={size}>
                  {size.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <Label>Popis</Label>
        <Input value={block.description ?? ''} onChange={(event) => updateCurrent({ description: event.target.value })} />
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {(['col', 'row', 'width', 'height'] as (keyof CustomBlockPosition)[]).map((field) => (
          <div key={field} className="space-y-1">
            <Label>{field.toUpperCase()}</Label>
            <Input
              type="number"
              min={0}
              value={block.position?.[field] ?? (field === 'width' ? 3 : 0)}
              onChange={(event) => handlePositionChange(field, Number(event.target.value))}
            />
          </div>
        ))}
      </div>
      <Separator />
      <div className="grid gap-4 md:grid-cols-2">{blockContent}</div>
    </div>
  )
}
