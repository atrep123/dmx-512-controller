import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Plus,
    Trash,
    ArrowUp,
    ArrowDown,
    DotsSixVertical,
    Lightning,
    Sparkle,
    Fire,
    Waves,
    Palette,
    Faders,
    Lightbulb,
    Target,
} from '@phosphor-icons/react'
import { Effect, Fixture, StepperMotor, Servo } from '@/lib/types'
import {
    ChannelSliderBlock,
    ColorPickerBlock,
    ToggleButtonBlock,
    ButtonPadBlock,
    PositionControlBlock,
    IntensityFaderBlock,
} from '@/components/controls'
import { toast } from 'sonner'

interface ControlBlock {
    id: string
    type: 'toggle' | 'slider' | 'color' | 'buttonPad' | 'position' | 'intensity'
    title: string
    effectId?: string
    fixtureId?: string
    motorId?: string
    servoId?: string
    channelNumber?: number
    variant?: string
    config?: Record<string, any>
}

interface CustomPageBuilderProps {
    effects: Effect[]
    fixtures: Fixture[]
    stepperMotors: StepperMotor[]
    servos: Servo[]
    setEffects: (effects: Effect[] | ((prev: Effect[]) => Effect[])) => void
    setFixtures: (fixtures: Fixture[] | ((prev: Fixture[]) => Fixture[])) => void
    setStepperMotors: (motors: StepperMotor[] | ((prev: StepperMotor[]) => StepperMotor[])) => void
    setServos: (servos: Servo[] | ((prev: Servo[]) => Servo[])) => void
}

export default function CustomPageBuilder({
    effects,
    fixtures,
    stepperMotors,
    servos,
    setEffects,
    setFixtures,
    setStepperMotors,
    setServos,
}: CustomPageBuilderProps) {
    const [controlBlocks, setControlBlocks] = useKV<ControlBlock[]>('custom-page-blocks', [])
    const [editMode, setEditMode] = useState(false)
    const [selectedBlock, setSelectedBlock] = useState<ControlBlock | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

    const [newBlock, setNewBlock] = useState<Partial<ControlBlock>>({
        type: 'toggle',
        title: '',
    })

    const addBlock = () => {
        if (!newBlock.title) {
            toast.error('Zadejte název bloku')
            return
        }

        const block: ControlBlock = {
            id: `block-${Date.now()}`,
            type: newBlock.type as ControlBlock['type'],
            title: newBlock.title,
            effectId: newBlock.effectId,
            fixtureId: newBlock.fixtureId,
            motorId: newBlock.motorId,
            servoId: newBlock.servoId,
            channelNumber: newBlock.channelNumber,
            variant: newBlock.variant || 'default',
            config: newBlock.config || {},
        }

        setControlBlocks((prev) => [...(prev || []), block])
        setNewBlock({ type: 'toggle', title: '' })
        setIsDialogOpen(false)
        toast.success('Blok přidán')
    }

    const removeBlock = (id: string) => {
        setControlBlocks((prev) => (prev || []).filter((b) => b.id !== id))
        toast.success('Blok odstraněn')
    }

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        setControlBlocks((prev) => {
            if (!prev) return []
            const newBlocks = [...prev]
            const targetIndex = direction === 'up' ? index - 1 : index + 1
            if (targetIndex < 0 || targetIndex >= newBlocks.length) return prev
            ;[newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]]
            return newBlocks
        })
    }

    const handleDragStart = (index: number) => {
        setDraggedIndex(index)
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        if (draggedIndex === null || draggedIndex === index) return

        setControlBlocks((prev) => {
            if (!prev) return []
            const newBlocks = [...prev]
            const draggedBlock = newBlocks[draggedIndex]
            newBlocks.splice(draggedIndex, 1)
            newBlocks.splice(index, 0, draggedBlock)
            return newBlocks
        })
        setDraggedIndex(index)
    }

    const handleDragEnd = () => {
        setDraggedIndex(null)
    }

    const openEditDialog = (block: ControlBlock) => {
        setSelectedBlock(block)
        setNewBlock({ ...block })
        setIsDialogOpen(true)
    }

    const updateBlock = () => {
        if (!selectedBlock || !newBlock.title) {
            toast.error('Zadejte název bloku')
            return
        }

        setControlBlocks((prev) =>
            (prev || []).map((b) =>
                b.id === selectedBlock.id
                    ? {
                          ...b,
                          title: newBlock.title!,
                          effectId: newBlock.effectId,
                          fixtureId: newBlock.fixtureId,
                          motorId: newBlock.motorId,
                          servoId: newBlock.servoId,
                          channelNumber: newBlock.channelNumber,
                          variant: newBlock.variant,
                          config: newBlock.config,
                      }
                    : b
            )
        )
        setSelectedBlock(null)
        setNewBlock({ type: 'toggle', title: '' })
        setIsDialogOpen(false)
        toast.success('Blok aktualizován')
    }

    const renderBlock = (block: ControlBlock, index: number) => {
        const effect = effects.find((e) => e.id === block.effectId)
        const fixture = fixtures.find((f) => f.id === block.fixtureId)
        const motor = stepperMotors.find((m) => m.id === block.motorId)
        const servo = servos.find((s) => s.id === block.servoId)

        const toggleEffect = () => {
            if (!effect) return
            setEffects((prev) =>
                prev.map((e) => (e.id === effect.id ? { ...e, isActive: !e.isActive } : e))
            )
        }

        const updateFixtureChannel = (channelNum: number, value: number) => {
            if (!fixture) return
            setFixtures((prev) =>
                prev.map((f) =>
                    f.id === fixture.id
                        ? {
                              ...f,
                              channels: f.channels.map((ch) =>
                                  ch.number === channelNum ? { ...ch, value } : ch
                              ),
                          }
                        : f
                )
            )
        }

        const updateFixtureColor = (r: number, g: number, b: number, w?: number) => {
            if (!fixture) return
            setFixtures((prev) =>
                prev.map((f) => {
                    if (f.id !== fixture.id) return f
                    const channels = [...f.channels]
                    const rCh = channels.find((ch) => ch.name.toLowerCase().includes('red'))
                    const gCh = channels.find((ch) => ch.name.toLowerCase().includes('green'))
                    const bCh = channels.find((ch) => ch.name.toLowerCase().includes('blue'))
                    const wCh = channels.find((ch) => ch.name.toLowerCase().includes('white'))

                    return {
                        ...f,
                        channels: channels.map((ch) => {
                            if (ch.id === rCh?.id) return { ...ch, value: r }
                            if (ch.id === gCh?.id) return { ...ch, value: g }
                            if (ch.id === bCh?.id) return { ...ch, value: b }
                            if (w !== undefined && ch.id === wCh?.id) return { ...ch, value: w }
                            return ch
                        }),
                    }
                })
            )
        }

        if (editMode) {
            return (
                <Card
                    key={block.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className="p-4 cursor-move hover:ring-2 hover:ring-accent transition-all"
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <DotsSixVertical size={20} className="text-muted-foreground" />
                            <div>
                                <h3 className="font-semibold">{block.title}</h3>
                                <p className="text-xs text-muted-foreground">
                                    Typ: {block.type}
                                    {effect && ` - ${effect.name}`}
                                    {fixture && ` - ${fixture.name}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditDialog(block)}
                            >
                                Upravit
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => moveBlock(index, 'up')}
                                disabled={index === 0}
                            >
                                <ArrowUp size={16} />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => moveBlock(index, 'down')}
                                disabled={index === (controlBlocks || []).length - 1}
                            >
                                <ArrowDown size={16} />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeBlock(block.id)}
                            >
                                <Trash size={16} />
                            </Button>
                        </div>
                    </div>
                </Card>
            )
        }

        switch (block.type) {
            case 'toggle':
                return (
                    <div key={block.id}>
                        <ToggleButtonBlock
                            label={block.title}
                            active={effect?.isActive || false}
                            onToggle={toggleEffect}
                            icon={<Lightning size={24} />}
                            activeIcon={<Lightning size={24} weight="fill" />}
                            variant={block.variant as any}
                            effectId={block.effectId}
                            onEffectChange={() => openEditDialog(block)}
                            showEdit={true}
                        />
                    </div>
                )

            case 'slider':
                if (!fixture || block.channelNumber === undefined) return null
                const channel = fixture.channels.find((ch) => ch.number === block.channelNumber)
                return (
                    <div key={block.id}>
                        <ChannelSliderBlock
                            label={block.title}
                            value={channel?.value || 0}
                            onChange={(val) => updateFixtureChannel(block.channelNumber!, val)}
                            variant={block.variant as any}
                            icon={<Faders size={16} />}
                        />
                    </div>
                )

            case 'color':
                if (!fixture) return null
                const rCh = fixture.channels.find((ch) =>
                    ch.name.toLowerCase().includes('red')
                )
                const gCh = fixture.channels.find((ch) =>
                    ch.name.toLowerCase().includes('green')
                )
                const bCh = fixture.channels.find((ch) =>
                    ch.name.toLowerCase().includes('blue')
                )
                const wCh = fixture.channels.find((ch) =>
                    ch.name.toLowerCase().includes('white')
                )
                return (
                    <div key={block.id}>
                        <ColorPickerBlock
                            red={rCh?.value || 0}
                            green={gCh?.value || 0}
                            blue={bCh?.value || 0}
                            white={wCh?.value}
                            hasWhite={!!wCh}
                            onColorChange={(color) =>
                                updateFixtureColor(color.red, color.green, color.blue, color.white)
                            }
                            variant={block.variant as any}
                        />
                    </div>
                )

            case 'intensity':
                if (!fixture || block.channelNumber === undefined) return null
                const intensityChannel = fixture.channels.find(
                    (ch) => ch.number === block.channelNumber
                )
                return (
                    <div key={block.id}>
                        <IntensityFaderBlock
                            value={intensityChannel?.value || 0}
                            onChange={(val) => updateFixtureChannel(block.channelNumber!, val)}
                            variant={block.variant as any}
                        />
                    </div>
                )

            case 'position':
                if (!fixture) return null
                const panCh = fixture.channels.find((ch) => ch.name.toLowerCase().includes('pan'))
                const tiltCh = fixture.channels.find((ch) =>
                    ch.name.toLowerCase().includes('tilt')
                )
                if (!panCh || !tiltCh) return null
                return (
                    <div key={block.id}>
                        <PositionControlBlock
                            panValue={panCh.value}
                            tiltValue={tiltCh.value}
                            onPanChange={(val) => updateFixtureChannel(panCh.number, val)}
                            onTiltChange={(val) => updateFixtureChannel(tiltCh.number, val)}
                            title={block.title}
                            variant={block.variant as any}
                        />
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Vlastní ovládací stránka</h2>
                    <p className="text-sm text-muted-foreground">
                        Vytvořte si vlastní rozvržení ovládacích prvků
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={editMode ? 'default' : 'outline'}
                        onClick={() => setEditMode(!editMode)}
                    >
                        {editMode ? 'Hotovo' : 'Upravit'}
                    </Button>
                    {editMode && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => setSelectedBlock(null)}>
                                    <Plus className="mr-2" size={16} />
                                    Přidat blok
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh]">
                                <DialogHeader>
                                    <DialogTitle>
                                        {selectedBlock ? 'Upravit blok' : 'Přidat nový blok'}
                                    </DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="max-h-[70vh] pr-4">
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Název bloku</Label>
                                            <Input
                                                value={newBlock.title || ''}
                                                onChange={(e) =>
                                                    setNewBlock({ ...newBlock, title: e.target.value })
                                                }
                                                placeholder="Například: Hlavní stroboskop"
                                            />
                                        </div>

                                        <div>
                                            <Label>Typ bloku</Label>
                                            <Select
                                                value={newBlock.type}
                                                onValueChange={(value) =>
                                                    setNewBlock({ ...newBlock, type: value as any })
                                                }
                                                disabled={!!selectedBlock}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="toggle">
                                                        Přepínač (Toggle)
                                                    </SelectItem>
                                                    <SelectItem value="slider">
                                                        Posuvník (Slider)
                                                    </SelectItem>
                                                    <SelectItem value="color">
                                                        Výběr barvy (Color Picker)
                                                    </SelectItem>
                                                    <SelectItem value="intensity">
                                                        Intenzita (Fader)
                                                    </SelectItem>
                                                    <SelectItem value="position">
                                                        Pozice (Pan/Tilt)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label>Varianta</Label>
                                            <Select
                                                value={newBlock.variant || 'default'}
                                                onValueChange={(value) =>
                                                    setNewBlock({ ...newBlock, variant: value })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="default">Výchozí</SelectItem>
                                                    <SelectItem value="large">Velká</SelectItem>
                                                    <SelectItem value="compact">Kompaktní</SelectItem>
                                                    <SelectItem value="minimal">Minimální</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {newBlock.type === 'toggle' && (
                                            <div>
                                                <Label>Efekt</Label>
                                                <Select
                                                    value={newBlock.effectId || ''}
                                                    onValueChange={(value) =>
                                                        setNewBlock({ ...newBlock, effectId: value })
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Vyberte efekt" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {effects.map((effect) => (
                                                            <SelectItem key={effect.id} value={effect.id}>
                                                                {effect.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {(newBlock.type === 'slider' ||
                                            newBlock.type === 'color' ||
                                            newBlock.type === 'intensity' ||
                                            newBlock.type === 'position') && (
                                            <div>
                                                <Label>Světlo</Label>
                                                <Select
                                                    value={newBlock.fixtureId || ''}
                                                    onValueChange={(value) =>
                                                        setNewBlock({ ...newBlock, fixtureId: value })
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Vyberte světlo" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {fixtures.map((fixture) => (
                                                            <SelectItem
                                                                key={fixture.id}
                                                                value={fixture.id}
                                                            >
                                                                {fixture.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {(newBlock.type === 'slider' ||
                                            newBlock.type === 'intensity') &&
                                            newBlock.fixtureId && (
                                                <div>
                                                    <Label>Kanál</Label>
                                                    <Select
                                                        value={newBlock.channelNumber?.toString() || ''}
                                                        onValueChange={(value) =>
                                                            setNewBlock({
                                                                ...newBlock,
                                                                channelNumber: parseInt(value),
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Vyberte kanál" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {fixtures
                                                                .find((f) => f.id === newBlock.fixtureId)
                                                                ?.channels.map((ch) => (
                                                                    <SelectItem
                                                                        key={ch.id}
                                                                        value={ch.number.toString()}
                                                                    >
                                                                        Ch {ch.number}: {ch.name}
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                        <div className="flex gap-2 pt-4">
                                            <Button
                                                onClick={selectedBlock ? updateBlock : addBlock}
                                                className="flex-1"
                                            >
                                                {selectedBlock ? 'Uložit změny' : 'Přidat blok'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setIsDialogOpen(false)
                                                    setSelectedBlock(null)
                                                    setNewBlock({ type: 'toggle', title: '' })
                                                }}
                                            >
                                                Zrušit
                                            </Button>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {(controlBlocks || []).length === 0 ? (
                <Card className="p-12 text-center">
                    <Lightbulb size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Žádné ovládací bloky</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Přidejte své první ovládací bloky pro vytvoření vlastní stránky
                    </p>
                    <Button onClick={() => setEditMode(true)}>Začít upravovat</Button>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {(controlBlocks || []).map((block, index) => renderBlock(block, index))}
                </div>
            )}
        </div>
    )
}
