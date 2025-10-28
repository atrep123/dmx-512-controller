import React, { useState } from 'react'


import { Dialog, DialogContent, DialogHeader, D
import { Label } from '@/components/ui/labe

  Trash,
  ArrowUp,
  Faders,
  Lightning,

  Plus,
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
  servos: Servo[]
  effects: Effect[]
}
export default function 
  setFixtures,
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
      return

      id: `block-${Date.now()}`,
      type: (newBlo
      motorId:
      effectId: newBloc
    

    setControlBlocks(prev => ([...(prev 
    setIsDialogOpen(false)
  }
  const updateBlock = (
      toast.error('Zadejte název b
    }
   

              title: newBl
              fixtureId: n
              servoId: newBlock.servoId 
            
     


    setNewBlock({ type: 'toggle'
    toast.success('Blok uprav

    setControlBlocks(prev => (prev |
  }
  const moveBlock = (index: numb
      const list = [...(prev || []
      if (targetIndex < 0 || targetIndex
      return list
  }
  con

    if (draggedIndex === null || draggedIndex === index)
    setControlBlocks(prev => {
      const dragged = list
      list.splice(index, 0, drag
   

  const handleDragEnd = () =>
  const handleEditBlock = (block: ControlBlo
    setNewBlock({
      type: 
     

      variant: block.variant
    })
  }
  const rende
    const effect = 
    const toggleEffect = () => {
      setEffects(prev => prev.map(e => (e.id === effect.

      if (!fixture) return
        prev.map(f =>
            ? {
                channels: f.channels.map(ch =>
                ),
            :
      )

     

      setFixtures(prev =>
          f.id === fixture.id
                ...f,
                  const n = ch.na
   

                }),
            : f
      )


          key={block.id}
          onDragStart={() => h
          onDragEnd={handleDragEnd}
        >
            <div className="flex items-center gap-2">
              <div>
                <
      
   

            </div>

              </Button>
                varian
                onClick={() => moveBlock(index, 'up')}

              </Button>
                variant="ghost"
                onClick={() => moveBlock
              >
              </Button>
                <
      
        </Card>
   

        return (

              active={effect?.isActive || false}
              icon={<Lightn
              eff
              onEffectCha
          </div>

        if (!fixture) return 
          ch.name.toLowerCase
        return (
            <ChannelSliderBlock
              value={channel?
              variant={getV
      
      }
   

        const wCh = fixture.channels.find(ch => ch.name.toLower
          <div key={block.id}>
              red={rCh?.value ?? 0}

              onColorChange={c =
              variant={ge
          </div>
     

        const intensityChannel = fixture.channels.find(ch => {
          return n.include
        return (
            <Intensit
              value={intensit
              v
          </div>
      }
      case 'position': {
        const panC
        return 
            <Po
         
       
     

      }
      case 'button-pad': {
          const color = i % 2 === 0 ? 'accent' : '
            id: e.id,

          }

          <div key={block.id}
              t
              activeI
                setEffects(prev => prev.map(e =>
              columns={3}
            />
        )

        return null
  }
  return (
      <div clas
          <h2 c
        <
       
     

              <Butt
              
             
                <Plus cl
              </But

              <DialogHeader>
              </DialogHeader>
              <ScrollArea className="max-h-[500px]">
         
                    <Input
                      onChange={e => setNewBlock({ ..
                    />

                    <Label>Typ bloku</Label>
                      value={(newBlock.type as string) ?? 'to
                      disabled={!!selectedBlock}
                      <SelectTrigger>
                      </SelectTrigger>
                        <SelectItem value="toggle">
                            <Lightning size={16} />
                          </div>
                    
                    
                  
                        <SelectItem value="color">
                            <Palette size={16} />
                          </div>
                       
                     
                          </div
                        <
                            <Target size={16} />
                          </div>
               
                            <Fire siz
                       
                     
                  </div>
                  <div>
                    <Select
                      onValueChange={value => setNewBlock({ ...newBlo
               
                      </SelectTrigger>
                       
                        <SelectItem value="minimal">Minimální</SelectItem>
                      </SelectConte
                  </div
                  
                
               
       
     

                         
                    
                
                    </div>

                    newBlock.type
                    newBlock.type === 'position'
                      <Label>Světlo</
                        value={newBlock.fixtureI
                      >
                          <SelectValue 
                        <Sele
                            <SelectItem key={fixture.id} va
              
                
         

                    <di
                      <Input
                        onChange={e => setNewBlock(
                      />
         
                
                      {selecte
                    <Button
                      onClick={()
                        setSelectedBlock(
                      }}
                      Zrušit
              
              </
         
      <

          <Lightbulb 
          <p className="text-sm t
      ) : (
          {(controlBlocks || []).map((block, index) => renderBlock(block, index))}
      )}
  )





























































































































































































































































































