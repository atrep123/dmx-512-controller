import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lightbulb, LightbulbFilament, Moon } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'

interface IntensityFaderBlockProps {
    value: number
    onChange: (value: number) => void
    label?: string
    variant?: 'default' | 'vertical' | 'compact'
    showPresets?: boolean
}

export function IntensityFaderBlock({
    value,
    onChange,
    label = 'Intenzita',
    variant = 'default',
    showPresets = true,
}: IntensityFaderBlockProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const width = canvas.width
        const height = canvas.height

        ctx.clearRect(0, 0, width, height)

        const gradient = ctx.createLinearGradient(0, height, 0, 0)
        gradient.addColorStop(0, 'rgba(101, 143, 241, 0.1)')
        gradient.addColorStop(1, 'rgba(101, 143, 241, 0.8)')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)

        const fillHeight = (value / 255) * height
        const fillGradient = ctx.createLinearGradient(0, height, 0, 0)
        fillGradient.addColorStop(0, '#4a6bb8')
        fillGradient.addColorStop(1, '#658ff1')
        ctx.fillStyle = fillGradient
        ctx.fillRect(0, height - fillHeight, width, fillHeight)

        ctx.strokeStyle = 'rgba(101, 143, 241, 0.5)'
        ctx.lineWidth = 2
        ctx.strokeRect(1, 1, width - 2, height - 2)

        const steps = 10
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.lineWidth = 1
        for (let i = 1; i < steps; i++) {
            const y = (i / steps) * height
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(width, y)
            ctx.stroke()
        }
    }, [value])

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDragging) return
        updateValue(e)
    }

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        setIsDragging(true)
        updateValue(e)
    }

    const handlePointerUp = () => {
        setIsDragging(false)
    }

    const updateValue = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const y = e.clientY - rect.top
        const percentage = 1 - Math.max(0, Math.min(1, y / rect.height))
        const newValue = Math.round(percentage * 255)
        onChange(newValue)
    }

    const presets = [
        { label: '100%', value: 255, icon: <Lightbulb weight="fill" /> },
        { label: '75%', value: 191, icon: <LightbulbFilament /> },
        { label: '50%', value: 127, icon: <LightbulbFilament /> },
        { label: '25%', value: 64, icon: <Moon /> },
        { label: '0%', value: 0, icon: <Moon weight="fill" /> },
    ]

    if (variant === 'compact') {
        return (
            <Card className="p-3">
                <div className="flex items-center gap-3">
                    <canvas
                        ref={canvasRef}
                        width={60}
                        height={120}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        className="rounded cursor-pointer touch-none"
                        style={{ touchAction: 'none' }}
                    />
                    <div className="flex-1 space-y-2">
                        <div>
                            <div className="text-sm font-medium">{label}</div>
                            <div className="text-2xl font-mono font-bold text-primary">{value}</div>
                            <div className="text-xs text-muted-foreground">
                                {Math.round((value / 255) * 100)}%
                            </div>
                        </div>
                        {showPresets && (
                            <div className="flex gap-1">
                                {[255, 127, 0].map((preset) => (
                                    <Button
                                        key={preset}
                                        onClick={() => onChange(preset)}
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 text-xs"
                                    >
                                        {Math.round((preset / 255) * 100)}%
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        )
    }

    if (variant === 'vertical') {
        return (
            <Card className="p-4 inline-block">
                <div className="flex flex-col items-center gap-3">
                    <div className="text-center">
                        <div className="text-sm font-medium text-muted-foreground">{label}</div>
                        <div className="text-3xl font-mono font-bold text-primary mt-1">{value}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            {Math.round((value / 255) * 100)}%
                        </div>
                    </div>

                    <canvas
                        ref={canvasRef}
                        width={80}
                        height={300}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        className="rounded-lg cursor-pointer touch-none shadow-inner"
                        style={{ touchAction: 'none' }}
                    />

                    {showPresets && (
                        <div className="space-y-2 w-full">
                            {presets.map((preset) => (
                                <Button
                                    key={preset.value}
                                    onClick={() => onChange(preset.value)}
                                    variant={value === preset.value ? 'default' : 'outline'}
                                    size="sm"
                                    className="w-full gap-2"
                                >
                                    {preset.icon}
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        )
    }

    return (
        <Card className="p-6">
            <div className="space-y-4">
                <div className="text-center">
                    <h3 className="text-lg font-semibold">{label}</h3>
                    <div className="text-4xl font-mono font-bold text-primary mt-2">{value}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                        {Math.round((value / 255) * 100)}% intenzita
                    </div>
                </div>

                <div className="flex justify-center">
                    <canvas
                        ref={canvasRef}
                        width={120}
                        height={300}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        className="rounded-lg cursor-pointer touch-none shadow-inner"
                        style={{ touchAction: 'none' }}
                    />
                </div>

                {showPresets && (
                    <div className="grid grid-cols-5 gap-2">
                        {presets.map((preset) => (
                            <Button
                                key={preset.value}
                                onClick={() => onChange(preset.value)}
                                variant={value === preset.value ? 'default' : 'outline'}
                                className="flex flex-col gap-1 h-auto py-3"
                            >
                                {preset.icon}
                                <span className="text-xs">{preset.label}</span>
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    )
}
