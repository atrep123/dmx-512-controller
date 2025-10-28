import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Trash,
  ArrowUp,
  ArrowDown,
  DotsSixVertical,
  Faders,
  Lightbulb,
  PencilSimple,
  Plus,
  Palette,
  Lightning,
  Target,
} from '@phosphor-icons/react'
import {
  ChannelSliderBlock,
  ColorPickerBlock,
  ToggleButtonBlock,
  ButtonPadBlock,
  PositionControlBlock,
  IntensityFaderBlock,
} from '@/components/controls'
import { Fixture, StepperMotor, Servo, Effect } from '@/lib/types'

type BlockType = 'toggle' | 'channel' | 'color' | 'intensity' | 'position' | 'button-pad'
type BlockVariant = 'default' | 'compact' | 'minimal'

interface ControlBlock {
  id: string
  type: BlockType
  title: string
  fixtureId?: string
  motorId?: string
  servoId?: string
  effectId?: string
  channelName?: string
  variant?: BlockVariant
}

interface CustomPageBuilderProps {
  fixtures: Fixture[]
  stepperMotors: StepperMotor[]
  servos: Servo[]
  effects: Effect[]
  setFixtures: (value: Fixture[] | ((prev: Fixture[]) => Fixture[])) => void
  setStepperMotors: (value: StepperMotor[] | ((prev: StepperMotor[]) => StepperMotor[])) => void
  setServos: (value: Servo[] | ((prev: Servo[]) => Servo[])) => void
  setEffects: (value: Effect[] | ((prev: Effect[]) => Effect[])) => void
}

export default function CustomPageBuilder({
  fixtures,
  stepperMotors,
  servos,
  effects,
  setFixtures,
  setStepperMotors,
  setServos,
  setEffects,
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

  const addBlock = () => {
    if (!newBlock.title || !newBlock.type) {
      toast.error('Vyplňte název bloku')
      return
    }

    const block: ControlBlock = {
      id: `block-${Date.now()}`,
      type: newBlock.type as BlockType,
      title: newBlock.title,
      fixtureId: newBlock.fixtureId,
      motorId: newBlock.motorId,
      servoId: newBlock.servoId,
      effectId: newBlock.effectId,
      channelName: newBlock.channelName,
      variant: (newBlock.variant as BlockVariant) ?? 'default',
    }

    setControlBlocks((prev) => [...(prev || []), block])
    setIsDialogOpen(false)
    setNewBlock({ type: 'toggle', title: '', variant: 'default' })
    toast.success('Blok přidán')
  }

  const updateBlock = () => {
    if (!selectedBlock) {
      return
    }

    setControlBlocks((prev) =>
      (prev || []).map((b) =>
        b.id === selectedBlock.id
          ? {
              ...b,
              title: newBlock.title ?? b.title,
              fixtureId: newBlock.fixtureId,
              motorId: newBlock.motorId,
              servoId: newBlock.servoId,
              effectId: newBlock.effectId,
              channelName: newBlock.channelName,
              variant: (newBlock.variant as BlockVariant) ?? b.variant,
            }
          : b
      )
    )
    setIsDialogOpen(false)
    setSelectedBlock(null)
    setNewBlock({ type: 'toggle', title: '', variant: 'default' })
    toast.success('Blok upraven')
  }

  const deleteBlock = (id: string) => {
    setControlBlocks((prev) => (prev || []).filter((b) => b.id !== id))
    toast.success('Blok smazán')
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    setControlBlocks((prev) => {
      const list = [...(prev || [])]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      ;[list[index], list[targetIndex]] = [list[targetIndex], list[index]]
      return list
    })
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null) return

    setControlBlocks((prev) => {
      const list = [...(prev || [])]
      const [draggedItem] = list.splice(draggedIndex, 1)
      list.splice(dropIndex, 0, draggedItem)
      return list
    })

    setDraggedIndex(null)
  }

  const openEditDialog = (block: ControlBlock) => {
    setSelectedBlock(block)
    setNewBlock({
      title: block.title,
      type: block.type,
      fixtureId: block.fixtureId,
      motorId: block.motorId,
      servoId: block.servoId,
      effectId: block.effectId,
      channelName: block.channelName,
      variant: block.variant ?? 'default',
    })
    setIsDialogOpen(true)
  }

  const getBlockVariant = (block: ControlBlock): 'default' | 'compact' => {
    const variant = block.variant
    if (variant === 'compact') {
      return variant
    }
    return 'default'
  }

  const renderBlock = (block: ControlBlock, index: number) => {
    const variant = getBlockVariant(block)

    switch (block.type) {
      case 'toggle': {
        const effect = effects.find((e) => e.id === block.effectId)
        if (!effect) return null

        return (
          <div key={block.id}>
            <ToggleButtonBlock
              label={block.title}
              active={effect.isActive}
              onToggle={() => {
                setEffects((prev) =>
                  (prev || []).map((e) => (e.id === effect.id ? { ...e, isActive: !e.isActive } : e))
                )
              }}
              variant={variant === 'compact' ? 'minimal' : 'default'}
            />
          </div>
        )
      }

      case 'channel': {
        const fixture = fixtures.find((f) => f.id === block.fixtureId)
        if (!fixture) return null
        const channel = fixture.channels.find((ch) => ch.name === block.channelName)
        if (!channel) return null

        return (
          <div key={block.id}>
            <ChannelSliderBlock
              label={block.title}
              value={channel?.value ?? 0}
              onChange={(value) => {
                setFixtures((prev) =>
                  prev.map((f) =>
                    f.id === fixture.id
                      ? {
                          ...f,
                          channels: f.channels.map((ch) =>
                            ch.id === channel?.id ? { ...ch, value } : ch
                          ),
                        }
                      : f
                  )
                )
              }}
              variant={variant}
            />
          </div>
        )
      }

      case 'color': {
        const fixture = fixtures.find((f) => f.id === block.fixtureId)
        if (!fixture) return null
        const rCh = fixture.channels.find((ch) => ch.name.toLowerCase().includes('red'))
        const gCh = fixture.channels.find((ch) => ch.name.toLowerCase().includes('green'))
        const bCh = fixture.channels.find((ch) => ch.name.toLowerCase().includes('blue'))
        const wCh = fixture.channels.find((ch) => ch.name.toLowerCase().includes('white'))

        return (
          <div key={block.id}>
            <ColorPickerBlock
              red={rCh?.value ?? 0}
              green={gCh?.value ?? 0}
              blue={bCh?.value ?? 0}
              white={wCh?.value ?? 0}
              hasWhite={!!wCh}
              onColorChange={(color) => {
                setFixtures((prev) =>
                  (prev || []).map((f) =>
                    f.id === fixture.id
                      ? {
                          ...f,
                          channels: f.channels.map((ch) => {
                            if (ch.id === rCh?.id) return { ...ch, value: color.red }
                            if (ch.id === gCh?.id) return { ...ch, value: color.green }
                            if (ch.id === bCh?.id) return { ...ch, value: color.blue }
                            if (ch.id === wCh?.id && color.white !== undefined) return { ...ch, value: color.white }
                            return ch
                          }),
                        }
                      : f
                  )
                )
              }}
              variant={variant}
            />
          </div>
        )
      }

      case 'intensity': {
        const fixture = fixtures.find((f) => f.id === block.fixtureId)
        if (!fixture) return null
        const intensityChannel = fixture.channels.find((ch) => {
          const n = ch.name.toLowerCase()
          return n.includes('dimmer') || n.includes('intensity') || n.includes('master')
        })
        if (!intensityChannel) return null

        return (
          <div key={block.id}>
            <IntensityFaderBlock
              label={block.title}
              value={intensityChannel?.value ?? 0}
              onChange={(value) => {
                setFixtures((prev) =>
                  prev.map((f) =>
                    f.id === fixture.id
                      ? {
                          ...f,
                          channels: f.channels.map((ch) =>
                            ch.id === intensityChannel?.id ? { ...ch, value } : ch
                          ),
                        }
                      : f
                  )
                )
              }}
              variant={variant}
            />
          </div>
        )
      }

      case 'position': {
        const fixture = fixtures.find((f) => f.id === block.fixtureId)
        if (!fixture) return null
        const panCh = fixture.channels.find((ch) => ch.name.toLowerCase().includes('pan'))
        const tiltCh = fixture.channels.find((ch) => ch.name.toLowerCase().includes('tilt'))
        if (!panCh || !tiltCh) return null

        return (
          <div key={block.id}>
            <PositionControlBlock
              title={block.title}
              panValue={panCh?.value ?? 127}
              tiltValue={tiltCh?.value ?? 127}
              onPanChange={(value) => {
                setFixtures((prev) =>
                  (prev || []).map((f) =>
                    f.id === fixture.id
                      ? {
                          ...f,
                          channels: f.channels.map((ch) =>
                            ch.id === panCh?.id ? { ...ch, value } : ch
                          ),
                        }
                      : f
                  )
                )
              }}
              onTiltChange={(value) => {
                setFixtures((prev) =>
                  (prev || []).map((f) =>
                    f.id === fixture.id
                      ? {
                          ...f,
                          channels: f.channels.map((ch) =>
                            ch.id === tiltCh?.id ? { ...ch, value } : ch
                          ),
                        }
                      : f
                  )
                )
              }}
              variant={variant}
            />
          </div>
        )
      }

      case 'button-pad': {
        const buttons = effects.map((e) => {
          const color = e.isActive ? 'accent' : 'default'
          return {
            id: e.id,
            label: e.name,
            icon: <Lightning weight="fill" />,
            color: color as 'default' | 'accent' | 'secondary' | 'destructive',
          }
        })

        return (
          <div key={block.id}>
            <ButtonPadBlock
              title={block.title}
              items={buttons}
              activeId={effects.find((e) => e.isActive)?.id ?? null}
              onItemClick={(id) => {
                setEffects((prev) =>
                  (prev || []).map((e) => (e.id === id ? { ...e, isActive: !e.isActive } : e))
                )
              }}
              variant={variant}
            />
          </div>
        )
      }

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Moje stránka</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Vlastní rozvržení ovládacích prvků
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant={editMode ? 'default' : 'outline'} onClick={() => setEditMode(!editMode)}>
            <PencilSimple />
            {editMode ? 'Hotovo' : 'Upravit'}
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2" />
            Přidat blok
          </Button>
        </div>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false)
            setSelectedBlock(null)
            setNewBlock({ type: 'toggle', title: '', variant: 'default' })
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedBlock ? 'Upravit blok' : 'Nový blok'}</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div>
                <Label>Název bloku</Label>
                <Input
                  value={newBlock.title}
                  onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                  placeholder="Např. Hlavní osvětlení"
                />
              </div>

              <div>
                <Label>Typ bloku</Label>
                <Select
                  value={newBlock.type}
                  onValueChange={(value) => setNewBlock({ ...newBlock, type: value as BlockType })}
                  disabled={!!selectedBlock}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="toggle">
                      <div className="flex items-center gap-2">
                        <Lightning size={16} />
                        Přepínač (Toggle)
                      </div>
                    </SelectItem>
                    <SelectItem value="channel">
                      <div className="flex items-center gap-2">
                        <Faders size={16} />
                        Kanál (Slider)
                      </div>
                    </SelectItem>
                    <SelectItem value="color">
                      <div className="flex items-center gap-2">
                        <Palette size={16} />
                        Barva (Color)
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
                        Pozice (Pan/Tilt)
                      </div>
                    </SelectItem>
                    <SelectItem value="button-pad">
                      <div className="flex items-center gap-2">
                        <DotsSixVertical size={16} />
                        Tlačítkové pole
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Varianta vzhledu</Label>
                <Select
                  value={newBlock.variant ?? 'default'}
                  onValueChange={(value) => setNewBlock({ ...newBlock, variant: value as BlockVariant })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Výchozí</SelectItem>
                    <SelectItem value="compact">Kompaktní</SelectItem>
                    <SelectItem value="minimal">Minimální</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newBlock.type === 'toggle' && (
                <div>
                  <Label>Efekt</Label>
                  <Select
                    value={newBlock.effectId}
                    onValueChange={(value) => setNewBlock({ ...newBlock, effectId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte efekt" />
                    </SelectTrigger>
                    <SelectContent>
                      {effects.map((effect) => (
                        <SelectItem key={effect.id} value={effect.id}>
                          {effect.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(newBlock.type === 'channel' ||
                newBlock.type === 'intensity' ||
                newBlock.type === 'color' ||
                newBlock.type === 'position') && (
                <div>
                  <Label>Světlo</Label>
                  <Select
                    value={newBlock.fixtureId}
                    onValueChange={(value) => setNewBlock({ ...newBlock, fixtureId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte světlo" />
                    </SelectTrigger>
                    <SelectContent>
                      {fixtures.map((fixture) => (
                        <SelectItem key={fixture.id} value={fixture.id}>
                          {fixture.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {newBlock.type === 'channel' && newBlock.fixtureId && (
                <div>
                  <Label>DMX Kanál</Label>
                  <Select
                    value={newBlock.channelName}
                    onValueChange={(value) => setNewBlock({ ...newBlock, channelName: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte kanál" />
                    </SelectTrigger>
                    <SelectContent>
                      {fixtures
                        .find((f) => f.id === newBlock.fixtureId)
                        ?.channels.map((ch) => (
                          <SelectItem key={ch.id} value={ch.name}>
                            {ch.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            {selectedBlock ? (
              <>
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
                <Button onClick={updateBlock}>Uložit změny</Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setNewBlock({ type: 'toggle', title: '', variant: 'default' })
                  }}
                >
                  Zrušit
                </Button>
                <Button onClick={addBlock}>Přidat blok</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {(controlBlocks || []).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Lightbulb size={48} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Zatím žádné bloky</h3>
          <p className="text-muted-foreground mb-6">
            Přidejte první ovládací blok pro vaši vlastní stránku
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2" />
            Přidat blok
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {(controlBlocks || []).map((block, index) => (
            <div
              key={block.id}
              draggable={editMode}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className="relative"
            >
              <Card className={`p-4 ${editMode ? 'cursor-move' : ''}`}>
                {editMode && (
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => openEditDialog(block)}
                    >
                      <PencilSimple />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      disabled={index === 0}
                      onClick={() => moveBlock(index, 'up')}
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      disabled={index === (controlBlocks || []).length - 1}
                      onClick={() => moveBlock(index, 'down')}
                    >
                      <ArrowDown />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0"
                      onClick={() => deleteBlock(block.id)}
                    >
                      <Trash />
                    </Button>
                  </div>
                )}
                {renderBlock(block, index)}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
