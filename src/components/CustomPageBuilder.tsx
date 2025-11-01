import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Label } from '@/components/ui/labe
import { Button } from '@/components/ui/butto
import { Dialog, DialogContent, DialogHeader,
import {
  Lightbulb,
  Palette,
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Gear,
  ArrowUp,
  Faders,
  Palette,
  Target,
  DotsSixVertical,
  Plus,
  Gear,
  Trash,
  ButtonPadBloc
  ArrowUp,
  ArrowDown,
type BlockVariant = 'default' 
import { toast } from 'sonner'
import {
  title: string
  motorId?: string
  effectId?: string
}
interface CustomPageBu
  ButtonPadBlock,
  servos: Servo[]
  setFixtures: (value: Fixture[] | ((prev: Fixture[]) => Fixture[]

}
export default function CustomPageBuilder({

  effects,
  id: string
  setEffects,
  const [contro
  const [isDialogOpe
  const [newBlock,
    title: '',
  })
  const addBlock = () 
  variant: BlockVariant
 

      type: newBlock.type as Block
  fixtures: Fixture[]
      servoId: newBlock.servoId
  servos: Servo[]
    }
    setControlBlocks((prev) => [...(prev || []), block])
    setNewBlock({ type: 'toggle', title: '', variant: 'default' })
  }
  const updateBlock = () => {
}

    setControlBlocks((prev) =>
        blo
  stepperMotors,
         
  effects,
              
              varia
          : 
  setEffects,
    setIsDialogOpen(false)
    setNewBlock({ type: 'toggle', title: '', variant: 'default' })
  }
  const deleteBlock = (id: string) => {
    toast.success('Blok odstraněn')
  const moveBlock = (index: number, direction: 'up' | 'down') => {
      const current
      const ta
      
    

    })

    setSelectedBlock(block)
      return
     

      channelName: block.channelN
    })
  }
  const renderBlock = (block
      case 'toggle': {
        if (!effect) return null
        const toggleVariant = bl
        return (
            <ToggleButtonBlock
              active={effect.isActive}
     

              variant={toggleVariant}
          </div>
    setNewBlock({ type: 'toggle', title: '', variant: 'default' })
    toast.success('Blok přidán')
  }

  const updateBlock = () => {
    if (!selectedBlock || !newBlock.title || !newBlock.type) {
      toast.error('Vyplňte všechny povinné údaje')
      return
    }

    setControlBlocks((prev) =>
      prev.map((block) =>
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
    setControlBlocks((prev) => prev.filter((block) => block.id !== id))
    toast.success('Blok odstraněn')
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    setControlBlocks((prev) => {
      const newBlocks = [...prev]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= newBlocks.length) return prev
      
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
    const variant = block.variant === 'compact' ? 'compact' : block.variant === 'minimal' ? 'minimal' : 'default'

    switch (block.type) {
      case 'toggle': {
        const effect = effects.find((e) => e.id === block.effectId)
        if (!effect) return null

        return (
          <div key={block.id}>
            <ToggleButtonBlock
      case 'intensity': {
              isActive={effect.isActive}
              onToggle={() => {
                setEffects((prev) =>
                  prev.map((e) => (e.id === effect.id ? { ...e, isActive: !e.isActive } : e))
                )
              }}
              variant={variant}
            />
                
        )
       

      case 'channel': {
        const fixture = fixtures.find((f) => f.id === block.fixtureId)
        if (!fixture || !block.channelName) return null

        const channel = fixture.channels.find((ch) => ch.name === block.channelName)
        if (!channel) return null

                
          <div key={block.id}>
            <ChannelSliderBlock
              label={block.title}
              value={channel.value}
              onChange={(value) => {
                setFixtures((prev) =>
                  prev.map((f) =>
                    f.id === fixture.id
                      ? {
                            til
                          channels: f.channels.map((ch) =>
                            ch.id === channel.id ? { ...ch, value } : ch
                          ),
              }}
        return (
                  )
              var
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

          <Butto
          <div key={block.id}>
                        Výběr
                    </SelectItem>
                      <div classNam
                        Intenzita
                    </SelectItem>
                      <div className=
                        Pozice Pan/Tilt
                    </SelectItem>
                      <div classN
                        Tlačítkový pane
                    </Sel
                </Select>

                <Label>Varianta zobrazení</Label>
                  <SelectTrigger>
                  </SelectTrigger>
                    <SelectItem value="default">Výchozí</SelectItem>
                    <SelectItem value
                </Select>

                <div>
                  <
                 
                
                        <Select
              
                
         


                  <Select
                      <SelectValue placeholder="Vyberte světlo" />
                    <SelectConten

                        </SelectItem>
                    </SelectContent>
                </div>


                
                      <SelectV
                    <SelectConte
                        .find((f)
                          <SelectItem key={ch.id} 
                          </SelectIt
                    </SelectContent>
                </div>
            </div>

            {selectedBlock ? (
                <Button variant="outline" onClick={() => {
                  setSelectedBlock(null)
                }}>
                </Button>
              </>
              <>
                 
                
            )}
        </Dial

        <
       

                Začněte 
              <Button onClick={() => setIsDialogOpen(true)}>
                Přidat první blok

        </Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                
                    <PencilSim
                  <Button
                    size="sm"
                    onClick={() => moveBlock
                    <ArrowUp />
                  <Button
                    size="sm"
                    onClick={() =
                    <ArrowDown />
                  <Button
                  </Button>
              )}
            </Card>
        </div>
    </div>
}

































































































              </div>

              <div>



                    <SelectValue />

                  <SelectContent>




































                  </SelectContent>

              </div>





















                    </SelectTrigger>

                      {effects.map((effect) => (

                          {effect.name}

                      ))}

                  </Select>

              )}













                      ))}



              )}









                      {fixtures





                        ))}

                  </Select>

              )}





              <>





                  Zrušit



            ) : (



                </Button>

              </>

          </DialogFooter>

      </Dialog>

      {!controlBlocks || controlBlocks.length === 0 ? (

          <div className="flex flex-col items-center">
            <Plus className="w-12 h-12 text-muted-foreground mb-4" />
            <div>



              </p>





          </div>

      ) : (













                  >

                  </Button>



                    disabled={index === controlBlocks.length - 1}

                  >





                </div>



          ))}

      )}

  )

