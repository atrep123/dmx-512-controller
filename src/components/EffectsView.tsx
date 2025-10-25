import { Effect, Fixture } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash, Lightning, Play, Pause, Sparkle } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

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
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [effectName, setEffectName] = useState('')
    const [effectType, setEffectType] = useState<Effect['type']>('chase')
    const [selectedFixtures, setSelectedFixtures] = useState<string[]>([])

    useEffect(() => {
        const interval = setInterval(() => {
            const activeEffects = effects.filter((e) => e.isActive)
            if (activeEffects.length === 0) return

            activeEffects.forEach((effect) => {
                applyEffect(effect)
            })
        }, 100)

        return () => clearInterval(interval)
    }, [effects])

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
            toast.error('Please enter an effect name')
            return
        }

        if (selectedFixtures.length === 0) {
            toast.error('Please select at least one fixture')
            return
        }

        const newEffect: Effect = {
            id: Date.now().toString(),
            name: effectName.trim(),
            type: effectType,
            fixtureIds: selectedFixtures,
            speed: 50,
            intensity: 100,
            isActive: false,
            parameters: {},
        }

        setEffects((current) => [...current, newEffect])
        setEffectName('')
        setEffectType('chase')
        setSelectedFixtures([])
        setIsDialogOpen(false)
        toast.success(`Effect "${newEffect.name}" created`)
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
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold">Effects</h2>
                    <p className="text-sm text-muted-foreground">Automated lighting effects</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" disabled={fixtures.length === 0}>
                            <Plus weight="bold" />
                            Create Effect
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create Effect</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="effect-name">Effect Name</Label>
                                <Input
                                    id="effect-name"
                                    value={effectName}
                                    onChange={(e) => setEffectName(e.target.value)}
                                    placeholder="e.g., Main Chase, Strobe All"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="effect-type">Effect Type</Label>
                                <Select
                                    value={effectType}
                                    onValueChange={(value) => setEffectType(value as Effect['type'])}
                                >
                                    <SelectTrigger id="effect-type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="chase">Chase - Sequential activation</SelectItem>
                                        <SelectItem value="strobe">Strobe - Rapid flashing</SelectItem>
                                        <SelectItem value="rainbow">Rainbow - RGB cycling</SelectItem>
                                        <SelectItem value="fade">Fade - Smooth intensity</SelectItem>
                                        <SelectItem value="sweep">Sweep - Pan movement</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Select Fixtures</Label>
                                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-md p-3">
                                    {fixtures.length === 0 ? (
                                        <p className="text-sm text-muted-foreground col-span-2">
                                            No fixtures available
                                        </p>
                                    ) : (
                                        fixtures.map((fixture) => (
                                            <div
                                                key={fixture.id}
                                                className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-accent"
                                                onClick={() => toggleFixtureSelection(fixture.id)}
                                            >
                                                <Switch
                                                    checked={selectedFixtures.includes(fixture.id)}
                                                    onCheckedChange={() =>
                                                        toggleFixtureSelection(fixture.id)
                                                    }
                                                />
                                                <span className="text-sm">{fixture.name}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={addEffect}>Create Effect</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

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
                                    <Button
                                        onClick={() => deleteEffect(effect.id)}
                                        variant="ghost"
                                        size="icon"
                                    >
                                        <Trash className="text-destructive" />
                                    </Button>
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                    <Badge variant="secondary">{effect.type}</Badge>
                                    <Badge variant="outline">{effect.fixtureIds.length} fixtures</Badge>
                                </div>

                                <div className="space-y-3">
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
                                </div>

                                <Button
                                    onClick={() => toggleEffect(effect.id)}
                                    variant={effect.isActive ? 'default' : 'outline'}
                                    className="w-full gap-2"
                                >
                                    {effect.isActive ? (
                                        <>
                                            <Pause weight="fill" />
                                            Stop Effect
                                        </>
                                    ) : (
                                        <>
                                            <Play weight="fill" />
                                            Start Effect
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
