import { EffectBlock } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash, ArrowUp, ArrowDown, Play, Palette, Clock, Lightning, ArrowsClockwise, Sparkle, Shuffle, CrosshairSimple, Code, ListNumbers } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import { compileBlocks, getEffectSummary, type CompiledEffect } from '@/lib/blockCompiler'
import { cn } from '@/lib/utils'

interface BlockProgrammingProps {
    blocks: EffectBlock[]
    onBlocksChange: (blocks: EffectBlock[]) => void
}

const BLOCK_TYPES = [
    { 
        type: 'set-color' as const, 
        name: 'Nastavit barvu', 
        icon: Palette, 
        color: 'bg-gradient-to-r from-sky-500/15 via-sky-500/5 to-transparent text-sky-950 dark:text-sky-50 border border-sky-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
        description: 'Nastavit RGB/RGBW barvu'
    },
    { 
        type: 'set-intensity' as const, 
        name: 'Nastavit intenzitu', 
        icon: Lightning, 
        color: 'bg-gradient-to-r from-amber-400/15 via-amber-400/5 to-transparent text-amber-950 dark:text-amber-50 border border-amber-400/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
        description: 'Nastavit jas'
    },
    { 
        type: 'fade' as const, 
        name: 'Přechod', 
        icon: Sparkle, 
        color: 'bg-gradient-to-r from-violet-500/15 via-violet-500/5 to-transparent text-violet-950 dark:text-violet-50 border border-violet-500/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
        description: 'Plynulý přechod'
    },
    { 
        type: 'wait' as const, 
        name: 'Čekat', 
        icon: Clock, 
        color: 'bg-gradient-to-r from-slate-500/15 via-slate-500/5 to-transparent text-slate-900 dark:text-slate-100 border border-slate-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
        description: 'Pozastavit provádění'
    },
    { 
        type: 'chase-step' as const, 
        name: 'Krok Chase', 
        icon: ArrowsClockwise, 
        color: 'bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent text-emerald-950 dark:text-emerald-50 border border-emerald-500/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
        description: 'Aktivovat jedno světlo'
    },
    { 
        type: 'strobe-pulse' as const, 
        name: 'Stroboskop', 
        icon: Lightning, 
        color: 'bg-gradient-to-r from-rose-500/15 via-rose-500/5 to-transparent text-rose-950 dark:text-rose-50 border border-rose-500/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
        description: 'Rychlý záblesk'
    },
    { 
        type: 'rainbow-shift' as const, 
        name: 'Duha', 
        icon: Palette, 
        color: 'bg-gradient-to-r from-pink-500/15 via-pink-500/5 to-transparent text-pink-950 dark:text-pink-50 border border-pink-500/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
        description: 'Posunutí odstínu'
    },
    { 
        type: 'random-color' as const, 
        name: 'Náhodná barva', 
        icon: Shuffle, 
        color: 'bg-gradient-to-r from-orange-500/15 via-orange-500/5 to-transparent text-orange-950 dark:text-orange-50 border border-orange-500/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
        description: 'Náhodná RGB'
    },
    { 
        type: 'pan-tilt' as const, 
        name: 'Pan/Tilt', 
        icon: CrosshairSimple, 
        color: 'bg-gradient-to-r from-cyan-500/15 via-cyan-500/5 to-transparent text-cyan-900 dark:text-cyan-100 border border-cyan-500/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
        description: 'Pozice moving head'
    },
    { 
        type: 'loop-start' as const, 
        name: 'Začátek smyčky', 
        icon: ArrowsClockwise, 
        color: 'bg-gradient-to-r from-indigo-500/15 via-indigo-500/5 to-transparent text-indigo-900 dark:text-indigo-100 border border-indigo-500/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
        description: 'Začít smyčku'
    },
    { 
        type: 'loop-end' as const, 
        name: 'Konec smyčky', 
        icon: ArrowsClockwise, 
        color: 'bg-gradient-to-r from-indigo-500/15 via-indigo-500/5 to-transparent text-indigo-900 dark:text-indigo-100 border border-indigo-500/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
        description: 'Ukončit smyčku'
    },
]

export default function BlockProgramming({ blocks, onBlocksChange }: BlockProgrammingProps) {
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
    const [editingBlock, setEditingBlock] = useState<EffectBlock | null>(null)
    const [compiledEffect, setCompiledEffect] = useState<CompiledEffect | null>(null)

    useEffect(() => {
        if (blocks.length > 0) {
            const compiled = compileBlocks(blocks)
            setCompiledEffect(compiled)
        } else {
            setCompiledEffect(null)
        }
    }, [blocks])

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
            <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b">
                    <Icon className="text-primary" size={20} />
                    <h4 className="font-semibold text-sm">{blockInfo?.name}</h4>
                </div>

                {editingBlock.type === 'set-color' && (
                    <>
                        <div className="space-y-2">
                            <Label className="text-xs">Red: {editingBlock.parameters.red}</Label>
                            <Slider
                                value={[editingBlock.parameters.red || 0]}
                                onValueChange={(v) => updateParameter('red', v[0])}
                                max={255}
                                step={1}
                                className="cursor-pointer"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Green: {editingBlock.parameters.green}</Label>
                            <Slider
                                value={[editingBlock.parameters.green || 0]}
                                onValueChange={(v) => updateParameter('green', v[0])}
                                max={255}
                                step={1}
                                className="cursor-pointer"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Blue: {editingBlock.parameters.blue}</Label>
                            <Slider
                                value={[editingBlock.parameters.blue || 0]}
                                onValueChange={(v) => updateParameter('blue', v[0])}
                                max={255}
                                step={1}
                                className="cursor-pointer"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">White: {editingBlock.parameters.white}</Label>
                            <Slider
                                value={[editingBlock.parameters.white || 0]}
                                onValueChange={(v) => updateParameter('white', v[0])}
                                max={255}
                                step={1}
                                className="cursor-pointer"
                            />
                        </div>
                        <div 
                            className="w-full h-10 rounded border-2 mt-2"
                            style={{
                                backgroundColor: `rgb(${editingBlock.parameters.red}, ${editingBlock.parameters.green}, ${editingBlock.parameters.blue})`
                            }}
                        />
                    </>
                )}

                {editingBlock.type === 'set-intensity' && (
                    <div className="space-y-2">
                        <Label className="text-xs">Intensity: {editingBlock.parameters.intensity}%</Label>
                        <Slider
                            value={[editingBlock.parameters.intensity || 0]}
                            onValueChange={(v) => updateParameter('intensity', v[0])}
                            max={100}
                            step={1}
                            className="cursor-pointer"
                        />
                    </div>
                )}

                {editingBlock.type === 'fade' && (
                    <div className="space-y-2">
                        <Label className="text-xs">Duration (ms)</Label>
                        <Input
                            type="number"
                            value={editingBlock.parameters.duration || 0}
                            onChange={(e) => updateParameter('duration', parseInt(e.target.value) || 0)}
                            min={0}
                            step={50}
                            className="text-sm"
                        />
                    </div>
                )}

                {editingBlock.type === 'wait' && (
                    <div className="space-y-2">
                        <Label className="text-xs">Wait Time (ms)</Label>
                        <Input
                            type="number"
                            value={editingBlock.parameters.waitTime || 0}
                            onChange={(e) => updateParameter('waitTime', parseInt(e.target.value) || 0)}
                            min={0}
                            step={50}
                            className="text-sm"
                        />
                    </div>
                )}

                {editingBlock.type === 'chase-step' && (
                    <>
                        <div className="space-y-2">
                            <Label className="text-xs">Fixture Index</Label>
                            <Input
                                type="number"
                                value={editingBlock.parameters.fixtureIndex || 0}
                                onChange={(e) => updateParameter('fixtureIndex', parseInt(e.target.value) || 0)}
                                min={0}
                                className="text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Duration (ms)</Label>
                            <Input
                                type="number"
                                value={editingBlock.parameters.duration || 0}
                                onChange={(e) => updateParameter('duration', parseInt(e.target.value) || 0)}
                                min={0}
                                step={50}
                                className="text-sm"
                            />
                        </div>
                    </>
                )}

                {editingBlock.type === 'strobe-pulse' && (
                    <div className="space-y-2">
                        <Label className="text-xs">Pulse Duration (ms)</Label>
                        <Input
                            type="number"
                            value={editingBlock.parameters.duration || 0}
                            onChange={(e) => updateParameter('duration', parseInt(e.target.value) || 0)}
                            min={10}
                            step={10}
                            className="text-sm"
                        />
                    </div>
                )}

                {editingBlock.type === 'rainbow-shift' && (
                    <>
                        <div className="space-y-2">
                            <Label className="text-xs">Hue Shift (degrees): {editingBlock.parameters.hueShift}</Label>
                            <Slider
                                value={[editingBlock.parameters.hueShift || 0]}
                                onValueChange={(v) => updateParameter('hueShift', v[0])}
                                max={360}
                                step={1}
                                className="cursor-pointer"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Duration (ms)</Label>
                            <Input
                                type="number"
                                value={editingBlock.parameters.duration || 0}
                                onChange={(e) => updateParameter('duration', parseInt(e.target.value) || 0)}
                                min={0}
                                step={50}
                                className="text-sm"
                            />
                        </div>
                    </>
                )}

                {editingBlock.type === 'pan-tilt' && (
                    <>
                        <div className="space-y-2">
                            <Label className="text-xs">Pan: {editingBlock.parameters.pan}</Label>
                            <Slider
                                value={[editingBlock.parameters.pan || 0]}
                                onValueChange={(v) => updateParameter('pan', v[0])}
                                max={255}
                                step={1}
                                className="cursor-pointer"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Tilt: {editingBlock.parameters.tilt}</Label>
                            <Slider
                                value={[editingBlock.parameters.tilt || 0]}
                                onValueChange={(v) => updateParameter('tilt', v[0])}
                                max={255}
                                step={1}
                                className="cursor-pointer"
                            />
                        </div>
                    </>
                )}

                {editingBlock.type === 'loop-start' && (
                    <div className="space-y-2">
                        <Label className="text-xs">Loop Count</Label>
                        <Input
                            type="number"
                            value={editingBlock.parameters.loopCount || 1}
                            onChange={(e) => updateParameter('loopCount', parseInt(e.target.value) || 1)}
                            min={1}
                            className="text-sm"
                        />
                    </div>
                )}

                {editingBlock.type === 'loop-end' && (
                    <p className="text-xs text-muted-foreground italic">No parameters for Loop End block</p>
                )}

                {editingBlock.type === 'random-color' && (
                    <p className="text-xs text-muted-foreground italic">No parameters - generates random RGB values</p>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="grid lg:grid-cols-[280px_1fr] gap-4">
                <Card className="p-4 h-fit">
                    <h3 className="font-semibold mb-3 text-sm">Block Library</h3>
                    <ScrollArea className="h-[400px] pr-3">
                        <div className="space-y-2">
                            {BLOCK_TYPES.map((blockType) => {
                                const Icon = blockType.icon
                                const accentClass =
                                    blockType.color ||
                                    'bg-card/70 text-foreground border border-border/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                                return (
                                    <button
                                        key={blockType.type}
                                        onClick={() => addBlock(blockType.type)}
                                        data-testid={`block-library-${blockType.type}`}
                                        className={cn(
                                            'group w-full rounded-xl bg-card/70 p-3 text-left shadow-sm transition hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                            accentClass
                                        )}
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className="rounded-lg bg-white/20 p-1.5 text-white dark:text-white/90 shadow-inner">
                                                <Icon size={16} className="shrink-0" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-semibold text-xs truncate">{blockType.name}</div>
                                                <div className="text-[10px] text-muted-foreground/90 leading-tight">
                                                    {blockType.description}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </ScrollArea>
                </Card>

                <div className="space-y-4">
                    <Tabs defaultValue="blocks" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="blocks" className="gap-2">
                                <ListNumbers size={16} />
                                Blocks
                            </TabsTrigger>
                            <TabsTrigger value="compiled" className="gap-2">
                                <Code size={16} />
                                Compiled
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="blocks" className="mt-4">
                            <Card className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm">Program Sequence</h3>
                                    <Badge variant="secondary" className="text-xs">{blocks.length} blocks</Badge>
                                </div>
                                <ScrollArea className="h-[400px] pr-3">
                                    {blocks.length === 0 ? (
                                        <div className="text-center py-16 text-muted-foreground">
                                            <Plus size={40} className="mx-auto mb-2 opacity-30" />
                                            <p className="text-sm">Click blocks from the library to add them</p>
                                            <p className="text-xs mt-1 opacity-70">Build your custom effect sequence</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {blocks.map((block, index) => {
                                            const blockInfo = getBlockInfo(block.type)
                                            const Icon = blockInfo?.icon || Play
                                            const isSelected = selectedBlockId === block.id
                                            const accentClass =
                                                blockInfo?.color ||
                                                'bg-card/70 text-foreground border border-border/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'

                                            return (
                                                <div
                                                    key={block.id}
                                                    onClick={() => selectBlock(block)}
                                                    data-testid={`block-sequence-${block.id}`}
                                                    className={cn(
                                                        'group rounded-xl p-3 cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                                        accentClass,
                                                        isSelected
                                                            ? 'ring-2 ring-primary/60 ring-offset-2 ring-offset-background shadow-lg'
                                                            : 'hover:-translate-y-0.5 hover:shadow-md'
                                                    )}
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <Badge
                                                                    variant="outline"
                                                                    className="font-mono text-[10px] px-1.5 py-0 h-5 flex-shrink-0 border border-white/30 dark:border-white/20 bg-white/10 text-black/70 dark:text-white/80"
                                                                >
                                                                    {index + 1}
                                                                </Badge>
                                                                <Icon size={16} className="flex-shrink-0" />
                                                                <span className="font-semibold text-xs truncate">{blockInfo?.name}</span>
                                                            </div>
                                                            <div className="flex gap-0.5 flex-shrink-0">
                                                                <Button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        moveBlock(block.id, 'up')
                                                                    }}
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6"
                                                                    disabled={index === 0}
                                                                >
                                                                    <ArrowUp size={12} />
                                                                </Button>
                                                                <Button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        moveBlock(block.id, 'down')
                                                                    }}
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6"
                                                                    disabled={index === blocks.length - 1}
                                                                >
                                                                    <ArrowDown size={12} />
                                                                </Button>
                                                                <Button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        deleteBlock(block.id)
                                                                    }}
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6"
                                                                >
                                                                    <Trash size={12} className="text-destructive" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="mt-1.5 text-[10px] text-muted-foreground font-mono pl-7 truncate">
                                                            {Object.entries(block.parameters).length > 0 
                                                                ? Object.entries(block.parameters)
                                                                    .map(([key, value]) => `${key}: ${value}`)
                                                                    .join(', ')
                                                                : 'No parameters'}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </ScrollArea>
                            </Card>
                        </TabsContent>

                        <TabsContent value="compiled" className="mt-4">
                            <Card className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm">Compiled Code</h3>
                                    {compiledEffect && (
                                        <Badge variant="secondary" className="text-xs font-mono">
                                            {getEffectSummary(compiledEffect)}
                                        </Badge>
                                    )}
                                </div>
                                <ScrollArea className="h-[400px]">
                                    {!compiledEffect || blocks.length === 0 ? (
                                        <div className="text-center py-16 text-muted-foreground">
                                            <Code size={40} className="mx-auto mb-2 opacity-30" />
                                            <p className="text-sm">No blocks to compile</p>
                                            <p className="text-xs mt-1 opacity-70">Add blocks to see compiled output</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="bg-muted/30 rounded-lg p-4 border">
                                                <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                                                    {compiledEffect.compiled}
                                                </pre>
                                            </div>
                                            
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 text-center">
                                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                        {compiledEffect.blockCount}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">Blocks</div>
                                                </div>
                                                <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3 text-center">
                                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                        {compiledEffect.loopCount}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">Loops</div>
                                                </div>
                                                <div className="bg-green-500/10 border border-green-500/30 rounded p-3 text-center">
                                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                        {(compiledEffect.estimatedDuration / 1000).toFixed(1)}s
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">Duration</div>
                                                </div>
                                            </div>

                                            <div className="bg-accent/30 rounded-lg p-3 border border-accent">
                                                <div className="flex items-start gap-2">
                                                    <Lightning size={16} className="text-accent-foreground mt-0.5 flex-shrink-0" />
                                                    <div className="text-xs text-muted-foreground">
                                                        <p className="font-semibold text-foreground mb-1">Optimization Applied</p>
                                                        <p>Program compiled successfully with {compiledEffect.instructions.length} instructions. Ready for execution.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </ScrollArea>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {editingBlock && (
                        <Card className="p-4">
                            <h3 className="font-semibold mb-3 text-sm">Edit Block</h3>
                            {renderBlockEditor()}
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
