import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Lightning,
  Lightbulb,
  Faders,
  Palette,
  Target,
  DotsSixVertical,
  Plus,
  Gear,
  Trash,
  PencilSimple,
  ArrowUp,
  ArrowDown,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  ChannelSliderBlock,
  ColorPickerBlock,
  ToggleButtonBlock,
  PositionControlBlock,
  IntensityFaderBlock,
  ButtonPadBlock,
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
  variant: BlockVariant
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
    if (!selectedBlock || !newBlock.title || !newBlock.type) {
      toast.error('Vyplňte všechny povinné údaje')
      return
    }

    setControlBlocks((prev) =>
      (prev || []).map((block) =>
        block.id === selectedBlock.id
          ? {
              ...block,
              type: newBlock.type as BlockType,
              title: newBlock.title!,
              fixtureId: newBlock.fixtureId,
              motorId: newBlock.motorId,
              servoId: newBlock.servoId,
              effectId: newBlock.effectId,
              channelName: newBlock.channelName,
              variant: (newBlock.variant as BlockVariant) ?? 'default',
            }
          : block
      )
    )

    setIsDialogOpen(false)
    setSelectedBlock(null)
    setNewBlock({ type: 'toggle', title: '', variant: 'default' })
    toast.success('Blok aktualizován')
  }

  const deleteBlock = (id: string) => {
    setControlBlocks((prev) => (prev || []).filter((block) => block.id !== id))
    toast.success('Blok odstraněn')
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    setControlBlocks((prev) => {
      const currentBlocks = prev || []
      const newBlocks = [...currentBlocks]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= newBlocks.length) return currentBlocks
      
      const temp = newBlocks[index]
      newBlocks[index] = newBlocks[targetIndex]
      newBlocks[targetIndex] = temp
      
      return newBlocks
    })
  }

  const openEditDialog = (block: ControlBlock) => {
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

  const renderBlock = (block: ControlBlock) => {
    switch (block.type) {
      case 'toggle': {
        const effect = effects.find((e) => e.id === block.effectId)
        if (!effect) return null

        const toggleVariant = block.variant === 'minimal' ? 'minimal' : block.variant === 'compact' ? 'large' : 'default'

        return (
          <div key={block.id}>
            <ToggleButtonBlock
              label={block.title}
              active={effect.isActive}
              onToggle={() => {
                setEffects((prev) =>
                  prev.map((e) => (e.id === effect.id ? { ...e, isActive: !e.isActive } : e))
                )
              }}
              variant={toggleVariant}
            />
          </div>
        )
      }

      case 'channel': {
        const fixture = fixtures.find((f) => f.id === block.fixtureId)
        if (!fixture || !block.channelName) return null

        const channel = fixture.channels.find((ch) => ch.name === block.channelName)
        if (!channel) return null

        const channelVariant = block.variant === 'minimal' ? 'default' : block.variant === 'compact' ? 'compact' : 'card'

        return (
          <div key={block.id}>
            <ChannelSliderBlock
              label={block.title}
              value={channel.value}
              onChange={(value) => {
                setFixtures((prev) =>
                  prev.map((f) =>
                    f.id === fixture.id
                      ? {
                          ...f,
                          channels: f.channels.map((ch) =>
                            ch.id === channel.id ? { ...ch, value } : ch
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
        const fixture = fixtures.find((f) => f.id === block.fixtureId)
        if (!fixture) return null

        const rCh = fixture.channels.find((ch) => ch.name.toLowerCase().includes('red'))
        const gCh = fixture.channels.find((ch) => ch.name.toLowerCase().includes('green'))
        const bCh = fixture.channels.find((ch) => ch.name.toLowerCase().includes('blue'))
        const wCh = fixture.channels.find((ch) => ch.name.toLowerCase().includes('white'))

        const colorVariant = block.variant === 'compact' ? 'compact' : 'default'

        return (
          <div key={block.id}>
            <ColorPickerBlock
              red={rCh?.value ?? 0}
              green={gCh?.value ?? 0}
              blue={bCh?.value ?? 0}
              white={wCh?.value ?? 0}
              hasWhite={!!wCh}
              onColorChange={({ red, green, blue, white }) => {
                setFixtures((prev) =>
                  prev.map((f) =>
                    f.id === fixture.id
                      ? {
                          ...f,
                          channels: f.channels.map((ch) => {
                            if (rCh && ch.id === rCh.id) return { ...ch, value: red }
                            if (gCh && ch.id === gCh.id) return { ...ch, value: green }
                            if (bCh && ch.id === bCh.id) return { ...ch, value: blue }
                            if (wCh && ch.id === wCh.id && white !== undefined) return { ...ch, value: white }
                            return ch
                          }),
                        }
                      : f
                  )
                )
              }}
              variant={colorVariant}
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

        const intensityVariant = block.variant === 'minimal' ? 'vertical' : block.variant === 'compact' ? 'compact' : 'default'

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
                            intensityChannel && ch.id === intensityChannel.id ? { ...ch, value } : ch
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
        const fixture = fixtures.find((f) => f.id === block.fixtureId)
        if (!fixture) return null

        const panCh = fixture.channels.find((ch) => ch.name.toLowerCase().includes('pan'))
        const tiltCh = fixture.channels.find((ch) => ch.name.toLowerCase().includes('tilt'))

        const positionVariant = block.variant === 'compact' ? 'compact' : 'default'

        return (
          <div key={block.id}>
            <PositionControlBlock
              title={block.title}
              panValue={panCh?.value ?? 127}
              tiltValue={tiltCh?.value ?? 127}
              onPanChange={(value) => {
                setFixtures((prev) =>
                  prev.map((f) =>
                    f.id === fixture.id
                      ? {
                          ...f,
                          channels: f.channels.map((ch) =>
                            panCh && ch.id === panCh.id ? { ...ch, value } : ch
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
                            tiltCh && ch.id === tiltCh.id ? { ...ch, value } : ch
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
        const buttons = effects.map((e) => ({
          id: e.id,
          label: e.name,
          isActive: e.isActive,
          icon: <Lightning weight="fill" />,
          color: 'accent' as const,
        }))

        const buttonPadVariant = block.variant === 'compact' ? 'compact' : 'default'

        return (
          <div key={block.id}>
            <ButtonPadBlock
              title={block.title}
              items={buttons}
              onItemClick={(id) => {
                setEffects((prev) =>
                  (prev || []).map((e) => (e.id === id ? { ...e, isActive: !e.isActive } : e))
                )
              }}
              variant={buttonPadVariant}
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
          <h2 className="text-2xl font-bold">Vlastní rozvržení ovládacích prvků</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Vytvořte si vlastní kontrolní panel s vybranými ovládacími bloky
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant={editMode ? 'default' : 'outline'} size="sm" onClick={() => setEditMode(!editMode)}>
            <Gear className="mr-2" size={16} />
            {editMode ? 'Hotovo' : 'Upravit'}
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="mr-2" size={16} />
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
            setNewBlock({ type: 'toggle', title: '', variant: 'default' })
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedBlock ? 'Upravit blok' : 'Přidat nový blok'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div>
                <Label>Název bloku</Label>
                <Input
                  value={newBlock.title ?? ''}
                  onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                  placeholder="Např. Hlavní světla"
                />
              </div>

              <div>
                <Label>Typ bloku</Label>
                <Select value={newBlock.type} onValueChange={(value) => setNewBlock({ ...newBlock, type: value as BlockType })}>
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
                        <DotsSixVertical size={16} />
                        Tlačítkový panel
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Varianta zobrazení</Label>
                <Select value={newBlock.variant ?? 'default'} onValueChange={(value) => setNewBlock({ ...newBlock, variant: value as BlockVariant })}>
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
                  <Select value={newBlock.effectId} onValueChange={(value) => setNewBlock({ ...newBlock, effectId: value })}>
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

              {(newBlock.type === 'channel' || newBlock.type === 'color' || newBlock.type === 'intensity' || newBlock.type === 'position') && (
                <div>
                  <Label>Světlo / Fixture</Label>
                  <Select value={newBlock.fixtureId} onValueChange={(value) => setNewBlock({ ...newBlock, fixtureId: value })}>
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
                  <Select value={newBlock.channelName} onValueChange={(value) => setNewBlock({ ...newBlock, channelName: value })}>
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
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false)
                  setSelectedBlock(null)
                  setNewBlock({ type: 'toggle', title: '', variant: 'default' })
                }}>
                  Zrušit
                </Button>
                <Button onClick={updateBlock}>Uložit změny</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Zrušit
                </Button>
                <Button onClick={addBlock}>Přidat blok</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!controlBlocks || controlBlocks.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center">
            <Plus className="w-12 h-12 text-muted-foreground mb-4" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Žádné bloky</h3>
              <p className="text-muted-foreground mb-6">
                Začněte přidáním ovládacích bloků pro vytvoření vlastního panelu
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2" size={16} />
                Přidat první blok
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(controlBlocks || []).map((block, index) => (
            <Card key={block.id} className="p-4 relative">
              {editMode && (
                <div className="absolute top-2 right-2 flex gap-1 z-10">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(block)}>
                    <PencilSimple />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => moveBlock(index, 'up')}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={index === controlBlocks.length - 1}
                    onClick={() => moveBlock(index, 'down')}
                  >
                    <ArrowDown />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteBlock(block.id)}>
                    <Trash />
                  </Button>
                </div>
              )}
              {renderBlock(block)}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
