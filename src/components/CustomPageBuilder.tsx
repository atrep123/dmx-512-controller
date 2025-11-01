import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Trash,
  ArrowUp,
  ArrowDown,
  PencilSimple,
  Plus,
import {
  ColorP
  ButtonPadBlock,
  IntensityFaderBlo
import { Fixture, St
type BlockType = 

  id: string
  title: string
  motorId?: string

  variant?: BlockVariant


  servos: Servo[]
  setFixture
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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<ControlBlock | null>(null)
  const [newBlock, setNewBlock] = useState<Partial<ControlBlock>>({
    type: 'toggle',
    title: '',
    variant: 'default',
  })

  const addBlock = () => {
    if (!newBlock.title || !newBlock.type) {
      toast.error('Vyplňte všechny povinné údaje')
      return
    }

    const block: ControlBlock = {
      id: Date.now().toString(),
      type: newBlock.type as BlockType,
      title: newBlock.title,
      fixtureId: newBlock.fixtureId,
      motorId: newBlock.motorId,
      servoId: newBlock.servoId,
      effectId: newBlock.effectId,
      channelName: newBlock.channelName,
      variant: (newBlock.variant as BlockVariant) ?? 'default',
    }

    setControlBlocks((prev) => [...(prev ?? []), block])
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
      (prev ?? []).map((block) =>
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
    setControlBlocks((prev) => (prev ?? []).filter((block) => block.id !== id))
  const openEditDialog = (block: Co
   

      motorId: block.motorId,
      effectId: block.effectId,
      variant: block.variant,
    setIsDialogOpen(true)

    sw
        const effect = effects.find


      
              label={b
      
   

            />
        )

        const effect = 


          <div key={block.id}
              label={block.ti
              onChange={(value)
                  prev.map((e) => (e.
              }}
      
        )



        if (!channel) ret
        const channelV
        return (
            <ChannelSliderBlock

                setFixtures((prev) =>

                
                            ch
                        }
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

      case 'intensity': {
        const effect = effects.find((e) => e.id === block.effectId)
        if (!effect) return null

        const intensityVariant = block.variant === 'minimal' ? 'vertical' : block.variant === 'compact' ? 'compact' : 'default'

        return (
          <div key={block.id}>
            <IntensityFaderBlock
              label={block.title}
              value={effect.intensity}
              onChange={(value) => {
                setEffects((prev) =>
                  prev.map((e) => (e.id === effect.id ? { ...e, intensity: value } : e))
                )
              }}
              variant={intensityVariant}
            />
          </div>
        )
      }

      case 'channel': {
        const fixture = fixtures.find((f) => f.id === block.fixtureId)
        if (!fixture || !block.channelName) return null

        const channel = fixture.channels.find((ch) => ch.name === block.channelName)
        if (!channel) return null

        const channelVariant = block.variant === 'minimal' ? 'large' : block.variant === 'compact' ? 'compact' : 'default'

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

        if (!rCh || !gCh || !bCh) return null

        const variant = block.variant ?? 'default'

        return (
          <div key={block.id}>
            <ColorPickerBlock
              label={block.title}
              red={rCh.value}
              green={gCh.value}
              blue={bCh.value}
              white={wCh?.value ?? 0}
              onChange={(r, g, b, w) => {
                setFixtures((prev) =>
                  prev.map((f) =>
                    f.id === fixture.id
                      ? {
                          ...f,
                          channels: f.channels.map((ch) => {
                            if (ch.id === rCh.id) return { ...ch, value: r }
                            if (ch.id === gCh.id) return { ...ch, value: g }
                            if (ch.id === bCh.id) return { ...ch, value: b }
                            if (wCh && ch.id === wCh.id) return { ...ch, value: w ?? 0 }
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

      case 'position': {
        const fixture = fixtures.find((f) => f.id === block.fixtureId)
        if (!fixture) return null

        const panCh = fixture.channels.find((ch) => ch.name.toLowerCase().includes('pan'))
        const tiltCh = fixture.channels.find((ch) => ch.name.toLowerCase().includes('tilt'))

        if (!panCh || !tiltCh) return null

        const variant = block.variant ?? 'default'

        return (
          <div key={block.id}>
            <PositionControlBlock
              label={block.title}
              pan={panCh.value}
              tilt={tiltCh.value}
              onPanChange={(value) => {
                setFixtures((prev) =>
                  prev.map((f) =>
                    f.id === fixture.id
                      ? {
                          ...f,
                          channels: f.channels.map((ch) =>
                            ch.id === panCh.id ? { ...ch, value } : ch
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
                            ch.id === tiltCh.id ? { ...ch, value } : ch
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

      case 'buttonpad': {
        const padEffects = effects.filter((e) => block.effectId?.split(',').includes(e.id))
        if (!padEffects.length) return null

        const variant = block.variant ?? 'default'

        return (
          <div key={block.id}>
            <ButtonPadBlock
              label={block.title}
              buttons={padEffects.map((e) => ({
                id: e.id,
                label: e.name,
                isActive: e.isActive,
              }))}
              onButtonClick={(id) => {
                setEffects((prev) =>
                  prev.map((e) => (e.id === id ? { ...e, isActive: !e.isActive } : e))
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Moje vlastní stránka</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Přizpůsobte si ovládací prvky podle svých potřeb
          </p>
        </div>
        <Button onClick={() => {
          setSelectedBlock(null)
          setNewBlock({ type: 'toggle', title: '', variant: 'default' })
          setIsDialogOpen(true)
        }}>
          <Plus className="mr-2" />
          Přidat blok
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedBlock ? 'Upravit blok' : 'Přidat nový blok'}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div>
                <Label>Název bloku</Label>
                <Input
                  value={newBlock.title || ''}
                  onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                  placeholder="Např. Hlavní světlo"
                />
              </div>

              <div>
                <Label>Typ bloku</Label>
                <Select
                  value={newBlock.type || 'toggle'}
                  onValueChange={(value) => setNewBlock({ ...newBlock, type: value as BlockType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="toggle">Přepínač efektu</SelectItem>
                    <SelectItem value="intensity">Intenzita efektu</SelectItem>
                    <SelectItem value="channel">Ovládání kanálu</SelectItem>
                    <SelectItem value="color">Výběr barvy</SelectItem>
                    <SelectItem value="position">Pozice Pan/Tilt</SelectItem>
                    <SelectItem value="buttonpad">Tlačítkový panel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Varianta zobrazení</Label>
                <Select
                  value={newBlock.variant || 'default'}
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

              {(newBlock.type === 'toggle' || newBlock.type === 'intensity') && (
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

              {(newBlock.type === 'channel' || newBlock.type === 'color' || newBlock.type === 'position') && (
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

              {newBlock.type === 'channel' && newBlock.fixtureId && (
                <div>
                  <Label>Kanál</Label>
                  <Select
                    value={newBlock.channelName || ''}
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
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false)
                  setSelectedBlock(null)
                  setNewBlock({ type: 'toggle', title: '', variant: 'default' })
                }}>
                  Zrušit
                </Button>
                <Button onClick={updateBlock}>
                  Uložit změny
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false)
                  setNewBlock({ type: 'toggle', title: '', variant: 'default' })
                }}>
                  Zrušit
                </Button>
                <Button onClick={addBlock}>
                  Přidat blok
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!controlBlocks || controlBlocks.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center text-center">
            <h3 className="text-lg font-semibold mb-2">Žádné bloky</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Začněte přidáním prvního ovládacího bloku
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              Přidat první blok
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {controlBlocks.map((block, index) => (
            <Card key={block.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-sm">{block.title}</h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(block)}
                  >
                    <PencilSimple />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveBlock(index, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveBlock(index, 'down')}
                    disabled={index === controlBlocks.length - 1}
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteBlock(block.id)}
                  >
                    <Trash />
                  </Button>
                </div>
              </div>
              {renderBlock(block)}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
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

        if (!rCh || !gCh || !bCh) return null

        const colorVariant = (block.variant === 'minimal' || block.variant === 'compact') ? 'compact' : 'default'

        return (
          <div key={block.id}>
            <ColorPickerBlock
              red={rCh.value}
              green={gCh.value}
              blue={bCh.value}
              white={wCh?.value ?? 0}
              hasWhite={!!wCh}
              onColorChange={(color) => {
                setFixtures((prev) =>
                  prev.map((f) =>
                    f.id === fixture.id
                      ? {
                          ...f,
                          channels: f.channels.map((ch) => {
                            if (ch.id === rCh.id) return { ...ch, value: color.red }
                            if (ch.id === gCh.id) return { ...ch, value: color.green }
                            if (ch.id === bCh.id) return { ...ch, value: color.blue }
                            if (wCh && ch.id === wCh.id) return { ...ch, value: color.white ?? 0 }
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

      case 'position': {
        const fixture = fixtures.find((f) => f.id === block.fixtureId)
        if (!fixture) return null

        const panCh = fixture.channels.find((ch) => ch.name.toLowerCase().includes('pan'))
        const tiltCh = fixture.channels.find((ch) => ch.name.toLowerCase().includes('tilt'))

        if (!panCh || !tiltCh) return null

        const positionVariant = (block.variant === 'minimal' || block.variant === 'compact') ? 'compact' : 'default'

        return (
          <div key={block.id}>
            <PositionControlBlock
              title={block.title}
              panValue={panCh.value}
              tiltValue={tiltCh.value}
              onPanChange={(value) => {
                setFixtures((prev) =>
                  prev.map((f) =>
                    f.id === fixture.id
                      ? {
                          ...f,
                          channels: f.channels.map((ch) =>
                            ch.id === panCh.id ? { ...ch, value } : ch
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
                            ch.id === tiltCh.id ? { ...ch, value } : ch
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

      case 'buttonpad': {
        const padEffects = effects.filter((e) => block.effectId?.split(',').includes(e.id))
        if (!padEffects.length) return null

        const buttonPadVariant = (block.variant === 'minimal' || block.variant === 'compact') ? 'compact' : 'default'

        return (
          <div key={block.id}>
            <ButtonPadBlock
              title={block.title}
              items={padEffects.map((e) => ({
                id: e.id,
                label: e.name,
                isActive: e.isActive,
              }))}
              onItemClick={(id) => {
                setEffects((prev) =>
                  prev.map((e) => (e.id === id ? { ...e, isActive: !e.isActive } : e))
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Moje vlastní stránka</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Přizpůsobte si ovládací prvky podle svých potřeb
          </p>
        </div>
        <Button onClick={() => {
          setSelectedBlock(null)
          setNewBlock({ type: 'toggle', title: '', variant: 'default' })
          setIsDialogOpen(true)
        }}>
          <Plus className="mr-2" />
          Přidat blok
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedBlock ? 'Upravit blok' : 'Přidat nový blok'}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div>
                <Label>Název bloku</Label>
                <Input
                  value={newBlock.title || ''}
                  onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                  placeholder="Např. Hlavní světlo"
                />
              </div>

              <div>
                <Label>Typ bloku</Label>
                <Select
                  value={newBlock.type || 'toggle'}
                  onValueChange={(value) => setNewBlock({ ...newBlock, type: value as BlockType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="toggle">Přepínač efektu</SelectItem>
                    <SelectItem value="intensity">Intenzita efektu</SelectItem>
                    <SelectItem value="channel">Ovládání kanálu</SelectItem>
                    <SelectItem value="color">Výběr barvy</SelectItem>
                    <SelectItem value="position">Pozice Pan/Tilt</SelectItem>
                    <SelectItem value="buttonpad">Tlačítkový panel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Varianta zobrazení</Label>
                <Select
                  value={newBlock.variant || 'default'}
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

              {(newBlock.type === 'toggle' || newBlock.type === 'intensity') && (
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

              {(newBlock.type === 'channel' || newBlock.type === 'color' || newBlock.type === 'position') && (
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

              {newBlock.type === 'channel' && newBlock.fixtureId && (
                <div>
                  <Label>Kanál</Label>
                  <Select
                    value={newBlock.channelName || ''}
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
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false)
                  setSelectedBlock(null)
                  setNewBlock({ type: 'toggle', title: '', variant: 'default' })
                }}>
                  Zrušit
                </Button>
                <Button onClick={updateBlock}>
                  Uložit změny
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false)
                  setNewBlock({ type: 'toggle', title: '', variant: 'default' })
                }}>
                  Zrušit
                </Button>
                <Button onClick={addBlock}>
                  Přidat blok
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!controlBlocks || controlBlocks.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center text-center">
            <h3 className="text-lg font-semibold mb-2">Žádné bloky</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Začněte přidáním prvního ovládacího bloku
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              Přidat první blok
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {controlBlocks.map((block, index) => (
            <Card key={block.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-sm">{block.title}</h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(block)}
                  >
                    <PencilSimple />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveBlock(index, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveBlock(index, 'down')}
                    disabled={index === controlBlocks.length - 1}
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteBlock(block.id)}
                  >
                    <Trash />
                  </Button>
                </div>
              </div>
              {renderBlock(block)}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
