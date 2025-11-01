import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Fixture, Effect, Universe, StepperMotor, Servo } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Lightbulb, Lightning, Play, Pause, Faders, NumberSquareOne, NumberSquareTwo, NumberSquareThree, NumberSquareFour, NumberSquareFive, NumberSquareSix } from '@phosphor-icons/react'
import JoystickControl from '@/components/JoystickControl'

interface LiveControlViewProps {
    fixtures: Fixture[]
    setFixtures: (updater: (fixtures: Fixture[]) => Fixture[]) => void
    effects: Effect[]
    setEffects: (updater: (effects: Effect[]) => Effect[]) => void
    universes: Universe[]
    stepperMotors: StepperMotor[]
    setStepperMotors: (updater: (motors: StepperMotor[]) => StepperMotor[]) => void
    servos: Servo[]
    setServos: (updater: (servos: Servo[]) => Servo[]) => void
}

export default function LiveControlView({
    fixtures,
    setFixtures,
    effects,
    setEffects,
    universes,
    stepperMotors,
    setStepperMotors,
    servos,
    setServos,
}: LiveControlViewProps) {
    const [effectSlots, setEffectSlots] = useKV<(string | null)[]>('effect-slots', [null, null, null, null, null, null])
    const [activeSlot, setActiveSlot] = useState<number | null>(null)

    const updateChannelValue = (fixtureId: string, channelId: string, value: number) => {
        setFixtures((currentFixtures) =>
            currentFixtures.map((fixture) =>
                fixture.id === fixtureId
                    ? {
                          ...fixture,
                          channels: fixture.channels.map((channel) =>
                              channel.id === channelId ? { ...channel, value } : channel
                          ),
                      }
                    : fixture
            )
        )
    }

    const toggleEffect = (effectId: string) => {
        setEffects((current) =>
            current.map((effect) =>
                effect.id === effectId ? { ...effect, isActive: !effect.isActive } : effect
            )
        )
    }

    const activateSlot = (slotIndex: number) => {
        const slots = effectSlots || [null, null, null, null, null, null]
        const effectId = slots[slotIndex]
        if (!effectId) return

        setEffects((current) =>
            current.map((effect) => {
                if (effect.id === effectId) {
                    return { ...effect, isActive: true }
                }
                const slotEffectIds = slots.filter(id => id !== null)
                if (slotEffectIds.includes(effect.id) && effect.id !== effectId) {
                    return { ...effect, isActive: false }
                }
                return effect
            })
        )
        setActiveSlot(slotIndex)
    }

    const assignEffectToSlot = (slotIndex: number, effectId: string | null) => {
        setEffectSlots((current) => {
            const newSlots = [...(current || [null, null, null, null, null, null])]
            newSlots[slotIndex] = effectId
            return newSlots
        })
    }

    const updateEffectSpeed = (effectId: string, speed: number) => {
        setEffects((current) =>
            current.map((effect) => (effect.id === effectId ? { ...effect, speed } : effect))
        )
    }

    const updateEffectIntensity = (effectId: string, intensity: number) => {
        setEffects((current) =>
            current.map((effect) => (effect.id === effectId ? { ...effect, intensity } : effect))
        )
    }

    const activeEffects = effects.filter(e => e.isActive)
    const hasActiveContent = fixtures.length > 0 || activeEffects.length > 0
    const slots = effectSlots || [null, null, null, null, null, null]
    
    const slotIcons = [
        NumberSquareOne,
        NumberSquareTwo,
        NumberSquareThree,
        NumberSquareFour,
        NumberSquareFive,
        NumberSquareSix,
    ]

    if (!hasActiveContent) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                    <Faders size={48} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nic k ovládání</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                    Přidejte světla v záložce Nastavení nebo vytvořte efekty v záložce Efekty
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Lightning size={20} className="text-accent" weight="fill" />
                    <h2 className="text-lg font-semibold">Rychlé efekty</h2>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                    {slots.map((effectId, index) => {
                        const Icon = slotIcons[index]
                        const effect = effectId ? effects.find(e => e.id === effectId) : null
                        const isActive = activeSlot === index && effect?.isActive

                        return (
                            <Button
                                key={index}
                                onClick={() => activateSlot(index)}
                                disabled={!effectId}
                                variant={isActive ? "default" : "outline"}
                                size="lg"
                                className="flex flex-col items-center gap-2 h-auto py-4"
                            >
                                <Icon size={32} weight={isActive ? "fill" : "regular"} />
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-semibold">
                                        {effect ? effect.name : `Pozice ${index + 1}`}
                                    </span>
                                    {!effect && (
                                        <span className="text-xs text-muted-foreground">Nepřiřazeno</span>
                                    )}
                                </div>
                            </Button>
                        )
                    })}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-2">Přiřadit efekty na tlačítka:</p>
                    <div className="grid gap-2">
                        {slots.map((effectId, index) => {
                            const Icon = slotIcons[index]
                            const effect = effectId ? effects.find(e => e.id === effectId) : null

                            return (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 min-w-[100px]">
                                        <Icon size={20} />
                                        <span className="text-sm font-medium">Pozice {index + 1}</span>
                                    </div>
                                    <select
                                        value={effectId || ''}
                                        onChange={(e) => assignEffectToSlot(index, e.target.value || null)}
                                        className="flex-1 h-9 px-3 py-1 rounded-md border border-input bg-background text-sm"
                                    >
                                        <option value="">Žádný efekt</option>
                                        {effects.map((eff) => (
                                            <option key={eff.id} value={eff.id}>
                                                {eff.name} ({eff.type})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </Card>

            <JoystickControl
                fixtures={fixtures}
                stepperMotors={stepperMotors}
                servos={servos}
                setFixtures={setFixtures}
                setStepperMotors={setStepperMotors}
                setServos={setServos}
            />

            {activeEffects.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Lightning size={20} className="text-accent" />
                        <h2 className="text-lg font-semibold">Aktivní efekty</h2>
                        <Badge variant="secondary" className="ml-auto">{activeEffects.length}</Badge>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {activeEffects.map((effect) => (
                            <Card key={effect.id} className="p-4 ring-2 ring-accent">
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold">{effect.name}</h3>
                                            <div className="flex gap-2 flex-wrap mt-1">
                                                <Badge variant="secondary" className="text-xs">{effect.type}</Badge>
                                                <Badge variant="outline" className="text-xs">{effect.fixtureIds.length} světel</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {effect.type !== 'block-program' && (
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <label className="text-muted-foreground">Rychlost</label>
                                                    <span className="font-mono text-primary font-semibold text-xs">
                                                        {effect.speed}%
                                                    </span>
                                                </div>
                                                <Slider
                                                    value={[effect.speed]}
                                                    onValueChange={(values) =>
                                                        updateEffectSpeed(effect.id, values[0])
                                                    }
                                                    max={100}
                                                    step={1}
                                                    className="cursor-pointer"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <label className="text-muted-foreground">Intenzita</label>
                                                    <span className="font-mono text-primary font-semibold text-xs">
                                                        {effect.intensity}%
                                                    </span>
                                                </div>
                                                <Slider
                                                    value={[effect.intensity]}
                                                    onValueChange={(values) =>
                                                        updateEffectIntensity(effect.id, values[0])
                                                    }
                                                    max={100}
                                                    step={1}
                                                    className="cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => toggleEffect(effect.id)}
                                        variant="default"
                                        size="sm"
                                        className="w-full gap-2"
                                    >
                                        <Pause weight="fill" />
                                        Zastavit
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {activeEffects.length > 0 && fixtures.length > 0 && (
                <Separator />
            )}

            {fixtures.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Lightbulb size={20} className="text-primary" />
                        <h2 className="text-lg font-semibold">Ovládání světel</h2>
                        <Badge variant="secondary" className="ml-auto">{fixtures.length}</Badge>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {fixtures.map((fixture) => {
                            const universe = universes.find((u) => u.id === fixture.universeId)
                            const isAffectedByEffect = activeEffects.some(effect => 
                                effect.fixtureIds.includes(fixture.id)
                            )
                            
                            return (
                                <Card 
                                    key={fixture.id} 
                                    className={`p-4 ${isAffectedByEffect ? 'border-accent/50' : ''}`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-base">{fixture.name}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {universe?.name || 'Universe'}
                                            </p>
                                        </div>
                                        <div className="flex gap-1 items-center">
                                            <Badge variant="outline" className="text-xs">
                                                @{fixture.dmxAddress}
                                            </Badge>
                                            {isAffectedByEffect && (
                                                <Badge variant="secondary" className="text-xs gap-1">
                                                    <Lightning size={10} />
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {fixture.channels.map((channel) => (
                                            <div key={channel.id} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <label className="text-muted-foreground text-xs">
                                                        Ch {channel.number}: {channel.name}
                                                    </label>
                                                    <span className="font-mono text-primary font-semibold text-xs">
                                                        {channel.value}
                                                    </span>
                                                </div>
                                                <Slider
                                                    value={[channel.value]}
                                                    onValueChange={(values) =>
                                                        updateChannelValue(fixture.id, channel.id, values[0])
                                                    }
                                                    max={255}
                                                    step={1}
                                                    className="cursor-pointer"
                                                    disabled={isAffectedByEffect}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {isAffectedByEffect && (
                                        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                                            <Lightning size={12} />
                                            Ovládáno efektem
                                        </p>
                                    )}
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
