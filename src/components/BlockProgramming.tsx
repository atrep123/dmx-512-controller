import { EffectBlock } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Trash, ArrowUp, ArrowDown, Play, Palette, Clock, Lightning, ArrowsClockwise, Sparkle, Shuffle, CrosshairSimple } from '@phosphor-icons/react'
import { useState } from 'react'

interface BlockProgrammingProps {
    blocks: EffectBlock[]
    onBlocksChange: (blocks: EffectBlock[]) => void
}

const BLOCK_TYPES = [
    { 
        type: 'set-color' as const, 
        name: 'Set Color', 
        icon: Palette, 
        color: 'bg-blue-500/20 border-blue-500',
        description: 'Set RGB/RGBW color'
    },
    { 
        type: 'set-intensity' as const, 
        name: 'Set Intensity', 
        icon: Lightning, 
        color: 'bg-yellow-500/20 border-yellow-500',
        description: 'Set brightness level'
    },
    { 
        type: 'fade' as const, 
        name: 'Fade', 
        icon: Sparkle, 
        color: 'bg-purple-500/20 border-purple-500',
        description: 'Smooth fade transition'
    },
    { 
        type: 'wait' as const, 
        name: 'Wait', 
        icon: Clock, 
        color: 'bg-gray-500/20 border-gray-500',
        description: 'Pause execution'
    },
    { 
        type: 'chase-step' as const, 
        name: 'Chase Step', 
        icon: ArrowsClockwise, 
        color: 'bg-green-500/20 border-green-500',
        description: 'Activate one fixture'
    },
    { 
        type: 'strobe-pulse' as const, 
        name: 'Strobe', 
        icon: Lightning, 
        color: 'bg-red-500/20 border-red-500',
        description: 'Quick flash'
    },
    { 
        type: 'rainbow-shift' as const, 
        name: 'Rainbow', 
        icon: Palette, 
        color: 'bg-pink-500/20 border-pink-500',
        description: 'Shift hue'
    },
    { 
        type: 'random-color' as const, 
        name: 'Random Color', 
        icon: Shuffle, 
        color: 'bg-orange-500/20 border-orange-500',
        description: 'Random RGB'
    },
    { 
        type: 'pan-tilt' as const, 
        name: 'Pan/Tilt', 
        icon: CrosshairSimple, 
        color: 'bg-cyan-500/20 border-cyan-500',
        description: 'Moving head position'
    },
    { 
        type: 'loop-start' as const, 
        name: 'Loop Start', 
        icon: ArrowsClockwise, 
        color: 'bg-indigo-500/20 border-indigo-500',
        description: 'Begin loop'
    },
    { 
        type: 'loop-end' as const, 
        name: 'Loop End', 
        icon: ArrowsClockwise, 
        color: 'bg-indigo-500/20 border-indigo-500',
        description: 'End loop'
    },
]

export default function BlockProgramming({ blocks, onBlocksChange }: BlockProgrammingProps) {
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
    const [editingBlock, setEditingBlock] = useState<EffectBlock | null>(null)

    const addBlock = (type: EffectBlock['type']) => {
        const newBlock: EffectBlock = {
            id: Date.now().toString(),
            type,
            parameters: getDefaultParameters(type),
            order: blocks.length,
        }
        onBlocksChange([...blocks, newBlock])
    }

    const getDefaultParameters = (type: EffectBlock['type']) => {
        switch (type) {
            case 'set-color':
                return { red: 255, green: 255, blue: 255, white: 0 }
            case 'set-intensity':
                return { intensity: 100 }
            case 'fade':
                return { duration: 1000 }
            case 'wait':
                return { waitTime: 500 }
            case 'chase-step':
                return { fixtureIndex: 0, duration: 200 }
            case 'strobe-pulse':
                return { duration: 50 }
            case 'rainbow-shift':
                return { hueShift: 30, duration: 100 }
            case 'random-color':
                return {}
            case 'pan-tilt':
                return { pan: 128, tilt: 128 }
            case 'loop-start':
                return { loopCount: 3 }
            case 'loop-end':
                return {}
            default:
                return {}
        }
    }

    const deleteBlock = (blockId: string) => {
        onBlocksChange(blocks.filter(b => b.id !== blockId).map((b, idx) => ({ ...b, order: idx })))
        if (selectedBlockId === blockId) {
            setSelectedBlockId(null)
            setEditingBlock(null)
        }
    }

    const moveBlock = (blockId: string, direction: 'up' | 'down') => {
        const index = blocks.findIndex(b => b.id === blockId)
        if (index === -1) return
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === blocks.length - 1) return

        const newBlocks = [...blocks]
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        ;[newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]]
        
        onBlocksChange(newBlocks.map((b, idx) => ({ ...b, order: idx })))
    }

    const selectBlock = (block: EffectBlock) => {
        setSelectedBlockId(block.id)
        setEditingBlock({ ...block })
    }

    const updateParameter = (key: string, value: number | string) => {
        if (!editingBlock) return
        const updated = {
            ...editingBlock,
            parameters: { ...editingBlock.parameters, [key]: value }
        }
        setEditingBlock(updated)
        onBlocksChange(blocks.map(b => b.id === updated.id ? updated : b))
    }

    const getBlockInfo = (type: EffectBlock['type']) => {
        return BLOCK_TYPES.find(bt => bt.type === type)
    }

    const renderBlockEditor = () => {
        if (!editingBlock) return null

        const blockInfo = getBlockInfo(editingBlock.type)
        const Icon = blockInfo?.icon || Play

        return (
            <Card className="p-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Icon className="text-primary" />
                        <h3 className="font-semibold">{blockInfo?.name}</h3>
                    </div>

                    {editingBlock.type === 'set-color' && (
                        <>
                            <div className="space-y-2">
                                <Label>Red: {editingBlock.parameters.red}</Label>
                                <Slider
                                    value={[editingBlock.parameters.red || 0]}
                                    onValueChange={(v) => updateParameter('red', v[0])}
                                    max={255}
                                    step={1}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Green: {editingBlock.parameters.green}</Label>
                                <Slider
                                    value={[editingBlock.parameters.green || 0]}
                                    onValueChange={(v) => updateParameter('green', v[0])}
                                    max={255}
                                    step={1}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Blue: {editingBlock.parameters.blue}</Label>
                                <Slider
                                    value={[editingBlock.parameters.blue || 0]}
                                    onValueChange={(v) => updateParameter('blue', v[0])}
                                    max={255}
                                    step={1}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>White: {editingBlock.parameters.white}</Label>
                                <Slider
                                    value={[editingBlock.parameters.white || 0]}
                                    onValueChange={(v) => updateParameter('white', v[0])}
                                    max={255}
                                    step={1}
                                />
                            </div>
                            <div 
                                className="w-full h-12 rounded border-2"
                                style={{
                                    backgroundColor: `rgb(${editingBlock.parameters.red}, ${editingBlock.parameters.green}, ${editingBlock.parameters.blue})`
                                }}
                            />
                        </>
                    )}

                    {editingBlock.type === 'set-intensity' && (
                        <div className="space-y-2">
                            <Label>Intensity: {editingBlock.parameters.intensity}%</Label>
                            <Slider
                                value={[editingBlock.parameters.intensity || 0]}
                                onValueChange={(v) => updateParameter('intensity', v[0])}
                                max={100}
                                step={1}
                            />
                        </div>
                    )}

                    {editingBlock.type === 'fade' && (
                        <div className="space-y-2">
                            <Label>Duration (ms)</Label>
                            <Input
                                type="number"
                                value={editingBlock.parameters.duration || 0}
                                onChange={(e) => updateParameter('duration', parseInt(e.target.value) || 0)}
                                min={0}
                                step={50}
                            />
                        </div>
                    )}

                    {editingBlock.type === 'wait' && (
                        <div className="space-y-2">
                            <Label>Wait Time (ms)</Label>
                            <Input
                                type="number"
                                value={editingBlock.parameters.waitTime || 0}
                                onChange={(e) => updateParameter('waitTime', parseInt(e.target.value) || 0)}
                                min={0}
                                step={50}
                            />
                        </div>
                    )}

                    {editingBlock.type === 'chase-step' && (
                        <>
                            <div className="space-y-2">
                                <Label>Fixture Index</Label>
                                <Input
                                    type="number"
                                    value={editingBlock.parameters.fixtureIndex || 0}
                                    onChange={(e) => updateParameter('fixtureIndex', parseInt(e.target.value) || 0)}
                                    min={0}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Duration (ms)</Label>
                                <Input
                                    type="number"
                                    value={editingBlock.parameters.duration || 0}
                                    onChange={(e) => updateParameter('duration', parseInt(e.target.value) || 0)}
                                    min={0}
                                    step={50}
                                />
                            </div>
                        </>
                    )}

                    {editingBlock.type === 'strobe-pulse' && (
                        <div className="space-y-2">
                            <Label>Pulse Duration (ms)</Label>
                            <Input
                                type="number"
                                value={editingBlock.parameters.duration || 0}
                                onChange={(e) => updateParameter('duration', parseInt(e.target.value) || 0)}
                                min={10}
                                step={10}
                            />
                        </div>
                    )}

                    {editingBlock.type === 'rainbow-shift' && (
                        <>
                            <div className="space-y-2">
                                <Label>Hue Shift (degrees): {editingBlock.parameters.hueShift}</Label>
                                <Slider
                                    value={[editingBlock.parameters.hueShift || 0]}
                                    onValueChange={(v) => updateParameter('hueShift', v[0])}
                                    max={360}
                                    step={1}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Duration (ms)</Label>
                                <Input
                                    type="number"
                                    value={editingBlock.parameters.duration || 0}
                                    onChange={(e) => updateParameter('duration', parseInt(e.target.value) || 0)}
                                    min={0}
                                    step={50}
                                />
                            </div>
                        </>
                    )}

                    {editingBlock.type === 'pan-tilt' && (
                        <>
                            <div className="space-y-2">
                                <Label>Pan: {editingBlock.parameters.pan}</Label>
                                <Slider
                                    value={[editingBlock.parameters.pan || 0]}
                                    onValueChange={(v) => updateParameter('pan', v[0])}
                                    max={255}
                                    step={1}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tilt: {editingBlock.parameters.tilt}</Label>
                                <Slider
                                    value={[editingBlock.parameters.tilt || 0]}
                                    onValueChange={(v) => updateParameter('tilt', v[0])}
                                    max={255}
                                    step={1}
                                />
                            </div>
                        </>
                    )}

                    {editingBlock.type === 'loop-start' && (
                        <div className="space-y-2">
                            <Label>Loop Count</Label>
                            <Input
                                type="number"
                                value={editingBlock.parameters.loopCount || 1}
                                onChange={(e) => updateParameter('loopCount', parseInt(e.target.value) || 1)}
                                min={1}
                            />
                        </div>
                    )}
                </div>
            </Card>
        )
    }

    return (
        <div className="grid md:grid-cols-[300px_1fr_300px] gap-4">
            <Card className="p-4">
                <h3 className="font-semibold mb-4">Block Library</h3>
                <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                        {BLOCK_TYPES.map((blockType) => {
                            const Icon = blockType.icon
                            return (
                                <button
                                    key={blockType.type}
                                    onClick={() => addBlock(blockType.type)}
                                    className={`w-full p-3 rounded border-2 text-left transition-all hover:scale-105 ${blockType.color}`}
                                >
                                    <div className="flex items-start gap-2">
                                        <Icon size={20} className="mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="font-semibold text-sm">{blockType.name}</div>
                                            <div className="text-xs text-muted-foreground">{blockType.description}</div>
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </ScrollArea>
            </Card>

            <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Program</h3>
                    <Badge variant="secondary">{blocks.length} blocks</Badge>
                </div>
                <ScrollArea className="h-[500px]">
                    {blocks.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Plus size={48} className="mx-auto mb-2 opacity-50" />
                            <p>Add blocks from library</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {blocks.map((block, index) => {
                                const blockInfo = getBlockInfo(block.type)
                                const Icon = blockInfo?.icon || Play
                                const isSelected = selectedBlockId === block.id

                                return (
                                    <div
                                        key={block.id}
                                        onClick={() => selectBlock(block)}
                                        className={`p-3 rounded border-2 cursor-pointer transition-all ${
                                            isSelected 
                                                ? 'ring-2 ring-primary border-primary' 
                                                : 'hover:border-accent'
                                        } ${blockInfo?.color || 'bg-card'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 flex-1">
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    {index + 1}
                                                </Badge>
                                                <Icon size={18} />
                                                <span className="font-semibold text-sm">{blockInfo?.name}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        moveBlock(block.id, 'up')
                                                    }}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    disabled={index === 0}
                                                >
                                                    <ArrowUp size={14} />
                                                </Button>
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        moveBlock(block.id, 'down')
                                                    }}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    disabled={index === blocks.length - 1}
                                                >
                                                    <ArrowDown size={14} />
                                                </Button>
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        deleteBlock(block.id)
                                                    }}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                >
                                                    <Trash size={14} className="text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs text-muted-foreground font-mono">
                                            {JSON.stringify(block.parameters)}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </ScrollArea>
            </Card>

            <div>
                <h3 className="font-semibold mb-4">Block Editor</h3>
                {editingBlock ? (
                    renderBlockEditor()
                ) : (
                    <Card className="p-12 text-center">
                        <p className="text-sm text-muted-foreground">
                            Select a block to edit
                        </p>
                    </Card>
                )}
            </div>
        </div>
    )
}
