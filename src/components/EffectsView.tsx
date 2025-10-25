import { Effect, Fixture, EffectBlock } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash, Lightning, Play, Pause, Sparkle, PencilSimple, Copy, Code } from '@phosphor-icons/react'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BlockProgramming from '@/components/BlockProgramming'
import { compileBlocks, getEffectSummary } from '@/lib/blockCompiler'

const BLOCK_TYPES_MAP: Record<EffectBlock['type'], string> = {
    'set-color': 'Set Color',
    'set-intensity': 'Set Intensity',
    'fade': 'Fade',
    'wait': 'Wait',
    'chase-step': 'Chase Step',
    'strobe-pulse': 'Strobe',
    'rainbow-shift': 'Rainbow',
    'random-color': 'Random Color',
    'pan-tilt': 'Pan/Tilt',
    'loop-start': 'Loop Start',
    'loop-end': 'Loop End',
}

interface EffectsViewProps {
    effects: Effect[]
    setEffects: (updater: (effects: Effect[]) => Effect[]) => void
    fixtures: Fixture[]
    setFixtures: (updater: (fixtures: Fixture[]) => Fixture[]) => void
}

export default function EffectsView({
    effects,
    setEffects,
    fixtures,
    setFixtures,
}: EffectsViewProps) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingEffect, setEditingEffect] = useState<Effect | null>(null)
    const [effectName, setEffectName] = useState('')
    const [effectType, setEffectType] = useState<Effect['type']>('chase')
    const [selectedFixtures, setSelectedFixtures] = useState<string[]>([])
    const [quickSpeed, setQuickSpeed] = useState(50)
    const [quickIntensity, setQuickIntensity] = useState(100)
    const [editingBlocks, setEditingBlocks] = useState<EffectBlock[]>([])
    const blockExecutionRefs = useRef<Map<string, { currentIndex: number, loopStack: Array<{ startIndex: number, remainingLoops: number }> }>>(new Map())

    useEffect(() => {
        const interval = setInterval(() => {
            const activeEffects = effects.filter((e) => e.isActive)
            if (activeEffects.length === 0) return

            activeEffects.forEach((effect) => {
                if (effect.type === 'block-program' && effect.blocks && effect.blocks.length > 0) {
                    executeBlockProgram(effect)
                } else {
                    applyEffect(effect)
                }
            })
        }, 100)

        return () => clearInterval(interval)
    }, [effects])

    const executeBlockProgram = (effect: Effect) => {
        if (!effect.blocks || effect.blocks.length === 0) return

        let state = blockExecutionRefs.current.get(effect.id)
        if (!state) {
            state = { currentIndex: 0, loopStack: [] }
            blockExecutionRefs.current.set(effect.id, state)
        }

        if (state.currentIndex >= effect.blocks.length) {
            state.currentIndex = 0
            state.loopStack = []
        }

        const block = effect.blocks[state.currentIndex]
        executeBlock(effect, block, state)
        
        state.currentIndex++
    }

    const executeBlock = (effect: Effect, block: EffectBlock, state: { currentIndex: number, loopStack: Array<{ startIndex: number, remainingLoops: number }> }) => {
        const params = block.parameters

        switch (block.type) {
            case 'set-color':
                setFixtures((current) =>
                    current.map((fixture) => {
                        if (!effect.fixtureIds.includes(fixture.id)) return fixture
                        if (fixture.fixtureType !== 'rgb' && fixture.fixtureType !== 'rgbw') return fixture
                        
                        return {
                            ...fixture,
                            channels: fixture.channels.map((ch, idx) => {
                                if (idx === 0) return { ...ch, value: params.red || 0 }
                                if (idx === 1) return { ...ch, value: params.green || 0 }
                                if (idx === 2) return { ...ch, value: params.blue || 0 }
                                if (idx === 3 && fixture.fixtureType === 'rgbw') return { ...ch, value: params.white || 0 }
                                return ch
                            }),
                        }
                    })
                )
                break

            case 'set-intensity':
                setFixtures((current) =>
                    current.map((fixture) => {
                        if (!effect.fixtureIds.includes(fixture.id)) return fixture
                        const value = Math.floor((params.intensity || 0) * 2.55)
                        return {
                            ...fixture,
                            channels: fixture.channels.map((ch, idx) =>
                                idx === 0 ? { ...ch, value } : ch
                            ),
                        }
                    })
                )
                break

            case 'chase-step':
                const fixtureIndex = params.fixtureIndex || 0
                setFixtures((current) =>
                    current.map((fixture) => {
                        if (!effect.fixtureIds.includes(fixture.id)) return fixture
                        const isActive = effect.fixtureIds.indexOf(fixture.id) === fixtureIndex
                        const value = isActive ? 255 : 0
                        return {
                            ...fixture,
                            channels: fixture.channels.map((ch, idx) =>
                                idx === 0 ? { ...ch, value } : ch
                            ),
                        }
                    })
                )
                break

            case 'strobe-pulse':
                const strobeValue = Math.random() > 0.5 ? 255 : 0
                setFixtures((current) =>
                    current.map((fixture) => {
                        if (!effect.fixtureIds.includes(fixture.id)) return fixture
                        return {
                            ...fixture,
                            channels: fixture.channels.map((ch, idx) =>
                                idx === 0 ? { ...ch, value: strobeValue } : ch
                            ),
                        }
                    })
                )
                break

            case 'rainbow-shift':
                const hue = ((Date.now() / 10) % 360)
                const rgb = hslToRgb(hue / 360, 1, 0.5)
                setFixtures((current) =>
                    current.map((fixture) => {
                        if (!effect.fixtureIds.includes(fixture.id)) return fixture
                        if (fixture.fixtureType !== 'rgb' && fixture.fixtureType !== 'rgbw') return fixture
                        
                        return {
                            ...fixture,
                            channels: fixture.channels.map((ch, idx) => {
                                if (idx === 0) return { ...ch, value: rgb.r }
                                if (idx === 1) return { ...ch, value: rgb.g }
                                if (idx === 2) return { ...ch, value: rgb.b }
                                return ch
                            }),
                        }
                    })
                )
                break

            case 'random-color':
                const randomRgb = {
                    r: Math.floor(Math.random() * 256),
                    g: Math.floor(Math.random() * 256),
                    b: Math.floor(Math.random() * 256),
                }
                setFixtures((current) =>
                    current.map((fixture) => {
                        if (!effect.fixtureIds.includes(fixture.id)) return fixture
                        if (fixture.fixtureType !== 'rgb' && fixture.fixtureType !== 'rgbw') return fixture
                        
                        return {
                            ...fixture,
                            channels: fixture.channels.map((ch, idx) => {
                                if (idx === 0) return { ...ch, value: randomRgb.r }
                                if (idx === 1) return { ...ch, value: randomRgb.g }
                                if (idx === 2) return { ...ch, value: randomRgb.b }
                                return ch
                            }),
                        }
                    })
                )
                break

            case 'pan-tilt':
                setFixtures((current) =>
                    current.map((fixture) => {
                        if (!effect.fixtureIds.includes(fixture.id)) return fixture
                        if (fixture.fixtureType !== 'moving-head') return fixture
                        
                        return {
                            ...fixture,
                            channels: fixture.channels.map((ch) => {
                                if (ch.name === 'Pan') return { ...ch, value: params.pan || 128 }
                                if (ch.name === 'Tilt') return { ...ch, value: params.tilt || 128 }
                                return ch
                            }),
                        }
                    })
                )
                break

            case 'loop-start':
                state.loopStack.push({
                    startIndex: state.currentIndex,
                    remainingLoops: (params.loopCount || 1) - 1
                })
                break

            case 'loop-end':
                if (state.loopStack.length > 0) {
                    const loop = state.loopStack[state.loopStack.length - 1]
                    if (loop.remainingLoops > 0) {
                        loop.remainingLoops--
                        state.currentIndex = loop.startIndex
                    } else {
                        state.loopStack.pop()
                    }
                }
                break
        }
    }

    const applyEffect = (effect: Effect) => {
        const time = Date.now()
        const speed = effect.speed / 100

        switch (effect.type) {
            case 'chase':
                applyChaseEffect(effect, time, speed)
                break
            case 'strobe':
                applyStrobeEffect(effect, time, speed)
                break
            case 'rainbow':
                applyRainbowEffect(effect, time, speed)
                break
            case 'fade':
                applyFadeEffect(effect, time, speed)
                break
            case 'sweep':
                applySweepEffect(effect, time, speed)
                break
            case 'sparkle':
                applySparkleEffect(effect, time, speed)
                break
            case 'wipe':
                applyWipeEffect(effect, time, speed)
                break
            case 'bounce':
                applyBounceEffect(effect, time, speed)
                break
            case 'theater-chase':
                applyTheaterChaseEffect(effect, time, speed)
                break
            case 'fire':
                applyFireEffect(effect, time, speed)
                break
            case 'wave':
                applyWaveEffect(effect, time, speed)
                break
            case 'pulse':
                applyPulseEffect(effect, time, speed)
                break
            case 'color-fade':
                applyColorFadeEffect(effect, time, speed)
                break
        }
    }

    const applyChaseEffect = (effect: Effect, time: number, speed: number) => {
        const fixtureCount = effect.fixtureIds.length
        if (fixtureCount === 0) return

        const cycleTime = 2000 / speed
        const activeIndex = Math.floor((time / cycleTime) % fixtureCount)

        setFixtures((current) =>
            current.map((fixture) => {
                if (!effect.fixtureIds.includes(fixture.id)) return fixture
                const isActive = effect.fixtureIds.indexOf(fixture.id) === activeIndex
                const value = isActive ? Math.floor(effect.intensity * 2.55) : 0

                return {
                    ...fixture,
                    channels: fixture.channels.map((ch, idx) =>
                        idx === 0 ? { ...ch, value } : ch
                    ),
                }
            })
        )
    }

    const applyStrobeEffect = (effect: Effect, time: number, speed: number) => {
        const strobeTime = 200 / speed
        const isOn = Math.floor((time / strobeTime) % 2) === 0
        const value = isOn ? Math.floor(effect.intensity * 2.55) : 0

        setFixtures((current) =>
            current.map((fixture) => {
                if (!effect.fixtureIds.includes(fixture.id)) return fixture
                return {
                    ...fixture,
                    channels: fixture.channels.map((ch, idx) =>
                        idx === 0 ? { ...ch, value } : ch
                    ),
                }
            })
        )
    }

    const applyRainbowEffect = (effect: Effect, time: number, speed: number) => {
        const cycleTime = 5000 / speed
        const progress = (time % cycleTime) / cycleTime

        setFixtures((current) =>
            current.map((fixture) => {
                if (!effect.fixtureIds.includes(fixture.id)) return fixture
                if (fixture.fixtureType !== 'rgb' && fixture.fixtureType !== 'rgbw')
                    return fixture

                const hue = (progress * 360 + effect.fixtureIds.indexOf(fixture.id) * 30) % 360
                const rgb = hslToRgb(hue / 360, 1, 0.5)

                return {
                    ...fixture,
                    channels: fixture.channels.map((ch, idx) => {
                        if (idx === 0) return { ...ch, value: Math.floor(rgb.r * effect.intensity / 100) }
                        if (idx === 1) return { ...ch, value: Math.floor(rgb.g * effect.intensity / 100) }
                        if (idx === 2) return { ...ch, value: Math.floor(rgb.b * effect.intensity / 100) }
                        return ch
                    }),
                }
            })
        )
    }

    const applyFadeEffect = (effect: Effect, time: number, speed: number) => {
        const cycleTime = 3000 / speed
        const progress = (time % cycleTime) / cycleTime
        const value = Math.floor(Math.sin(progress * Math.PI * 2) * 127 + 128) * effect.intensity / 100

        setFixtures((current) =>
            current.map((fixture) => {
                if (!effect.fixtureIds.includes(fixture.id)) return fixture
                return {
                    ...fixture,
                    channels: fixture.channels.map((ch, idx) =>
                        idx === 0 ? { ...ch, value: Math.floor(value) } : ch
                    ),
                }
            })
        )
    }

    const applySweepEffect = (effect: Effect, time: number, speed: number) => {
        const cycleTime = 4000 / speed
        const progress = (time % cycleTime) / cycleTime
        const panValue = Math.floor(Math.sin(progress * Math.PI * 2) * 127 + 128)

        setFixtures((current) =>
            current.map((fixture) => {
                if (!effect.fixtureIds.includes(fixture.id)) return fixture
                if (fixture.fixtureType !== 'moving-head') return fixture

                return {
                    ...fixture,
                    channels: fixture.channels.map((ch) => {
                        if (ch.name === 'Pan') return { ...ch, value: panValue }
                        if (ch.name === 'Intensity') return { ...ch, value: Math.floor(effect.intensity * 2.55) }
                        return ch
                    }),
                }
            })
        )
    }

    const applySparkleEffect = (effect: Effect, time: number, speed: number) => {
        setFixtures((current) =>
            current.map((fixture) => {
                if (!effect.fixtureIds.includes(fixture.id)) return fixture
                
                const shouldSparkle = Math.random() < (speed * 0.02)
                const value = shouldSparkle ? Math.floor(effect.intensity * 2.55) : 0

                return {
                    ...fixture,
                    channels: fixture.channels.map((ch, idx) =>
                        idx === 0 ? { ...ch, value } : ch
                    ),
                }
            })
        )
    }

    const applyWipeEffect = (effect: Effect, time: number, speed: number) => {
        const fixtureCount = effect.fixtureIds.length
        if (fixtureCount === 0) return

        const cycleTime = 3000 / speed
        const progress = (time % cycleTime) / cycleTime
        const activeCount = Math.floor(progress * fixtureCount)

        setFixtures((current) =>
            current.map((fixture) => {
                if (!effect.fixtureIds.includes(fixture.id)) return fixture
                const fixtureIndex = effect.fixtureIds.indexOf(fixture.id)
                const isActive = fixtureIndex <= activeCount
                const value = isActive ? Math.floor(effect.intensity * 2.55) : 0

                return {
                    ...fixture,
                    channels: fixture.channels.map((ch, idx) =>
                        idx === 0 ? { ...ch, value } : ch
                    ),
                }
            })
        )
    }

    const applyBounceEffect = (effect: Effect, time: number, speed: number) => {
        const fixtureCount = effect.fixtureIds.length
        if (fixtureCount === 0) return

        const cycleTime = 2000 / speed
        const progress = (time % cycleTime) / cycleTime
        const bounce = Math.abs(Math.sin(progress * Math.PI))
        const activeIndex = Math.floor(bounce * (fixtureCount - 1))

        setFixtures((current) =>
            current.map((fixture) => {
                if (!effect.fixtureIds.includes(fixture.id)) return fixture
                const isActive = effect.fixtureIds.indexOf(fixture.id) === activeIndex
                const value = isActive ? Math.floor(effect.intensity * 2.55) : 0

                return {
                    ...fixture,
                    channels: fixture.channels.map((ch, idx) =>
                        idx === 0 ? { ...ch, value } : ch
                    ),
                }
            })
        )
    }

    const applyTheaterChaseEffect = (effect: Effect, time: number, speed: number) => {
        const cycleTime = 1000 / speed
        const step = Math.floor((time / cycleTime) % 3)

        setFixtures((current) =>
            current.map((fixture) => {
                if (!effect.fixtureIds.includes(fixture.id)) return fixture
                const fixtureIndex = effect.fixtureIds.indexOf(fixture.id)
                const isActive = fixtureIndex % 3 === step
                const value = isActive ? Math.floor(effect.intensity * 2.55) : 0

                return {
                    ...fixture,
                    channels: fixture.channels.map((ch, idx) =>
                        idx === 0 ? { ...ch, value } : ch
                    ),
                }
            })
        )
    }

    const applyFireEffect = (effect: Effect, time: number, speed: number) => {
        setFixtures((current) =>
            current.map((fixture) => {
                if (!effect.fixtureIds.includes(fixture.id)) return fixture
                if (fixture.fixtureType !== 'rgb' && fixture.fixtureType !== 'rgbw')
                    return fixture

                const flicker = 0.7 + Math.random() * 0.3
                const red = Math.floor(255 * flicker * effect.intensity / 100)
                const green = Math.floor((100 + Math.random() * 50) * flicker * effect.intensity / 100)
                const blue = 0

                return {
                    ...fixture,
                    channels: fixture.channels.map((ch, idx) => {
                        if (idx === 0) return { ...ch, value: red }
                        if (idx === 1) return { ...ch, value: green }
                        if (idx === 2) return { ...ch, value: blue }
                        return ch
                    }),
                }
            })
        )
    }

    const applyWaveEffect = (effect: Effect, time: number, speed: number) => {
        const fixtureCount = effect.fixtureIds.length
        if (fixtureCount === 0) return

        const cycleTime = 3000 / speed

        setFixtures((current) =>
            current.map((fixture) => {
                if (!effect.fixtureIds.includes(fixture.id)) return fixture
                const fixtureIndex = effect.fixtureIds.indexOf(fixture.id)
                const offset = (fixtureIndex / fixtureCount) * Math.PI * 2
                const progress = ((time % cycleTime) / cycleTime) * Math.PI * 2
                const wave = (Math.sin(progress + offset) + 1) / 2
                const value = Math.floor(wave * effect.intensity * 2.55)

                return {
                    ...fixture,
                    channels: fixture.channels.map((ch, idx) =>
                        idx === 0 ? { ...ch, value } : ch
                    ),
                }
            })
        )
    }

    const applyPulseEffect = (effect: Effect, time: number, speed: number) => {
        const cycleTime = 2000 / speed
        const progress = (time % cycleTime) / cycleTime
        const pulse = Math.pow(Math.sin(progress * Math.PI), 2)
        const value = Math.floor(pulse * effect.intensity * 2.55)

        setFixtures((current) =>
            current.map((fixture) => {
                if (!effect.fixtureIds.includes(fixture.id)) return fixture
                return {
                    ...fixture,
                    channels: fixture.channels.map((ch, idx) =>
                        idx === 0 ? { ...ch, value } : ch
                    ),
                }
            })
        )
    }

    const applyColorFadeEffect = (effect: Effect, time: number, speed: number) => {
        const cycleTime = 5000 / speed
        const progress = (time % cycleTime) / cycleTime

        setFixtures((current) =>
            current.map((fixture) => {
                if (!effect.fixtureIds.includes(fixture.id)) return fixture
                if (fixture.fixtureType !== 'rgb' && fixture.fixtureType !== 'rgbw')
                    return fixture

                let r = 0, g = 0, b = 0
                if (progress < 0.33) {
                    const p = progress / 0.33
                    r = Math.floor(255 * (1 - p))
                    g = Math.floor(255 * p)
                } else if (progress < 0.66) {
                    const p = (progress - 0.33) / 0.33
                    g = Math.floor(255 * (1 - p))
                    b = Math.floor(255 * p)
                } else {
                    const p = (progress - 0.66) / 0.34
                    b = Math.floor(255 * (1 - p))
                    r = Math.floor(255 * p)
                }

                return {
                    ...fixture,
                    channels: fixture.channels.map((ch, idx) => {
                        if (idx === 0) return { ...ch, value: Math.floor(r * effect.intensity / 100) }
                        if (idx === 1) return { ...ch, value: Math.floor(g * effect.intensity / 100) }
                        if (idx === 2) return { ...ch, value: Math.floor(b * effect.intensity / 100) }
                        return ch
                    }),
                }
            })
        )
    }

    const hslToRgb = (h: number, s: number, l: number) => {
        let r, g, b

        if (s === 0) {
            r = g = b = l
        } else {
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1
                if (t > 1) t -= 1
                if (t < 1 / 6) return p + (q - p) * 6 * t
                if (t < 1 / 2) return q
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
                return p
            }

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s
            const p = 2 * l - q
            r = hue2rgb(p, q, h + 1 / 3)
            g = hue2rgb(p, q, h)
            b = hue2rgb(p, q, h - 1 / 3)
        }

        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
    }

    const addEffect = () => {
        if (!effectName.trim()) {
            toast.error('Enter effect name')
            return
        }

        if (selectedFixtures.length === 0) {
            toast.error('Select at least one fixture')
            return
        }

        const newEffect: Effect = {
            id: Date.now().toString(),
            name: effectName.trim(),
            type: effectType,
            fixtureIds: selectedFixtures,
            speed: quickSpeed,
            intensity: quickIntensity,
            isActive: false,
            parameters: {},
            blocks: effectType === 'block-program' ? editingBlocks : undefined,
        }

        setEffects((current) => [...current, newEffect])
        resetCreateDialog()
        toast.success(`Effect "${newEffect.name}" created`)
    }

    const resetCreateDialog = () => {
        setEffectName('')
        setEffectType('chase')
        setSelectedFixtures([])
        setQuickSpeed(50)
        setQuickIntensity(100)
        setEditingBlocks([])
        setIsCreateDialogOpen(false)
    }

    const openEditDialog = (effect: Effect) => {
        setEditingEffect(effect)
        setEffectName(effect.name)
        setEffectType(effect.type)
        setSelectedFixtures(effect.fixtureIds)
        setQuickSpeed(effect.speed)
        setQuickIntensity(effect.intensity)
        setEditingBlocks(effect.blocks || [])
        setIsEditDialogOpen(true)
    }

    const saveEditEffect = () => {
        if (!editingEffect) return
        
        if (!effectName.trim()) {
            toast.error('Enter effect name')
            return
        }

        if (selectedFixtures.length === 0) {
            toast.error('Select at least one fixture')
            return
        }

        setEffects((current) =>
            current.map((effect) =>
                effect.id === editingEffect.id
                    ? {
                          ...effect,
                          name: effectName.trim(),
                          type: effectType,
                          fixtureIds: selectedFixtures,
                          speed: quickSpeed,
                          intensity: quickIntensity,
                          blocks: effectType === 'block-program' ? editingBlocks : undefined,
                      }
                    : effect
            )
        )
        resetEditDialog()
        toast.success(`Effect updated`)
    }

    const resetEditDialog = () => {
        setEditingEffect(null)
        setEffectName('')
        setEffectType('chase')
        setSelectedFixtures([])
        setQuickSpeed(50)
        setQuickIntensity(100)
        setEditingBlocks([])
        setIsEditDialogOpen(false)
    }

    const duplicateEffect = (effect: Effect) => {
        const newEffect: Effect = {
            ...effect,
            id: Date.now().toString(),
            name: `${effect.name} (Copy)`,
            isActive: false,
        }
        setEffects((current) => [...current, newEffect])
        toast.success(`Effect duplicated`)
    }

    const deleteEffect = (effectId: string) => {
        const effect = effects.find((e) => e.id === effectId)
        setEffects((current) => current.filter((e) => e.id !== effectId))
        if (effect) {
            toast.success(`Effect "${effect.name}" deleted`)
        }
    }

    const toggleEffect = (effectId: string) => {
        setEffects((current) =>
            current.map((effect) =>
                effect.id === effectId ? { ...effect, isActive: !effect.isActive } : effect
            )
        )
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

    const toggleFixtureSelection = (fixtureId: string) => {
        setSelectedFixtures((current) =>
            current.includes(fixtureId)
                ? current.filter((id) => id !== fixtureId)
                : [...current, fixtureId]
        )
    }

    const selectAllFixtures = () => {
        setSelectedFixtures(fixtures.map(f => f.id))
    }

    const clearFixtureSelection = () => {
        setSelectedFixtures([])
    }

    const getEffectIcon = (type: Effect['type']) => {
        switch (type) {
            case 'chase':
                return <Lightning />
            case 'strobe':
                return <Sparkle />
            case 'rainbow':
                return <Sparkle />
            case 'fade':
                return <Lightning />
            case 'sweep':
                return <Lightning />
            case 'block-program':
                return <Code />
            case 'sparkle':
                return <Sparkle />
            case 'wipe':
                return <Lightning />
            case 'bounce':
                return <Lightning />
            case 'theater-chase':
                return <Lightning />
            case 'fire':
                return <Sparkle />
            case 'wave':
                return <Lightning />
            case 'pulse':
                return <Sparkle />
            case 'color-fade':
                return <Sparkle />
        }
    }

    const getEffectDescription = (type: Effect['type']) => {
        switch (type) {
            case 'chase':
                return 'Sequential fixture activation'
            case 'strobe':
                return 'Rapid on/off flashing'
            case 'rainbow':
                return 'RGB color cycling'
            case 'fade':
                return 'Smooth intensity fade'
            case 'sweep':
                return 'Pan movement sweep'
            case 'block-program':
                return 'Custom block program'
            case 'sparkle':
                return 'Random twinkling lights'
            case 'wipe':
                return 'Progressive wipe across fixtures'
            case 'bounce':
                return 'Bouncing light effect'
            case 'theater-chase':
                return 'Theater-style chase pattern'
            case 'fire':
                return 'Flickering fire simulation'
            case 'wave':
                return 'Wave pattern across fixtures'
            case 'pulse':
                return 'Smooth pulsing effect'
            case 'color-fade':
                return 'Smooth RGB color transitions'
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold">Effects</h2>
                    <p className="text-sm text-muted-foreground">Create and control lighting effects</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" disabled={fixtures.length === 0}>
                            <Plus weight="bold" />
                            Create Effect
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Effect</DialogTitle>
                            <DialogDescription>Choose effect type and settings</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="effect-name">Effect Name</Label>
                                <Input
                                    id="effect-name"
                                    value={effectName}
                                    onChange={(e) => setEffectName(e.target.value)}
                                    placeholder="e.g., Main Chase, Rainbow Loop"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label>Effect Type</Label>
                                <Tabs value={effectType} onValueChange={(value) => setEffectType(value as Effect['type'])}>
                                    <TabsList className="grid w-full grid-cols-3 gap-2 h-auto">
                                        <TabsTrigger value="chase" className="text-xs">Chase</TabsTrigger>
                                        <TabsTrigger value="strobe" className="text-xs">Strobe</TabsTrigger>
                                        <TabsTrigger value="rainbow" className="text-xs">Rainbow</TabsTrigger>
                                        <TabsTrigger value="fade" className="text-xs">Fade</TabsTrigger>
                                        <TabsTrigger value="sweep" className="text-xs">Sweep</TabsTrigger>
                                        <TabsTrigger value="sparkle" className="text-xs">Sparkle</TabsTrigger>
                                        <TabsTrigger value="wipe" className="text-xs">Wipe</TabsTrigger>
                                        <TabsTrigger value="bounce" className="text-xs">Bounce</TabsTrigger>
                                        <TabsTrigger value="theater-chase" className="text-xs">Theater</TabsTrigger>
                                        <TabsTrigger value="fire" className="text-xs">Fire</TabsTrigger>
                                        <TabsTrigger value="wave" className="text-xs">Wave</TabsTrigger>
                                        <TabsTrigger value="pulse" className="text-xs">Pulse</TabsTrigger>
                                        <TabsTrigger value="color-fade" className="text-xs">Color Fade</TabsTrigger>
                                        <TabsTrigger value="block-program" className="text-xs">Blocks</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="chase" className="mt-3">
                                        <p className="text-sm text-muted-foreground">Activates fixtures one by one in sequence</p>
                                    </TabsContent>
                                    <TabsContent value="strobe" className="mt-3">
                                        <p className="text-sm text-muted-foreground">Rapid on/off flashing for all fixtures</p>
                                    </TabsContent>
                                    <TabsContent value="rainbow" className="mt-3">
                                        <p className="text-sm text-muted-foreground">Smooth color cycling through RGB spectrum</p>
                                    </TabsContent>
                                    <TabsContent value="fade" className="mt-3">
                                        <p className="text-sm text-muted-foreground">Smooth sine wave intensity fading</p>
                                    </TabsContent>
                                    <TabsContent value="sweep" className="mt-3">
                                        <p className="text-sm text-muted-foreground">Pan movement sweep for moving heads</p>
                                    </TabsContent>
                                    <TabsContent value="sparkle" className="mt-3">
                                        <p className="text-sm text-muted-foreground">Random twinkling lights effect</p>
                                    </TabsContent>
                                    <TabsContent value="wipe" className="mt-3">
                                        <p className="text-sm text-muted-foreground">Progressive wipe across all fixtures</p>
                                    </TabsContent>
                                    <TabsContent value="bounce" className="mt-3">
                                        <p className="text-sm text-muted-foreground">Bouncing light back and forth</p>
                                    </TabsContent>
                                    <TabsContent value="theater-chase" className="mt-3">
                                        <p className="text-sm text-muted-foreground">Theater-style chase with groups of 3</p>
                                    </TabsContent>
                                    <TabsContent value="fire" className="mt-3">
                                        <p className="text-sm text-muted-foreground">Flickering fire simulation (RGB only)</p>
                                    </TabsContent>
                                    <TabsContent value="wave" className="mt-3">
                                        <p className="text-sm text-muted-foreground">Sine wave pattern across fixtures</p>
                                    </TabsContent>
                                    <TabsContent value="pulse" className="mt-3">
                                        <p className="text-sm text-muted-foreground">Smooth pulsing intensity effect</p>
                                    </TabsContent>
                                    <TabsContent value="color-fade" className="mt-3">
                                        <p className="text-sm text-muted-foreground">Smooth RGB color transitions (RGB only)</p>
                                    </TabsContent>
                                    <TabsContent value="block-program" className="mt-3">
                                        <p className="text-sm text-muted-foreground mb-4">Create custom effect using visual blocks</p>
                                        <BlockProgramming blocks={editingBlocks} onBlocksChange={setEditingBlocks} />
                                    </TabsContent>
                                </Tabs>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Speed: {quickSpeed}%</Label>
                                    <Slider
                                        value={[quickSpeed]}
                                        onValueChange={(v) => setQuickSpeed(v[0])}
                                        max={100}
                                        step={5}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Intensity: {quickIntensity}%</Label>
                                    <Slider
                                        value={[quickIntensity]}
                                        onValueChange={(v) => setQuickIntensity(v[0])}
                                        max={100}
                                        step={5}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Select Fixtures ({selectedFixtures.length} selected)</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={selectAllFixtures}
                                        >
                                            All
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFixtureSelection}
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                                    {fixtures.length === 0 ? (
                                        <p className="text-sm text-muted-foreground col-span-2">
                                            No fixtures available
                                        </p>
                                    ) : (
                                        fixtures.map((fixture) => (
                                            <button
                                                key={fixture.id}
                                                type="button"
                                                className={`flex items-center gap-2 p-2 rounded border text-left transition-colors ${
                                                    selectedFixtures.includes(fixture.id)
                                                        ? 'bg-primary text-primary-foreground border-primary'
                                                        : 'hover:bg-accent'
                                                }`}
                                                onClick={() => toggleFixtureSelection(fixture.id)}
                                            >
                                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                                    selectedFixtures.includes(fixture.id)
                                                        ? 'bg-primary-foreground border-primary-foreground'
                                                        : 'border-muted-foreground'
                                                }`}>
                                                    {selectedFixtures.includes(fixture.id) && (
                                                        <div className="w-2 h-2 bg-primary rounded-sm" />
                                                    )}
                                                </div>
                                                <span className="text-sm">{fixture.name}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={resetCreateDialog}>
                                Cancel
                            </Button>
                            <Button onClick={addEffect}>Create Effect</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>


            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Effect</DialogTitle>
                        <DialogDescription>Modify effect settings</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-effect-name">Effect Name</Label>
                            <Input
                                id="edit-effect-name"
                                value={effectName}
                                onChange={(e) => setEffectName(e.target.value)}
                                placeholder="e.g., Main Chase, Rainbow Loop"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Effect Type</Label>
                            <Tabs value={effectType} onValueChange={(value) => setEffectType(value as Effect['type'])}>
                                <TabsList className="grid w-full grid-cols-3 gap-2 h-auto">
                                    <TabsTrigger value="chase" className="text-xs">Chase</TabsTrigger>
                                    <TabsTrigger value="strobe" className="text-xs">Strobe</TabsTrigger>
                                    <TabsTrigger value="rainbow" className="text-xs">Rainbow</TabsTrigger>
                                    <TabsTrigger value="fade" className="text-xs">Fade</TabsTrigger>
                                    <TabsTrigger value="sweep" className="text-xs">Sweep</TabsTrigger>
                                    <TabsTrigger value="sparkle" className="text-xs">Sparkle</TabsTrigger>
                                    <TabsTrigger value="wipe" className="text-xs">Wipe</TabsTrigger>
                                    <TabsTrigger value="bounce" className="text-xs">Bounce</TabsTrigger>
                                    <TabsTrigger value="theater-chase" className="text-xs">Theater</TabsTrigger>
                                    <TabsTrigger value="fire" className="text-xs">Fire</TabsTrigger>
                                    <TabsTrigger value="wave" className="text-xs">Wave</TabsTrigger>
                                    <TabsTrigger value="pulse" className="text-xs">Pulse</TabsTrigger>
                                    <TabsTrigger value="color-fade" className="text-xs">Color Fade</TabsTrigger>
                                    <TabsTrigger value="block-program" className="text-xs">Blocks</TabsTrigger>
                                </TabsList>
                                <TabsContent value="chase" className="mt-3">
                                    <p className="text-sm text-muted-foreground">Activates fixtures one by one in sequence</p>
                                </TabsContent>
                                <TabsContent value="strobe" className="mt-3">
                                    <p className="text-sm text-muted-foreground">Rapid on/off flashing for all fixtures</p>
                                </TabsContent>
                                <TabsContent value="rainbow" className="mt-3">
                                    <p className="text-sm text-muted-foreground">Smooth color cycling through RGB spectrum</p>
                                </TabsContent>
                                <TabsContent value="fade" className="mt-3">
                                    <p className="text-sm text-muted-foreground">Smooth sine wave intensity fading</p>
                                </TabsContent>
                                <TabsContent value="sweep" className="mt-3">
                                    <p className="text-sm text-muted-foreground">Pan movement sweep for moving heads</p>
                                </TabsContent>
                                <TabsContent value="sparkle" className="mt-3">
                                    <p className="text-sm text-muted-foreground">Random twinkling lights effect</p>
                                </TabsContent>
                                <TabsContent value="wipe" className="mt-3">
                                    <p className="text-sm text-muted-foreground">Progressive wipe across all fixtures</p>
                                </TabsContent>
                                <TabsContent value="bounce" className="mt-3">
                                    <p className="text-sm text-muted-foreground">Bouncing light back and forth</p>
                                </TabsContent>
                                <TabsContent value="theater-chase" className="mt-3">
                                    <p className="text-sm text-muted-foreground">Theater-style chase with groups of 3</p>
                                </TabsContent>
                                <TabsContent value="fire" className="mt-3">
                                    <p className="text-sm text-muted-foreground">Flickering fire simulation (RGB only)</p>
                                </TabsContent>
                                <TabsContent value="wave" className="mt-3">
                                    <p className="text-sm text-muted-foreground">Sine wave pattern across fixtures</p>
                                </TabsContent>
                                <TabsContent value="pulse" className="mt-3">
                                    <p className="text-sm text-muted-foreground">Smooth pulsing intensity effect</p>
                                </TabsContent>
                                <TabsContent value="color-fade" className="mt-3">
                                    <p className="text-sm text-muted-foreground">Smooth RGB color transitions (RGB only)</p>
                                </TabsContent>
                                <TabsContent value="block-program" className="mt-3">
                                    <p className="text-sm text-muted-foreground mb-4">Create custom effect using visual blocks</p>
                                    <BlockProgramming blocks={editingBlocks} onBlocksChange={setEditingBlocks} />
                                </TabsContent>
                            </Tabs>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Speed: {quickSpeed}%</Label>
                                <Slider
                                    value={[quickSpeed]}
                                    onValueChange={(v) => setQuickSpeed(v[0])}
                                    max={100}
                                    step={5}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Intensity: {quickIntensity}%</Label>
                                <Slider
                                    value={[quickIntensity]}
                                    onValueChange={(v) => setQuickIntensity(v[0])}
                                    max={100}
                                    step={5}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Select Fixtures ({selectedFixtures.length} selected)</Label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={selectAllFixtures}
                                    >
                                        All
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFixtureSelection}
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                                {fixtures.length === 0 ? (
                                    <p className="text-sm text-muted-foreground col-span-2">
                                        No fixtures available
                                    </p>
                                ) : (
                                    fixtures.map((fixture) => (
                                        <button
                                            key={fixture.id}
                                            type="button"
                                            className={`flex items-center gap-2 p-2 rounded border text-left transition-colors ${
                                                selectedFixtures.includes(fixture.id)
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'hover:bg-accent'
                                            }`}
                                            onClick={() => toggleFixtureSelection(fixture.id)}
                                        >
                                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                                selectedFixtures.includes(fixture.id)
                                                    ? 'bg-primary-foreground border-primary-foreground'
                                                    : 'border-muted-foreground'
                                            }`}>
                                                {selectedFixtures.includes(fixture.id) && (
                                                    <div className="w-2 h-2 bg-primary rounded-sm" />
                                                )}
                                            </div>
                                            <span className="text-sm">{fixture.name}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetEditDialog}>
                            Cancel
                        </Button>
                        <Button onClick={saveEditEffect}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {effects.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="flex flex-col items-center">
                        <div className="rounded-full bg-muted p-6 mb-4">
                            <Lightning size={48} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Effects Created</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                            {fixtures.length === 0
                                ? 'Add fixtures first, then create automated effects'
                                : 'Create effects to automate your lighting sequences'}
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {effects.map((effect) => (
                        <Card
                            key={effect.id}
                            className={`p-4 ${effect.isActive ? 'ring-2 ring-accent' : ''}`}
                        >
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        {getEffectIcon(effect.type)}
                                        <div>
                                            <h3 className="font-semibold">{effect.name}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {getEffectDescription(effect.type)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            onClick={() => openEditDialog(effect)}
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                        >
                                            <PencilSimple size={16} />
                                        </Button>
                                        <Button
                                            onClick={() => duplicateEffect(effect)}
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                        >
                                            <Copy size={16} />
                                        </Button>
                                        <Button
                                            onClick={() => deleteEffect(effect.id)}
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                        >
                                            <Trash size={16} className="text-destructive" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                    <Badge variant="secondary">{effect.type}</Badge>
                                    <Badge variant="outline">{effect.fixtureIds.length} fixtures</Badge>
                                    {effect.type === 'block-program' && effect.blocks && (
                                        <Badge variant="outline" className="gap-1">
                                            <Code size={12} />
                                            {effect.blocks.length} blocks
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {effect.type !== 'block-program' && (
                                        <>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <label className="text-muted-foreground">Speed</label>
                                                    <span className="font-mono text-primary font-semibold">
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
                                                    <label className="text-muted-foreground">Intensity</label>
                                                    <span className="font-mono text-primary font-semibold">
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
                                        </>
                                    )}
                                    {effect.type === 'block-program' && effect.blocks && effect.blocks.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="text-xs text-muted-foreground">
                                                <p className="font-semibold mb-1">Program blocks:</p>
                                                <ul className="space-y-0.5">
                                                    {effect.blocks.slice(0, 3).map((block, idx) => (
                                                        <li key={block.id}>
                                                            {idx + 1}. {BLOCK_TYPES_MAP[block.type] || block.type}
                                                        </li>
                                                    ))}
                                                    {effect.blocks.length > 3 && (
                                                        <li>... and {effect.blocks.length - 3} more</li>
                                                    )}
                                                </ul>
                                            </div>
                                            <div className="bg-accent/20 rounded border border-accent/40 p-2 mt-2">
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <Lightning size={14} className="text-accent-foreground flex-shrink-0" />
                                                    <span className="font-mono text-[10px]">
                                                        {getEffectSummary(compileBlocks(effect.blocks))}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    onClick={() => toggleEffect(effect.id)}
                                    variant={effect.isActive ? 'default' : 'outline'}
                                    className="w-full gap-2"
                                >
                                    {effect.isActive ? (
                                        <>
                                            <Pause weight="fill" />
                                            Stop
                                        </>
                                    ) : (
                                        <>
                                            <Play weight="fill" />
                                            Start
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
