import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Palette, Drop } from '@phosphor-icons/react'
import { useState } from 'react'

interface ColorPickerBlockProps {
    red: number
    green: number
    blue: number
    white?: number
    onColorChange: (color: { red: number; green: number; blue: number; white?: number }) => void
    hasWhite?: boolean
    variant?: 'default' | 'compact'
}

const presetColors = [
    { name: 'Cervena', r: 255, g: 0, b: 0 },
    { name: 'Zelena', r: 0, g: 255, b: 0 },
    { name: 'Modra', r: 0, g: 0, b: 255 },
    { name: 'Zluta', r: 255, g: 255, b: 0 },
    { name: 'Cyan', r: 0, g: 255, b: 255 },
    { name: 'Magenta', r: 255, g: 0, b: 255 },
    { name: 'Bila', r: 255, g: 255, b: 255 },
    { name: 'Tepla bila', r: 255, g: 200, b: 150 },
]

export function ColorPickerBlock({
    red,
    green,
    blue,
    white = 0,
    onColorChange,
    hasWhite = false,
    variant = 'default',
}: ColorPickerBlockProps) {
    const [showPresets, setShowPresets] = useState(false)

    const currentColor = `rgb(${red}, ${green}, ${blue})`

    const handlePresetClick = (preset: { r: number; g: number; b: number }) => {
        onColorChange({
            red: preset.r,
            green: preset.g,
            blue: preset.b,
            ...(hasWhite && { white: 0 }),
        })
    }

    if (variant === 'compact') {
        return (
            <Card className="p-3">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-md border-2 border-border shadow-sm"
                            style={{ backgroundColor: currentColor }}
                        />
                        <span className="text-sm font-medium">Barva RGB{hasWhite ? 'W' : ''}</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <Slider
                                value={[red]}
                                onValueChange={(v) => onColorChange({ red: v[0], green, blue, ...(hasWhite && { white }) })}
                                max={255}
                                className="flex-1"
                            />
                            <span className="text-xs font-mono w-8 text-right">{red}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <Slider
                                value={[green]}
                                onValueChange={(v) => onColorChange({ red, green: v[0], blue, ...(hasWhite && { white }) })}
                                max={255}
                                className="flex-1"
                            />
                            <span className="text-xs font-mono w-8 text-right">{green}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <Slider
                                value={[blue]}
                                onValueChange={(v) => onColorChange({ red, green, blue: v[0], ...(hasWhite && { white }) })}
                                max={255}
                                className="flex-1"
                            />
                            <span className="text-xs font-mono w-8 text-right">{blue}</span>
                        </div>
                        {hasWhite && (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-white border" />
                                <Slider
                                    value={[white]}
                                    onValueChange={(v) => onColorChange({ red, green, blue, white: v[0] })}
                                    max={255}
                                    className="flex-1"
                                />
                                <span className="text-xs font-mono w-8 text-right">{white}</span>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card className="p-4">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-lg border-2 border-border shadow-md"
                            style={{ backgroundColor: currentColor }}
                        />
                        <div>
                            <h3 className="font-semibold flex items-center gap-2">
                                <Palette size={18} />
                                RGB{hasWhite ? 'W' : ''} Ovladani
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {red}, {green}, {blue}{hasWhite ? `, ${white}` : ''}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPresets(!showPresets)}
                        className="gap-2"
                    >
                        <Drop size={16} />
                        Predvolby
                    </Button>
                </div>

                {showPresets && (
                    <div className="grid grid-cols-4 gap-2">
                        {presetColors.map((preset) => (
                            <button
                                key={preset.name}
                                onClick={() => handlePresetClick(preset)}
                                className="aspect-square rounded-md border-2 border-border hover:border-primary transition-colors shadow-sm hover:shadow-md"
                                style={{ backgroundColor: `rgb(${preset.r}, ${preset.g}, ${preset.b})` }}
                                title={preset.name}
                            />
                        ))}
                    </div>
                )}

                <div className="space-y-3">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <label className="text-muted-foreground flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                Cervena
                            </label>
                            <span className="font-mono text-red-500 font-semibold">{red}</span>
                        </div>
                        <Slider
                            value={[red]}
                            onValueChange={(v) => onColorChange({ red: v[0], green, blue, ...(hasWhite && { white }) })}
                            max={255}
                            className="cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <label className="text-muted-foreground flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                Zelena
                            </label>
                            <span className="font-mono text-green-500 font-semibold">{green}</span>
                        </div>
                        <Slider
                            value={[green]}
                            onValueChange={(v) => onColorChange({ red, green: v[0], blue, ...(hasWhite && { white }) })}
                            max={255}
                            className="cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <label className="text-muted-foreground flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                Modra
                            </label>
                            <span className="font-mono text-blue-500 font-semibold">{blue}</span>
                        </div>
                        <Slider
                            value={[blue]}
                            onValueChange={(v) => onColorChange({ red, green, blue: v[0], ...(hasWhite && { white }) })}
                            max={255}
                            className="cursor-pointer"
                        />
                    </div>

                    {hasWhite && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <label className="text-muted-foreground flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-white border" />
                                    Bila
                                </label>
                                <span className="font-mono text-primary font-semibold">{white}</span>
                            </div>
                            <Slider
                                value={[white]}
                                onValueChange={(v) => onColorChange({ red, green, blue, white: v[0] })}
                                max={255}
                                className="cursor-pointer"
                            />
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}
