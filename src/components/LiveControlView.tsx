import { useState, useCallback, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Fixture, Effect, Universe, StepperMotor, Servo, Scene, DMXChannel } from '@/lib/types'
import type { MidiMessage } from '@/hooks/useMidiBridge'
import { matchMidiMapping, normalizeMidiValue, midiValueToPercent, type MidiMapping } from '@/lib/midiMappings'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Lightbulb, Lightning, Play, Pause, Faders, NumberSquareOne, NumberSquareTwo, NumberSquareThree, NumberSquareFour, NumberSquareFive, NumberSquareSix } from '@phosphor-icons/react'
import JoystickControl from '@/components/JoystickControl'
import EffectPreview from '@/components/EffectPreview'
import { setChannel } from '@/lib/dmxQueue'
import { setMasterDimmerScale } from '@/lib/masterDimmer'

interface LiveControlViewProps {
    fixtures: Fixture[]
    setFixtures: (updater: (fixtures: Fixture[]) => Fixture[]) => void
    effects: Effect[]
    setEffects: (updater: (effects: Effect[]) => Effect[]) => void
    universes: Universe[]
    scenes: Scene[]
    setActiveScene: (sceneId: string | null) => void
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
    scenes,
    setActiveScene,
    stepperMotors,
    setStepperMotors,
    servos,
    setServos,
}: LiveControlViewProps) {
    const [effectSlots, setEffectSlots] = useKV<(string | null)[]>('effect-slots', [null, null, null, null, null, null])
    const [midiMappings] = useKV<MidiMapping[]>('midi-mappings', [])
    const [masterDimmer, setMasterDimmer] = useKV<number>('master-dimmer', 255)
    const [activeSlot, setActiveSlot] = useState<number | null>(null)
    const masterDimmerValue = typeof masterDimmer === 'number' ? masterDimmer : 255

    useEffect(() => {
        setMasterDimmerScale(Math.max(0, Math.min(1, masterDimmerValue / 255)))
    }, [masterDimmerValue])

    const handleMasterDimmerChange = useCallback(
        (value: number) => {
            setMasterDimmer(Math.max(0, Math.min(255, value)))
        },
        [setMasterDimmer]
    )

    const isPressMessage = useCallback((message: MidiMessage) => {
        if (message.command === 'note-off') {
            return false
        }
        const velocity = message.data?.[2]
        if (velocity === undefined) {
            return true
        }
        return velocity > 0
    }, [])

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

    const toggleEffect = useCallback(
        (effectId: string, behavior: 'toggle' | 'on' | 'off' = 'toggle') => {
            setEffects((current) =>
                current.map((effect) => {
                    if (effect.id !== effectId) {
                        return effect
                    }
                    const nextActive = behavior === 'toggle' ? !effect.isActive : behavior === 'on'
                    return { ...effect, isActive: nextActive }
                })
            )
        },
        [setEffects]
    )

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

    const recallScene = useCallback(
        (sceneId: string) => {
            const scene = scenes.find((s) => s.id === sceneId)
            if (!scene) {
                return
            }
            setFixtures((current) =>
                current.map((fixture) => {
                    const channels = fixture.channels.map((channel) => {
                        const nextVal = scene.channelValues[channel.id]
                        return typeof nextVal === 'number' ? { ...channel, value: nextVal } : channel
                    })
                    return { ...fixture, channels }
                })
            )
            setActiveScene(scene.id)
            try {
                const patches = new Map<number, { ch: number; val: number }[]>()
                fixtures.forEach((fixture) => {
                    const universe = universes.find((u) => u.id === fixture.universeId)
                    if (!universe) {
                        return
                    }
                    fixture.channels.forEach((channel) => {
                        const val = scene.channelValues[channel.id]
                        if (typeof val !== 'number') {
                            return
                        }
                        const base = typeof fixture.dmxAddress === 'number' ? fixture.dmxAddress : 1
                        const offset = typeof channel.number === 'number' ? channel.number - 1 : 0
                        const absCh = Math.max(1, Math.min(512, base + offset))
                        const list = patches.get(universe.number) ?? []
                        list.push({ ch: absCh, val })
                        patches.set(universe.number, list)
                    })
                })
                for (const [universeNumber, entries] of patches) {
                    entries.forEach((entry) => setChannel(universeNumber, entry.ch, entry.val))
                }
            } catch (error) {
                console.error('midi_scene_recall_failed', error)
            }
        },
        [scenes, setFixtures, fixtures, universes, setActiveScene]
    )

    const updateEffectSpeed = useCallback(
        (effectId: string, speed: number) => {
            setEffects((current) =>
                current.map((effect) => (effect.id === effectId ? { ...effect, speed } : effect))
            )
        },
        [setEffects]
    )

    const updateEffectIntensity = useCallback(
        (effectId: string, intensity: number) => {
            setEffects((current) =>
                current.map((effect) => (effect.id === effectId ? { ...effect, intensity } : effect))
            )
        },
        [setEffects]
    )

    const activeEffects = effects.filter(e => e.isActive)
    const hasActiveContent = fixtures.length > 0 || activeEffects.length > 0
    const slots = effectSlots || [null, null, null, null, null, null]
    const masterDimmerPercent = Math.round((masterDimmerValue / 255) * 100)

    const applyChannelValue = useCallback(
        (channelNumber: number, value: number) => {
            if (Number.isNaN(channelNumber) || channelNumber < 1) {
                return
            }
            const zeroBased = channelNumber - 1
            let selected: { fixture: Fixture; channel: DMXChannel } | undefined
            setFixtures((current) => {
                let remaining = zeroBased
                let updated = false
                const next = current.map((fixture) => {
                    if (updated) {
                        return fixture
                    }
                    let changed = false
                    const channels = fixture.channels.map((channel) => {
                        if (updated) {
                            return channel
                        }
                        if (remaining === 0) {
                            changed = true
                            updated = true
                            selected = { fixture, channel }
                            return { ...channel, value }
                        }
                        remaining -= 1
                        return channel
                    })
                    return changed ? { ...fixture, channels } : fixture
                })
                return updated ? next : current
            })
            if (!selected) {
                return
            }
            const target = selected
            const universe = universes.find((u) => u.id === target.fixture.universeId)
            if (universe) {
                const base = typeof target.fixture.dmxAddress === 'number' ? target.fixture.dmxAddress : 1
                const offset = typeof target.channel.number === 'number' ? target.channel.number - 1 : 0
                const absCh = Math.max(1, Math.min(512, base + offset))
                setChannel(universe.number, absCh, value)
            }
        },
        [setFixtures, universes]
    )

    useEffect(() => {
        const handler = (event: Event) => {
            const custom = event as CustomEvent<MidiMessage>
            const message = custom.detail
            if (!message) {
                return
            }
            const mapping = matchMidiMapping(message, midiMappings || [])
            if (!mapping) {
                return
            }
            switch (mapping.action.type) {
                case 'channel': {
                    const midiValue = message.data?.[2]
                    if (midiValue === undefined) {
                        return
                    }
                    applyChannelValue(mapping.action.channel, normalizeMidiValue(midiValue))
                    break
                }
                case 'scene': {
                    if (!isPressMessage(message)) {
                        return
                    }
                    recallScene(mapping.action.sceneId)
                    break
                }
                case 'effect-toggle': {
                    if (!isPressMessage(message)) {
                        return
                    }
                    toggleEffect(mapping.action.effectId, mapping.action.behavior ?? 'toggle')
                    break
                }
                case 'effect-intensity': {
                    const midiValue = message.data?.[2]
                    if (midiValue === undefined) {
                        return
                    }
                    updateEffectIntensity(mapping.action.effectId, midiValueToPercent(midiValue))
                    break
                }
                case 'master-dimmer': {
                    const midiValue = message.data?.[2]
                    if (midiValue === undefined) {
                        return
                    }
                    handleMasterDimmerChange(normalizeMidiValue(midiValue))
                    break
                }
                default:
                    break
            }
        }
        document.addEventListener('dmx-midi', handler)
        return () => {
            document.removeEventListener('dmx-midi', handler)
        }
    }, [midiMappings, applyChannelValue, recallScene, toggleEffect, updateEffectIntensity, handleMasterDimmerChange, isPressMessage])
    
    const slotIcons = [
        NumberSquareOne,
        NumberSquareTwo,
        NumberSquareThree,
        NumberSquareFour,
        NumberSquareFive,
        NumberSquareSix,
    ]

    return (
        <div className="space-y-6">
            <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Faders size={20} className="text-primary" />
                    <div className="flex items-center justify-between w-full">
                        <h2 className="text-lg font-semibold">Master dimmer</h2>
                        <Badge variant="secondary" className="text-xs">
                            {masterDimmerPercent}%
                        </Badge>
                    </div>
                </div>
                <Slider
                    value={[masterDimmerValue]}
                    onValueChange={(values) => handleMasterDimmerChange(values[0])}
                    max={255}
                    step={1}
                    className="cursor-pointer"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                    Ovlivnuje vsechny DMX patche posilane aplikaci (pomocna brzda pred vystupem).
                </p>
            </Card>

            {!hasActiveContent ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-muted p-6 mb-4">
                        <Faders size={48} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Nic k ovládání</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                        Přidejte světla v záložce Nastavení nebo vytvořte efekty v záložce Efekty
                    </p>
                </div>
            ) : (
                <>
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
                                    <label className="sr-only" htmlFor={`effect-slot-${index}`}>
                                        Vyber efekt pro slot {index + 1}
                                    </label>
                                    <select
                                        id={`effect-slot-${index}`}
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

                                    <div className="flex justify-center py-1">
                                        <EffectPreview
                                            effect={effect}
                                            fixtureCount={effect.fixtureIds.length}
                                            size="sm"
                                        />
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
                </>
            )}
        </div>
    )
}
