import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/s
  Trash,
  ArrowUp,
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Trash,
  ArrowDown,
  ArrowUp,
  DotsSixVertical,
  Faders,
  Lightbulb,
  PencilSimp
import { t
import {
  Posit
  Color
  ButtonP


type BlockVariant = 'default' 

  title:
  fixtureId?: string
  servoId?: string
  channelName?: strin
}
interface CustomPageBu
  setFixtures: (v
  setStepperMotors: (value: St

  setEffects: (value: Effect[] | ((prev: Effect[]) => Effect[])) =

  fixtures,
  stepperMotors,

  effects,
}: CustomPag
  const [editMo
  const [selectedBlock, 
  const [newBlock, s
    variant: 'defa

    if (!newBlock.t
      return

 

      motorId: newBlock.motorId,
      servoId: newBlo
      variant: (newBlock.variant as BlockVariant) ?? 'default',

    setIsDialogOpen(false)
    toast.success

    if (!selectedBl
      return


          ? {
           
              
              ef
              varia
         
    )
    setIsD
    setNewBlo
  }
  const deleteBlock = (id: string) => {
    toast.success('Blok smazán')

    setControlBlocks((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      ;[list[index], list[targetIndex]] = [list[targetIndex], list[
    })

    

    if (draggedIndex === n
      const list = [...(pr
      list.splice(draggedIndex, 1)
      setDra
    }

    setDraggedIndex(null)

    setSelectedBlock(block)
      type: block.type,
      fixtureId: block.fixtureId,
      servoId: block.servoId,
      channelName: block.channelNa
    })
  }
  const renderBlock = (block: ControlBlock, index: number) => {
    c

        return variant
      return 'default'

      case 'toggle': {
   



          <div key={block.id}>
            
     

          </div>
      }
      case 'channel': {
        const
        )
        return (
            <ChannelSliderBlock
              value={channel?.value ?? 0
                setFixtures((prev) =>
                    f.id === fixture.id
                          ...f,
                            ch.id === channel?.id ? { ...ch, value } : ch
             
                 
       
     


        if (!fixture) retu
        const gCh = fixture.channels.find((ch) => ch.na
        const wCh = fixture.chann
   

              blue={bCh?.value ?? 0}
              hasWhite={!!wCh}
                setFixtures((pre
   

                            if (ch.id === rCh?.id) return { ...ch,
                            if (
                            return c
                        }
                  )
              }}
            />
      


          const n = ch.name.toLowerCase()
        })
   

              value={intensityChannel?.value 
                setFixtures((prev) =>
                    f.id === fix
                          ...f,
                            ch.id === in
                        }
                  )
              }}
            />
      


        const tiltCh = fixture.
        return (
   

              onPanChange={(value) => {
                  prev.map(
                 
                       
                         
                      : f
                )
              onTiltChange={(
                  prev.map((f) 
                      ? {
                          cha
      
                      : f
   

          </div>
      }
      case 'button-pad': {

            id: e.id,
            color: color as 'default' | 'accent' | 'secondary' | 'destructive',
        })
       
            <ButtonPad
     

              }}
            />
        )

        return null
  }
  return 

        <div cla
            <PencilSimple />
          </Button>
            <Plus className="mr-2
          </Button>
      </div>
      <Dialog
        onOpenChange={(open) => {
          if (
            setN
        }
       

          <ScrollArea c
              <div>
                <Input
                  onChange={(e) => setNewBlock({ ...newBlock, title: e.target.va
         

                <Label>Typ blo
                  value={(newBl
                  disabled={!!sel
                  <SelectTrigger>
                  </SelectTrigger>
                    <SelectItem value
                        <Lightnin
                      </div>
                    <Sele
                        <Faders
                      </div>
                    <SelectItem value="color">
                        <Pal
                      </d
                    <Sele
                   
                 
                
                        <Target size={16} />
              
                
         
       

              </div>
              <div>
                <Select
                  onValueChange={(value) => setNewBlock({ ...newBlock, variant: value as B
                  <SelectTrigger>
                  </SelectTrigger>
                
                    <SelectIte
                    <SelectIt
                </Select>

                <div>
                  <Select
                    onValueCha
                    <SelectTrigger>
                    </SelectTrigger>
                      {effects.ma
                          {effect.name}
                      ))}
                  </Select>
              )}
              {(newBlock.type === 'channel' ||
                newBlock.type === 'intensity' ||
                <div>
                  <Select
                    onValueChange={(v
                    <SelectTr
                    </Sel
                      {fi
                   
                 
                
              )}
              
                
         
       

            </div>
          <DialogFooter>
              <>
                  variant="outline"
                    setIsDialogOpen(false)
          
                
                </Button>
              </>
              <>
                  variant="outline"
                    setIsDialogOpen(
                  }}
                  Zrušit
                <Button onClick={addBlo
            )}
        </DialogContent>

        <div className="flex flex-col items-center justify-center py-16 text-cente
            <Lightbulb size=
          <h3 className="
            Přidejte prvn
        </div>
        <div clas
            <div
                <Card
              
                
         
       

                      <D
                    </div>
                      <Button
                        variant="outline"
                
                        }}
                        <Pencil /
                      <Button
                        variant="outline"
                        disabled={index ==
                        <ArrowUp />
                      <Button
                        variant="outlin
                        d
                        <ArrowD
                      <Button
                        variant="destructive"
                      >
                      </Button>
                  </div>
              )}
            </div>
        </div>
    </div>
}
























































































































































































































































































































