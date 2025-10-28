import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  Pencil,
  PencilSimple,
} from '@phosphor-icons/react'
import { toast } from 'sonner'

import {
  ToggleButtonBlock,
  PositionControlBlock,
  ChannelSliderBlock,
  ColorPickerBlock,
  IntensityFaderBlock,
  ButtonPadBlock,
} from '@/components/controls'

import { Fixture, Effect, StepperMotor, Servo } from '@/lib/types'

type ControlBlockType = 'toggle' | 'channel' | 'color' | 'intensity' | 'position' | 'button-pad'
type BlockVariant = 'default' | 'large' | 'minimal' | 'compact' | 'card' | 'vertical'

interface ControlBlock {
  id: string
  title: string
  type: ControlBlockType
  fixtureId?: string
  motorId?: string
  servoId?: string
  effectId?: string
  channelName?: string
  variant?: BlockVariant
}

interface CustomPageBuilderProps {
  fixtures: Fixture[]
  setFixtures: (value: Fixture[] | ((prev: Fixture[]) => Fixture[])) => void
  stepperMotors: StepperMotor[]
  setStepperMotors: (value: StepperMotor[] | ((prev: StepperMotor[]) => StepperMotor[])) => void
  servos: Servo[]
  setServos: (value: Servo[] | ((prev: Servo[]) => Servo[])) => void
  effects: Effect[]
  setEffects: (value: Effect[] | ((prev: Effect[]) => Effect[])) => void
}

export default function CustomPageBuilder({
  fixtures,
  setFixtures,
  stepperMotors,
  setStepperMotors,
  servos,
  setServos,
  effects,
  setEffects,
}: CustomPageBuilderProps) {
  const [controlBlocks, setControlBlocks] = useKV<ControlBlock[]>('custom-page-blocks', [])
  const [editMode, setEditMode] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<ControlBlock | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [newBlock, setNewBlock] = useState<Partial<ControlBlock>>({
    type: 'toggle',
    variant: 'default',
  })

  const addBlock = () => {
    if (!newBlock.title) {
      toast.error('Zadejte název bloku')
      return
    }

    const block: ControlBlock = {
      id: `block-${Date.now()}`,
      type: (newBlock.type as ControlBlockType) ?? 'toggle',
      title: newBlock.title,
      fixtureId: newBlock.fixtureId,
      motorId: newBlock.motorId,
      effectId: newBlock.effectId,
      servoId: newBlock.servoId,
      channelName: newBlock.channelName,
      variant: (newBlock.variant as BlockVariant) ?? 'default',
    }

    setControlBlocks((prev) => [...(prev || []), block])
    setIsDialogOpen(false)
    setNewBlock({ type: 'toggle', variant: 'default' })
    toast.success('Blok přidán')
  }

  const updateBlock = () => {
    if (!selectedBlock || !newBlock.title) {
      toast.error('Zadejte název bloku')
      return
    }

    setControlBlocks((prev) =>
      (prev || []).map((block) =>
        block.id === selectedBlock.id
          ? {
              ...block,
              title: newBlock.title ?? block.title,
              fixtureId: newBlock.fixtureId,
              motorId: newBlock.motorId,
              servoId: newBlock.servoId,
              effectId: newBlock.effectId,
              channelName: newBlock.channelName,
              variant: (newBlock.variant as BlockVariant) ?? block.variant,
            }
          : block
      )
    )

    setIsDialogOpen(false)
    setSelectedBlock(null)
    setNewBlock({ type: 'toggle', variant: 'default' })
    toast.success('Blok upraven')
  }

  const deleteBlock = (id: string) => {
    setControlBlocks((prev) => (prev || []).filter((block) => block.id !== id))
    toast.success('Blok smazán')
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    setControlBlocks((prev) => {
      const list = [...(prev || [])]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= list.length) return list
      ;[list[index], list[targetIndex]] = [list[targetIndex], list[index]]
      return list
    })
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return
    setControlBlocks((prev) => {
      const list = [...(prev || [])]
      const dragged = list[draggedIndex]
      list.splice(draggedIndex, 1)
      list.splice(index, 0, dragged)
      setDraggedIndex(index)
      return list
    })
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleEditBlock = (block: ControlBlock) => {
    setSelectedBlock(block)
    setNewBlock({
      type: block.type,
      title: block.title,
      fixtureId: block.fixtureId,
      motorId: block.motorId,
      servoId: block.servoId,
      effectId: block.effectId,
      channelName: block.channelName,
      variant: block.variant,
    })
    setIsDialogOpen(true)
  }

  const renderBlock = (block: ControlBlock, index: number) => {
    const fixture = fixtures.find((f) => f.id === block.fixtureId)
    const effect = effects.find((e) => e.id === block.effectId)

    const getVariant = (variant?: BlockVariant) => {
      if (variant === 'large' || variant === 'minimal' || variant === 'compact' || variant === 'card') {
        return variant
      }
      return 'default'
    }

    switch (block.type) {
      case 'toggle': {
        const toggleEffect = () => {
          setEffects((prev) =>
            prev.map((e) => (e.id === effect?.id ? { ...e, isActive: !e.isActive } : e))
          )
        }

        const toggleVariant = block.variant === 'large' || block.variant === 'minimal' ? block.variant : 'default'

        return (
          <div key={block.id}>
            <ToggleButtonBlock
              label={block.title}
              active={effect?.isActive || false}
              icon={<Lightning weight="fill" />}
              onToggle={toggleEffect}
              variant={toggleVariant}
            />
          </div>
        )
      }

      case 'channel': {
        if (!fixture) return null
        const channel = fixture.channels.find((ch) =>
          ch.name.toLowerCase().includes(block.channelName?.toLowerCase() || '')
        )
        const channelVariant = block.variant === 'card' || block.variant === 'compact' || block.variant === 'large' ? block.variant : 'default'
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
              variant={channelVariant}
            />
          </div>
        )
      }

      case 'color': {
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
              white={wCh?.value}
              hasWhite={!!wCh}
              onColorChange={(color) => {
                setFixtures((prev) =>
                  prev.map((f) =>
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
              variant={block.variant === 'compact' ? 'compact' : 'default'}
            />
          </div>
        )
      }

      case 'intensity': {
        if (!fixture) return null
        const intensityChannel = fixture.channels.find((ch) => {
          const n = ch.name.toLowerCase()
          return n.includes('dimmer') || n.includes('intensity') || n.includes('master')
        })
        const intensityVariant = block.variant === 'vertical' || block.variant === 'compact' ? block.variant : 'default'
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
              variant={intensityVariant}
            />
          </div>
        )
      }

      case 'position': {
        if (!fixture) return null
        const panCh = fixture.channels.find((ch) => ch.name.toLowerCase().includes('pan'))
        const tiltCh = fixture.channels.find((ch) => ch.name.toLowerCase().includes('tilt'))
        const positionVariant = block.variant === 'compact' ? 'compact' : 'default'
        return (
          <div key={block.id}>
            <PositionControlBlock
              title={block.title}
              panValue={panCh?.value ?? 128}
              tiltValue={tiltCh?.value ?? 128}
              onPanChange={(value) => {
                setFixtures((prev) =>
                  prev.map((f) =>
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
                  prev.map((f) =>
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
              variant={positionVariant}
            />
          </div>
        )
      }

      case 'button-pad': {
        const buttonItems = effects.map((e, i) => {
          const color = i % 2 === 0 ? 'accent' : 'secondary'
          return {
            id: e.id,
            label: e.name,
            color: color as 'default' | 'accent' | 'secondary' | 'destructive',
          }
        })

        return (
          <div key={block.id}>
            <ButtonPadBlock
              title={block.title}
              items={buttonItems}
              activeId={effects.find((e) => e.isActive)?.id}
              onItemClick={(id) => {
                setEffects((prev) => prev.map((e) => ({ ...e, isActive: e.id === id ? !e.isActive : false })))
              }}
              columns={3}
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
        <h2 className="text-xl font-semibold">Moje ovládací stránka</h2>
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
          setIsDialogOpen(open)
          if (!open) {
            setSelectedBlock(null)
            setNewBlock({ type: 'toggle', variant: 'default' })
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedBlock ? 'Upravit blok' : 'Přidat nový blok'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[500px] pr-4">
            <div className="space-y-4">
              <div>
                <Label>Název bloku</Label>
                <Input
                  value={newBlock.title || ''}
                  onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                  placeholder="Např. Hlavní světla"
                />
              </div>

              <div>
                <Label>Typ bloku</Label>
                <Select
                  value={(newBlock.type as string) ?? 'toggle'}
                  onValueChange={(value) => setNewBlock({ ...newBlock, type: value as ControlBlockType })}
                  disabled={!!selectedBlock}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                        Kanál DMX
                      </div>
                    </SelectItem>
                    <SelectItem value="color">
                      <div className="flex items-center gap-2">
                        <Palette size={16} />
                        Ovladač barev
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
                        <Fire size={16} />
                        Panel tlačítek
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Varianta</Label>
                <Select
                  value={newBlock.variant || 'default'}
                  onValueChange={(value) => setNewBlock({ ...newBlock, variant: value as BlockVariant })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Výchozí</SelectItem>
                    <SelectItem value="large">Velký</SelectItem>
                    <SelectItem value="minimal">Minimální</SelectItem>
                    <SelectItem value="compact">Kompaktní</SelectItem>
                    <SelectItem value="card">Karta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newBlock.type === 'toggle' && (
                <div>
                  <Label>Efekt</Label>
                  <Select
                    value={newBlock.effectId || ''}
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
                newBlock.type === 'color' ||
                newBlock.type === 'intensity' ||
                newBlock.type === 'position') && (
                <div>
                  <Label>Světlo</Label>
                  <Select
                    value={newBlock.fixtureId || ''}
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

              {newBlock.type === 'channel' && (
                <div>
                  <Label>Název kanálu (část)</Label>
                  <Input
                    value={newBlock.channelName || ''}
                    onChange={(e) => setNewBlock({ ...newBlock, channelName: e.target.value })}
                    placeholder="Např. dimmer, strobe"
                  />
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
                    setNewBlock({ type: 'toggle', variant: 'default' })
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
                    setNewBlock({ type: 'toggle', variant: 'default' })
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

      {(!controlBlocks || controlBlocks.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Lightbulb size={48} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Žádné bloky</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Přidejte první ovládací blok kliknutím na tlačítko "Přidat blok"
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(controlBlocks || []).map((block, index) => (
            <div key={block.id} className="relative">
              {editMode && (
                <Card
                  className="absolute -top-2 -left-2 -right-2 -bottom-2 bg-muted/50 border-2 border-dashed border-primary z-10 flex items-center justify-center cursor-move"
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => {
                    e.preventDefault()
                    handleDragOver(index)
                  }}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex flex-col items-center gap-2 bg-background p-4 rounded-lg shadow-lg">
                    <div className="flex items-center gap-2">
                      <DotsSixVertical size={24} />
                      <span className="font-semibold">{block.title}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditBlock(block)
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveBlock(index, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveBlock(index, 'down')}
                        disabled={index === (controlBlocks || []).length - 1}
                      >
                        <ArrowDown />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteBlock(block.id)}
                      >
                        <Trash />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
              {renderBlock(block, index)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
