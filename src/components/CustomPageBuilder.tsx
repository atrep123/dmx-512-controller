import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem,
import { toast } from 'sonner'
import {
  ButtonPadBlock,
  ChannelSliderBlock,
  ToggleButtonBlock,
import {
type BlockType = 't

  id: string
  title: string
  motorId?: string
  effectId?: string
  variant?: BlockVariant


  servos: Servo[]
  setFixtures: (value: Fixture[] | ((prev: Fixture[])

}
export defau
  stepperMotors,
  effects,
  setStepperMotors,
  setEffects,
  const [controlBl
  const [selectedBl
    type: 'toggle',
    variant: 'default',


      return

      id: Date.now().toString()
      title: newB
      motorId: newB
      effectId: newBlock.effectId,
      variant: (newBlock.variant as BlockVariant) ?? 'default',

    setIsDialogOpen(false)
 

    if (!selectedBlock || !newBlock.title |
      retur

      (pr
          
              
              fixtu
            
             
            }
      )

    setSelectedBlock(null)
    toast.success('Blok aktualizován')

    setControl
  }
  co

      title: block.title,
      motorId: block.motorId,
      effectId: block.effectId,
      varian
    s

    setControlBlocks((prev) => {
      const newIndex = direction
      
      blocks[index] = blocks
      return blocks
  }
  const renderBlock = (block: Co
      case 'toggle': {
        if (!effect) return null
        const toggleVariant = block.variant === 'minimal' ? 'mi
     

              active={effect.isActive}
                setEffects
                )
              variant={toggleVar
   

      case 'intensity': {
        if (!effect) return null
        const intensityVariant = block.variant ===
        retu
     

                setEffects((pr
                )
              variant={intensityVaria
          </d
      }
      case 'channel': {
        if (!fixture || !block.channe
        const channel = fixture.channels.fin


          <div key={block.id}>
              label={block.title}
              onChange={(value) => {
             
                 
       
     

                )
              variant={cha
          </div>
      }
   

        const rCh = fixture.channels.fi
        const bCh = fixture.channels.find((ch) => ch.name.toLowerCase().include



          <div key={block.id}>
              red={rCh.valu
              blu
              hasWhite=
                setFixtur
                    f.id === fixt
                          ...
                            i
                            if 
                            return ch
                        }
      
              }}
   


        const fixture = fixtures

        const tiltCh = fixture.channels.find((ch) => ch.name.toLo
        if (!panCh || !tiltCh) return null
      
        return (
            <PositionControlBlock
              panValue={panCh
              onPan
      
   

                          ),
                      : f
                )
              onTiltChange={(value) => {
                  prev.map((f) =

                          channels: f.channels.map((ch) =>

                
                )
              variant={positio
          </div>
      }
      case 'buttonpad': {
        if (!padEffects.length) retu
        const buttonPadVariant = (block.variant === 'minimal' || block.variant === 'compact')
        return (
            <But
              items={padEffects.map((
              
              })
         
       

          </div>
      }
      default:



        <div>
          <p className="text-s
          </p>
        <Button onClick={() => {
          setNewBlock({ type: 'toggle'
        }}>
          Přidat blok
      </div>
      <Dialog ope
          <Dialo
              {selectedBlock ? 'Upravit 
          </Di
          <Scrol
         
       

                />

                <Label>Typ bloku</Label>

                >
                    <SelectValue 

                    <SelectItem value="intensity">Intenzita efektu</SelectItem>

                
                </Select>

                <Label>Varianta z
                  value={newBlock.v
                >
                    <SelectValue />
                  <SelectContent>
                    <SelectItem value="
                  </Selec
              </div>
              {(newBlock.type === 'toggle' || newBlock.typ
                  <Label>Efekt</Label>
                    value={n
                  >
                      <Se
                   
                 
                
                    </SelectContent>
              

         
       

                    <
                    </SelectTrigger>
                      {fixtures.m

                      ))}
                  </Select>
              )}
              {newBlock.type === 'channel' && newBlock.fixtureId && (

                    value={newBlock.channelNa

                      <SelectValue placeholder="Vyberte kanál" />

                
                          <Sel
                          </S
                    </SelectC
                </div>
            </div>

            {selectedBlock ? (
                <Button variant="outline"
                  setSelectedBlock(nu
                }}>
                </Button>
                  Uložit 
              </>
              <>
                  setIsDialogOpen(false)
                }}>
                </Button>
                  Přidat blok
              </>
          </DialogFooter>
      </Dialog>
      {!controlBlocks || 
          <div clas
            <p cl
            </p>
              Přidat první blok
          </di
      ) : (
         
       

                    vari
                    onClick={() => openEditDialog(block)}
                    <PencilSimple

                    size="sm"
                    disabled={index === 0}

                  <Button

                    disabled={index === controlBlocks.length - 1}

                
                    size="sm"
                  >
                  </Button>
              </div>
            </Card>
        </div>
    </div>
}






































































































































































































































































































