import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, S
import { toast } from 'sonner'
  Trash,
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Trash,
  ArrowUp,
  ArrowDown,
  DotsSixVertical,
  Faders,
  Target,
import {
  Color
  ButtonPa
  IntensityF
import { 
type BlockType = 'toggle' | 'c

  id: string
  title: string
  motorId?: string
  effectId?: stri
  variant?: BlockVarian

  fixtures: Fixture[]
  servos: Servo[]

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

    setControlBlocks((prev) => [...prev, block])
    setIsDialogOpen(false)
    setNewBlock({ type: 'toggle', title: '', variant: 'default' })
    toast.success('Blok přidán')
  }

  const updateBlock = () => {
    if (!selectedBlock) {
      return
    }

    setControlBlocks((prev) =>
      prev.map((b) =>
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
      const [draggedItem] = list.splice(draggedIndex, 1)
      return list


  const openEditDialog = (block: ControlBlock) => {
    setNewBlock({
      type: block.type,
      motorId: block.motorId,
      effectId: block.effectId,
      variant: bl
    se


      return variant
    return 'default'


    switch (block.type) {
        const effect = effects.find((

          <div key={block.id}>
              label={block.t
              onToggle={() => {
                  (prev || []).map((e) => (e
              }}
      


   


          <div key={block.i
              lab
              onChange={(
                  prev.
                      ? {
                          cha
                          ),
                      : f
                )
              variant={variant}
      
      }
   

        const gCh = fixture.channels.find((ch) => ch.name.toLowerC
        const wCh = fixture.chann
        return (
            <ColorPi
     
              white=
   

                      ? {
                          channels: f.chan

                         
                      
                      : f
                )

          </div>
      }
      case 'intensity': {
        if (!fixture) return null
          const n = ch.name.toLowerCase(
        })

          <div key={block.id}>
              lab
              on
                  prev.map((f) 
              
                
         
       

              variant={
          </div>
      }
      case 'position': {
        if (!fixture) return null


          <div key={block.id}>
              title={block.titl
              tiltValue={tiltCh?.
                setFixtures((prev) =>
                    f.id === fixture
                          ...f,
                            ch.id
                        }
                  )
              }}
                setFixtures((prev) =>
                    f.id === fixture.id
                          ..
                         
                        }
                  )
              }}
            />
        )

        const bu
         
       

        })
        return (
            <ButtonPadBlock
              items={buttons}
              onItemClick={(id) => {
                  (prev || []).map((e) => (e.id === id ? { ...e, isActive: !e.isActive } 
              }}

        )

        return null
  }
  return (
      <div className="flex items-cent
          <h2 className="text-2xl fo
            Vlastní rozvržení ovládac
        </div>
          <Button variant={editMode ? 'de
            {editMode ? 'Hotovo' : 'U
          <Button onClick={() => 
            Přidat blok
        </div>

        open={isDialogOpen}
          if (!open) {
            setSelectedBlock(null)
          }
      >
          <DialogHeader>
          </DialogHeader>
          <ScrollArea cla
              <div>
                <In
                 
                

              
                
         
       

                    <Sele
                        <Lightning size={16} />
                      </div>
                    <SelectItem value="channel">
                        <Faders size={16}
                      </div>
          
                        <Palette size={16}

                
                        <Light
                      </div>
                    <SelectItem v
                        <Target size={16} />
                      </div>
                    <SelectItem value
                        <DotsSixV
                      </div>
                  </Selec
              </div>
              <div>
                <Select
                  onValueCha
                  <Select
                  </Selec
                   
                 
                

              
                
         
       

                      {e
                          {effect.name}
                      ))}
                  </Select>
              )}
              {(newBlock.type === 'channel

                
                  <Select
                    onValueChange
                    <SelectTrigge
                    </SelectTrigger>
                      {fixtures.map((fixt
                          {fixture.name
                      ))}
                  </Select>
              )}
              {newBlock.t
                  <Label>DMX Ka
                    value={newBlock.channelName}
                  >
                      <Selec
                    <Sele
                        .
                   
                 
                
                </div>
            </div>

            {selectedBlock ? (
                <Button
                  onClick={() =
                    setSelectedBlock(null)
                  }}
                  Zrušit
                <Button o
            ) : (
                <Bu
                 
                
                >
              
              </
         
      <

          <div className="
          </div>
          <p className="text-muted-foreground mb-6">
          </p>
            <Plus cla
          </Button>
      ) : (
          {(controlBlocks || []).map((block, index) => (
           
          

            >
                {editMode && (
                    <Button
                      variant="gh
                      onClick={
                      <PencilSimple />
                    <Button
                      variant="ghost
                      disabled={index === 0}
                 
                
                      size="sm"
              
                
         
       

              
                   
     
   

        </
    </div>
}
































































































































































































































































































