import React, { useState } from 'react'
import { useKV } from '@github/spark/hooks'

// shadcn/ui
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// ikony (Phosphor)
import {
  Trash,
  ArrowDown,
  ArrowUp,
  DotsSixVertical,
  Faders,
  Lightbulb,
  Lightning,
  Palette,
  Target,
  Fire,
  Plus,
} from '@phosphor-icons/react'

import { toast } from 'sonner'

import {
  ToggleButtonBlock,
  IntensityFaderBlock
  ButtonPadBlock,
  IntensityFaderBlock,
  PositionControlBlock,
  ButtonPadBlock,
} from '@/components/controls'
type ControlBlockType = 'toggle' | 'channel' | 'color' | 'intensity' | 'position' | 'button-pad'
  title: string
  type: ControlBlockType
  fixtureId?: string
  motorId?: string
  servoId?: string
  effectId?: string
  channelName?: string
  variant?: BlockVariant
  config?: Record<string, unknown>
}

interface CustomPageBuilderProps {
  stepperMotors: StepperMotor[]
  servos: Servo[]
  effects: Effect[]
  fixtures: Fixture[]
  setStepperMotors: React.Dispatch<React.SetStateAction<StepperMotor[]>>
  setServos: React.Dispatch<React.SetStateAction<Servo[]>>
  setEffects: React.Dispatch<React.SetStateAction<Effect[]>>
  setFixtures: React.Dispatch<React.SetStateAction<Fixture[]>>
}

// ---------- Komponenta ----------
export default function CustomPageBuilder({
  stepperMotors,
  servos,
  effects,
  fixtures,
  setStepperMotors, // připraveno do budoucna
  setServos,        // připraveno do budoucna
  setEffects,
  setFixtures,
}: CustomPageBuilderProps) {
  const [controlBlocks, setControlBlocks] = useKV<ControlBlock[]>('custom-control-blocks', [])
  const [editMode, setEditMode] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<ControlBlock | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [newBlock, setNewBlock] = useState<Partial<ControlBlock>>({
    type: 'toggle',
    title: '',
    variant: 'default',
  })

  const getVariant = <T extends string>(
    variant: BlockVariant | undefined,
    allowed: readonly T[]
  ): T | undefined => {
    if (!variant) return undefined
    return allowed.includes(variant as T) ? (variant as T) : undefined
  }

  // ---------- Akce nad bloky ----------
  const addBlock = () => {
    if (!newBlock.title) {
      toast.error('Zadejte název bloku')
      return
    }

    const block: ControlBlock = {
      id: `block-${Date.now()}`,
      title: newBlock.title!,
      type: (newBlock.type as ControlBlockType) || 'toggle',
      fixtureId: newBlock.fixtureId,
      motorId: newBlock.motorId,
      servoId: newBlock.servoId,
      effectId: newBlock.effectId,
      channelName: newBlock.channelName,
      variant: (newBlock.variant as BlockVariant) || 'default',
      config: newBlock.config,
    }

    setControlBlocks(prev => ([...(prev || []), block]))
    setNewBlock({ type: 'toggle', title: '', variant: 'default' })
    setIsDialogOpen(false)
    toast.success('Blok přidán')
  }

  const updateBlock = () => {
    if (!selectedBlock || !newBlock.title) {
      toast.error('Zadejte název bloku')
      return
    }

    setControlBlocks(prev =>
      (prev || []).map(b =>
        b.id === selectedBlock.id
          ? {
              ...b,
              title: newBlock.title ?? b.title,
              effectId: newBlock.effectId ?? b.effectId,
              fixtureId: newBlock.fixtureId ?? b.fixtureId,
              motorId: newBlock.motorId ?? b.motorId,
              servoId: newBlock.servoId ?? b.servoId,
              channelName: newBlock.channelName ?? b.channelName,
              variant: (newBlock.variant as BlockVariant) ?? b.variant,
              config: newBlock.config ?? b.config,
            }
          : b
      )
    )

    setSelectedBlock(null)
    setNewBlock({ type: 'toggle', title: '', variant: 'default' })
    setIsDialogOpen(false)
    toast.success('Blok upraven')
  }

  const removeBlock = (id: string) => {
    setControlBlocks(prev => (prev || []).filter(b => b.id !== id))
    toast.success('Blok odstraněn')
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    setControlBlocks(prev => {
      const list = [...(prev || [])]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= list.length) return prev || []
      ;[list[index], list[targetIndex]] = [list[targetIndex], list[index]]
      return list
    })
  }

  // ---------- Drag & drop ----------
  const handleDragStart = (index: number) => setDraggedIndex(index)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    setControlBlocks(prev => {
      const list = [...(prev || [])]
      const dragged = list[draggedIndex]
      list.splice(draggedIndex, 1)
      list.splice(index, 0, dragged)
      return list
    })
    setDraggedIndex(index)
  }

  const handleDragEnd = () => setDraggedIndex(null)

  const handleEditBlock = (block: ControlBlock) => {
    setSelectedBlock(block)
    setNewBlock({
      title: block.title,
      type: block.type,
      fixtureId: block.fixtureId,
      motorId: block.motorId,
      servoId: block.servoId,
      effectId: block.effectId,
      channelName: block.channelName,
      variant: block.variant,
      config: block.config,
    })
    setIsDialogOpen(true)
  }

  // ---------- Render jednoho bloku ----------
  const renderBlock = (block: ControlBlock, index: number) => {
    const fixture = fixtures.find(f => f.id === block.fixtureId)
    const effect = effects.find(e => e.id === block.effectId)

    const toggleEffect = () => {
      if (!effect) return
      setEffects(prev => prev.map(e => (e.id === effect.id ? { ...e, isActive: !e.isActive } : e)))
    }

    const updateFixtureChannel = (channelName: string, value: number) => {
      if (!fixture) return
      setFixtures(prev =>
        prev.map(f =>
          f.id === fixture.id
            ? {
                ...f,
                channels: f.channels.map(ch =>
                  ch.name.toLowerCase().includes(channelName.toLowerCase()) ? { ...ch, value } : ch
                ),
              }
            : f
        )
      )
    }

    const updateFixtureColor = (r: number, g: number, b: number, w?: number) => {
      if (!fixture) return
      const is = (name: string, keys: string[]) =>
        new RegExp(`(^|\\b)(${keys.join('|')})(\\b|$)`).test(name)

      setFixtures(prev =>
        prev.map(f =>
          f.id === fixture.id
            ? {
                ...f,
                channels: f.channels.map(ch => {
                  const n = ch.name.toLowerCase()
                  if (is(n, ['red', 'r'])) return { ...ch, value: r }
                  if (is(n, ['green', 'g'])) return { ...ch, value: g }
                  if (is(n, ['blue', 'b'])) return { ...ch, value: b }
                  if (w !== undefined && is(n, ['white', 'w'])) return { ...ch, value: w }
                  return ch
                }),
              }
            : f
        )
      )
    }

    if (editMode) {
      return (
        <Card
          key={block.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={e => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className="p-4 cursor-move border-2 border-dashed"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DotsSixVertical size={20} className="text-muted-foreground" />
              <div>
                <p className="font-medium">{block.title}</p>
                <p className="text-xs text-muted-foreground">
                  {block.type === 'toggle' && 'Přepínač efektu'}
                  {block.type === 'channel' && 'Slider kanálu'}
                  {block.type === 'color' && 'Výběr barvy'}
                  {block.type === 'intensity' && 'Intenzita'}
                  {block.type === 'position' && 'Pozice Pan/Tilt'}
                  {block.type === 'button-pad' && 'Panel tlačítek'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => handleEditBlock(block)}>
                <Faders size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveBlock(index, 'up')}
                disabled={index === 0}
              >
                <ArrowUp size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveBlock(index, 'down')}
                disabled={index === (controlBlocks?.length || 0) - 1}
              >
                <ArrowDown size={16} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => removeBlock(block.id)}>
                <Trash size={16} />
              </Button>
            </div>
          </div>
        </Card>
      )
    }

    switch (block.type) {
      case 'toggle':
        return (
          <div key={block.id}>
            <ToggleButtonBlock
              label={block.title}
              active={effect?.isActive || false}
              onToggle={toggleEffect}
              icon={<Lightning weight="fill" />}
              variant={getVariant(block.variant, ['default', 'large', 'minimal'] as const)}
              effectId={block.effectId}
              showEdit={true}
              onEffectChange={() => handleEditBlock(block)}
            />
          </div>
        )

      case 'channel': {
        if (!fixture) return null
        const channel = fixture.channels.find(ch =>
          ch.name.toLowerCase().includes((block.channelName || '').toLowerCase())
        )
        return (
          <div key={block.id}>
            <ChannelSliderBlock
              label={block.title}
              value={channel?.value ?? 0}
              onChange={value => updateFixtureChannel(block.channelName || '', value)}
              variant={getVariant(block.variant, ['default', 'card', 'compact', 'large'] as const)}
            />
          </div>
        )
      }

      case 'color': {
        if (!fixture) return null
        const rCh = fixture.channels.find(ch => ch.name.toLowerCase().includes('red'))
        const gCh = fixture.channels.find(ch => ch.name.toLowerCase().includes('green'))
        const bCh = fixture.channels.find(ch => ch.name.toLowerCase().includes('blue'))
        const wCh = fixture.channels.find(ch => ch.name.toLowerCase().includes('white'))
        return (
          <div key={block.id}>
            <ColorPickerBlock
              red={rCh?.value ?? 0}
              green={gCh?.value ?? 0}
              blue={bCh?.value ?? 0}
              white={wCh?.value}
              onColorChange={c => updateFixtureColor(c.red, c.green, c.blue, c.white)}
              hasWhite={!!wCh}
              variant={getVariant(block.variant, ['default', 'compact'] as const)}
            />
          </div>
        )
      }

      case 'intensity': {
        if (!fixture) return null
        const intensityChannel = fixture.channels.find(ch => {
          const n = ch.name.toLowerCase()
          return n.includes('dimmer') || n.includes('intensity')
        })
        return (
          <div key={block.id}>
            <IntensityFaderBlock
              label={block.title}
              value={intensityChannel?.value ?? 0}
              onChange={value => updateFixtureChannel('dimmer', value)}
              variant={getVariant(block.variant, ['default', 'vertical', 'compact'] as const)}
            />
          </div>
        )
      }

      case 'position': {
        if (!fixture) return null
        const panCh = fixture.channels.find(ch => ch.name.toLowerCase().includes('pan'))
        const tiltCh = fixture.channels.find(ch => ch.name.toLowerCase().includes('tilt'))
        return (
          <div key={block.id}>
            <PositionControlBlock
              title={block.title}
              panValue={panCh?.value ?? 127}
              tiltValue={tiltCh?.value ?? 127}
              onPanChange={value => updateFixtureChannel('pan', value)}
              onTiltChange={value => updateFixtureChannel('tilt', value)}
              variant={getVariant(block.variant, ['default', 'compact'] as const)}
            />
          </div>
        )
      }

      case 'button-pad': {
        const effectButtons = effects.slice(0, 6).map((e, i) => {
          const color = i % 2 === 0 ? 'accent' : 'default'
          return {
            id: e.id,
            label: e.name,
            icon: <Lightning weight="fill" />,
            color: color as 'accent' | 'default',
          }
        })

        return (
          <div key={block.id}>
            <ButtonPadBlock
              title={block.title}
              items={effectButtons}
              activeId={effects.find(e => e.isActive)?.id || null}
              onItemClick={id => {
                setEffects(prev => prev.map(e => ({ ...e, isActive: e.id === id ? !e.isActive : false })))
              }}
              columns={3}
              variant={getVariant(block.variant, ['default', 'compact'] as const)}
            />
          </div>
        )
      }

      default:
        return null
    }
  }

  // ---------- Render celé stránky ----------
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vlastní stránka</h2>
          <p className="text-sm text-muted-foreground mt-1">Vytvořte si vlastní rozvržení ovládacích prvků</p>
        </div>
        <div className="flex gap-2">
          <Button variant={editMode ? 'default' : 'outline'} onClick={() => setEditMode(!editMode)}>
            {editMode ? 'Hotovo' : 'Upravit'}
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setSelectedBlock(null)
                  setNewBlock({ type: 'toggle', title: '', variant: 'default' })
                }}
              >
                <Plus className="mr-2" />
                Přidat blok
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedBlock ? 'Upravit blok' : 'Nový ovládací blok'}</DialogTitle>
              </DialogHeader>

              <ScrollArea className="max-h-[500px]">
                <div className="space-y-4 p-1">
                  <div>
                    <Label>Název</Label>
                    <Input
                      value={newBlock.title ?? ''}
                      onChange={e => setNewBlock({ ...newBlock, title: e.target.value })}
                      placeholder="Např. Hlavní světlo"
                    />
                  </div>

                  <div>
                    <Label>Typ bloku</Label>
                    <Select
                      value={(newBlock.type as string) ?? 'toggle'}
                      onValueChange={value => setNewBlock({ ...newBlock, type: value as ControlBlockType })}
                      disabled={!!selectedBlock}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte typ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="toggle">
                          <div className="flex items-center gap-2">
                            <Lightning size={16} />
                            Přepínač efektu
                          </div>
                        </SelectItem>
                        <SelectItem value="channel">
                          <div className="flex items-center gap-2">
                            <Faders size={16} />
                            Slider kanálu
                          </div>
                        </SelectItem>
                        <SelectItem value="color">
                          <div className="flex items-center gap-2">
                            <Palette size={16} />
                            Výběr barvy
                          </div>
                        </SelectItem>
                        <SelectItem value="intensity">
                          <div className="flex items-center gap-2">
                            <Lightbulb size={16} />
                            Intenzita
                          </div>
                        </SelectItem>
                        <SelectItem value="position">
                          <div className="flex items-center gap-2">
                            <Target size={16} />
                            Pozice Pan/Tilt
                          </div>
                        </SelectItem>
                        <SelectItem value="button-pad">
                          <div className="flex items-center gap-2">
                            <Fire size={16} />
                            Panel tlačítek (6 efektů)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Varianta</Label>
                    <Select
                      value={(newBlock.variant as string) || 'default'}
                      onValueChange={value => setNewBlock({ ...newBlock, variant: value as BlockVariant })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte variantu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Výchozí</SelectItem>
                        <SelectItem value="large">Velká</SelectItem>
                        <SelectItem value="minimal">Minimální</SelectItem>
                        <SelectItem value="compact">Kompaktní</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newBlock.type === 'toggle' && (
                    <div>
                      <Label>Efekt</Label>
                      <Select
                        value={newBlock.effectId ?? ''}
                        onValueChange={value => setNewBlock({ ...newBlock, effectId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Vyberte efekt" />
                        </SelectTrigger>
                        <SelectContent>
                          {effects.map(effect => (
                            <SelectItem key={effect.id} value={effect.id}>
                              {effect.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {(newBlock.type === 'channel' ||
                    newBlock.type === 'color' ||
                    newBlock.type === 'intensity' ||
                    newBlock.type === 'position') && (
                    <div>
                      <Label>Světlo</Label>
                      <Select
                        value={newBlock.fixtureId ?? ''}
                        onValueChange={value => setNewBlock({ ...newBlock, fixtureId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Vyberte světlo" />
                        </SelectTrigger>
                        <SelectContent>
                          {fixtures.map(fixture => (
                            <SelectItem key={fixture.id} value={fixture.id}>
                              {fixture.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {newBlock.type === 'channel' && (
                    <div>
                      <Label>Název kanálu</Label>
                      <Input
                        value={newBlock.channelName ?? ''}
                        onChange={e => setNewBlock({ ...newBlock, channelName: e.target.value })}
                        placeholder="Např. dimmer, red, pan"
                      />
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button onClick={selectedBlock ? updateBlock : addBlock} className="flex-1">
                      {selectedBlock ? 'Uložit změny' : 'Přidat'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false)
                        setSelectedBlock(null)
                        setNewBlock({ type: 'toggle', title: '', variant: 'default' })
                      }}
                    >
                      Zrušit
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!controlBlocks || controlBlocks.length === 0 ? (
        <Card className="p-12 text-center">
          <Lightbulb size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Žádné bloky</h3>
          <p className="text-sm text-muted-foreground mb-4">Začněte přidáním prvního ovládacího bloku</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(controlBlocks || []).map((block, index) => renderBlock(block, index))}
        </div>
      )}
    </div>
  )
}

