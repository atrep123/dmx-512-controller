import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/labe
import { Select, SelectContent, SelectItem, Sel
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
  ArrowUp,
import { ScrollArea } from '@/components/ui/scroll-area'
  Faders
  Trash,
  Palette,
  ArrowDown,
  PencilSimple,
  Faders,
import {
  Lightning,
  ToggleBu
  Lightbulb,
  Inten
  PencilSimple,

} from '@phosphor-icons/react'

  ChannelSliderBlock,
  ColorPickerBlock,
  ToggleButtonBlock,
  motorId?: strin
  PositionControlBlock,
  IntensityFaderBlock,
} from '@/components/controls'
import { Fixture, StepperMotor, Servo, Effect } from '@/lib/types'

type BlockType = 'toggle' | 'channel' | 'color' | 'intensity' | 'position' | 'button-pad'
type BlockVariant = 'default' | 'compact' | 'minimal'

interface ControlBlock {
  setEffects
  type: BlockType
  title: string
  fixtureId?: string
  motorId?: string
  servoId?: string
  effectId?: string
  channelName?: string
}: CustomPageBuilderProp
}

interface CustomPageBuilderProps {
  const [newBlock, se
  stepperMotors: StepperMotor[]
    variant: 'def
  effects: Effect[]
  setFixtures: (value: Fixture[] | ((prev: Fixture[]) => Fixture[])) => void
  setStepperMotors: (value: StepperMotor[] | ((prev: StepperMotor[]) => StepperMotor[])) => void
  setServos: (value: Servo[] | ((prev: Servo[]) => Servo[])) => void
  setEffects: (value: Effect[] | ((prev: Effect[]) => Effect[])) => void
 

export default function CustomPageBuilder({
  fixtures,
      servoId: n
  servos,
      vari
  setFixtures,
  setStepperMotors,
  setServos,
    toast.suc
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
    setIsDia
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

    setControlBlocks((prev) => [...prev, block])
    setIsDialogOpen(false)
              label={block.title}
              onChange={(value) 
   

                          cha
                         
            
     

          </div>
      }
      case 'color': {
        if (!
        const rCh =
        const bCh = fixture.channels.find((ch) 

          <div key={block.id} className=
            <ColorPickerBlock
              green={gCh?.value ?? 0}
              white={wCh?.value ?? 0}
                setFixtures((prev) =>
             
             
       
     
                          
                        }
                  )
              }}
   


        const fixture = fixtures.find((f) => f.id === block.fix

   

        const intensityVariant: 'default' | 'vertical' | 'compact'
        return (
            <IntensityFaderBlock
              value={intensityChannel?.value ?? 0}
                setFixtures((prev) =>
      
                          ...f,
                            intensityChannel &&
                        }
                  )
      
   


        const fixture = fix

        const tiltCh = 
        return (
            <PositionControlBlock
              panValue={panCh
              onPanChange={(v
                  prev.map((f) 
                      ? {
                          channels: f.chan
      
                      : f
   

                  prev.map((f) =>
                      ? {

                         
                      
                )
              variant={variant =

      }
          <div key={block.id}>
          id: e.id,
          icon: <Lightning weight
        }))
        return (
            <ButtonPadBlock
              items={buttons}
                s
                
              variant={variant 
          </di
      }
      def
    }

    <div className="spa
        <div>
          <p className="text-sm text-muted-foreground mt-1">
          </p>

            <Gea
          </Button>
            <Plus className="mr
          </Button>
      </div>
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setNewBlock({ type: 'toggle
        }}
        <DialogContent classNam
            <DialogTitle>{selectedBlock ? 'Upravit blok' :
          <ScrollArea className="max-h-[60vh] pr-4">
              <div>
                <Input
                  onChang
                />

                
                  <SelectTrigge
              
                
         
       

                     
                      </div>
                    <SelectItem v

                      </div>
                    <SelectItem value="intensity">
                        <Lightbulb size={16} />
                      </div>

                
                      </div>
            <ColorPickerBlock
              label={block.title}
              red={rCh?.value ?? 0}
              green={gCh?.value ?? 0}
              blue={bCh?.value ?? 0}
              white={wCh?.value ?? 0}
              onColorChange={(r, g, b, w) => {
                setFixtures((prev) =>
                  prev.map((f) =>
                    f.id === fixture.id
                      ? {
                          ...f,
                          channels: f.channels.map((ch) => {
                            if (rCh && ch.id === rCh.id) return { ...ch, value: r }
                            if (gCh && ch.id === gCh.id) return { ...ch, value: g }
                            if (bCh && ch.id === bCh.id) return { ...ch, value: b }
                            if (wCh && ch.id === wCh.id) return { ...ch, value: w }
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
              variant={variant}
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



                <Label>Typ bloku</Label>
                <Select value={newBlock.type} onValueChange={(value) => setNewBlock({ ...newBlock, type: value as BlockType })}>
                  <SelectTrigger>

                  </SelectTrigger>

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

                </Select>


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

                    <SelectContent>

                        <SelectItem key={effect.id} value={effect.id}>

                        </SelectItem>

                    </SelectContent>

                </div>


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

                    </SelectContent>
                  </Select>
                </div>


              {newBlock.type === 'channel' && newBlock.fixtureId && (
                <div>
                  <Label>DMX Kanál</Label>
                  <Select value={newBlock.channelName} onValueChange={(value) => setNewBlock({ ...newBlock, channelName: value })}>
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
                <Button onClick={updateBlock}>Uložit změny</Button>
              </>

              <>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Zrušit

                <Button onClick={addBlock}>Přidat blok</Button>

            )}

        </DialogContent>



        <Card className="p-12 text-center">

            <Plus className="w-12 h-12 text-muted-foreground" />

              <h3 className="text-lg font-semibold mb-2">Žádné bloky</h3>
              <p className="text-muted-foreground mb-6">
                Začněte přidáním ovládacích bloků pro vytvoření vlastního panelu

              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2" size={16} />
                Přidat první blok
              </Button>
            </div>

        </Card>

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

                    <ArrowUp />

                  <Button
                    variant="ghost"
                    size="sm"

                    onClick={() => moveBlock(index, 'down')}

                    <ArrowDown />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteBlock(block.id)}>
                    <Trash />
                  </Button>

              )}
              {renderBlock(block)}
            </Card>

        </div>

    </div>

}
