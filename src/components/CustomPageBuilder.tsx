import { useState } from 'react'
import { Label } from '@/components/ui/labe
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Trash,
  ArrowUp,
} from '
import 
import {
  ColorPickerBl
  ButtonPa
  IntensityF

type BlockVariant = 'default' | 'compact' | 'minimal'
interface ControlBlock {
  type: BlockType
  fixtur
  servoId?: string
  channelName?: str
}
interface CustomP
  stepperMotors: Steppe
  effects: Effect[]
  setStepperMotors: (value: St


  fixtures,

  setFixtures,
  setServos,
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
    toast.success('Blok odstraněn')
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    setControlBlocks((prev) => {
      const newBlocks = [...(prev ?? [])]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= newBlocks.length) return newBlocks
      
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

              variant={toggleVariant}
            />
          </div>
        )
      }

      case 'intensity': {
        const effect = effects.find((e) => e.id === block.effectId)
        if (!effect) return null

        const intensityVariant = block.variant === 'minimal' ? 'vertical' : block.variant === 'compact' ? 'compact' : 'default'

                
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
                
              variant={channelVariant}
              
                
         
      }

      }
      case 'position': {
        if (!fixture) return null




          <div key={block.id}>

        if (!rCh || !gCh || !bCh) return null

        return (
                    f.id === f
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
                    <SelectConten
                    <SelectValue />
                          {fixture
                  <SelectContent>
                    <SelectItem value="toggle">Přepínač efektu</SelectItem>
                    <SelectItem value="intensity">Intenzita efektu</SelectItem>
                    <SelectItem value="channel">Ovládání kanálu</SelectItem>
                    <SelectItem value="color">Výběr barvy</SelectItem>
                    <SelectItem value="position">Pozice Pan/Tilt</SelectItem>
                    <SelectItem value="buttonpad">Tlačítkový panel</SelectItem>
                  </SelectContent>
                    value



                <Label>Varianta zobrazení</Label>
                <Select
                  value={newBlock.variant || 'default'}
                  onValueChange={(value) => setNewBlock({ ...newBlock, variant: value as BlockVariant })}
                >
                  <SelectTrigger>

                  </SelectTrigger>

                    <SelectItem value="default">Výchozí</SelectItem>
                    <SelectItem value="compact">Kompaktní</SelectItem>
                    <SelectItem value="minimal">Minimální</SelectItem>

                </Select>


              {(newBlock.type === 'toggle' || newBlock.type === 'intensity') && (
                <div>
                  <Label>Efekt</Label>
                  <Select
                    value={newBlock.effectId || ''}
                    onValueChange={(value) => setNewBlock({ ...newBlock, effectId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte efekt" />

                    <SelectContent>

                        <SelectItem key={effect.id} value={effect.id}>

                        </SelectItem>

                    </SelectContent>

                </div>


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

                    </SelectContent>
                  </Select>
                </div>


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

                        .find((f) => f.id === newBlock.fixtureId)
                        ?.channels.map((ch) => (
                          <SelectItem key={ch.id} value={ch.name}>
                            {ch.name}
                          </SelectItem>

                    </SelectContent>

                </div>

            </div>
          </ScrollArea>

          <DialogFooter>
            {selectedBlock ? (

                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false)
                  setSelectedBlock(null)
                  setNewBlock({ type: 'toggle', title: '', variant: 'default' })
                }}>

                </Button>
                <Button onClick={updateBlock}>
                  Uložit změny
                </Button>
              </>

              <>
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false)
                  setNewBlock({ type: 'toggle', title: '', variant: 'default' })
                }}>
                  Zrušit

                <Button onClick={addBlock}>
                  Přidat blok
                </Button>

            )}

        </DialogContent>



        <Card className="p-12">
          <div className="flex flex-col items-center text-center">

            <h3 className="text-lg font-semibold mb-2">Žádné bloky</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Začněte přidáním prvního ovládacího bloku
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              Přidat první blok
            </Button>

        </Card>

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

                    <PencilSimple />

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
              {renderBlock(block)}
            </Card>

        </div>

    </div>

}
