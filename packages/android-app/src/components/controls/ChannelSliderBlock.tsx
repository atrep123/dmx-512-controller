import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useState } from 'react'

interface ChannelSliderBlockProps {
    label: string
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
    disabled?: boolean
    showInput?: boolean
    icon?: React.ReactNode
    variant?: 'default' | 'card' | 'compact' | 'large'
    color?: 'primary' | 'accent' | 'secondary'
}

const colorClasses = {
    primary: 'text-primary',
    accent: 'text-accent',
    secondary: 'text-secondary',
}

export function ChannelSliderBlock({
    label,
    value,
    onChange,
    min = 0,
    max = 255,
    step = 1,
    disabled = false,
    showInput = true,
    icon,
    variant = 'default',
    color = 'primary',
}: ChannelSliderBlockProps) {
    const [inputValue, setInputValue] = useState(value.toString())

    const handleInputChange = (newValue: string) => {
        setInputValue(newValue)
        const numValue = parseInt(newValue)
        if (!isNaN(numValue) && numValue >= min && numValue <= max) {
            onChange(numValue)
        }
    }

    const handleInputBlur = () => {
        setInputValue(value.toString())
    }

    if (variant === 'large') {
        return (
            <Card className="p-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-xl font-semibold flex items-center gap-3">
                            {icon && <span className="text-primary">{icon}</span>}
                            {label}
                        </label>
                        {showInput && (
                            <Input
                                type="number"
                                value={inputValue}
                                onChange={(e) => handleInputChange(e.target.value)}
                                onBlur={handleInputBlur}
                                min={min}
                                max={max}
                                disabled={disabled}
                                className="w-24 h-12 text-center font-mono text-xl font-bold"
                            />
                        )}
                    </div>
                    <Slider
                        value={[value]}
                        onValueChange={(values) => onChange(values[0])}
                        min={min}
                        max={max}
                        step={step}
                        disabled={disabled}
                        className="cursor-pointer h-3"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground font-medium">
                        <span>{min}</span>
                        <span>{max}</span>
                    </div>
                </div>
            </Card>
        )
    }

    if (variant === 'compact') {
        return (
            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                    <label className="text-muted-foreground font-medium flex items-center gap-1">
                        {icon && <span>{icon}</span>}
                        {label}
                    </label>
                    {showInput && (
                        <span className={`font-mono font-bold text-sm ${colorClasses[color]}`}>
                            {value}
                        </span>
                    )}
                </div>
                <Slider
                    value={[value]}
                    onValueChange={(values) => onChange(values[0])}
                    min={min}
                    max={max}
                    step={step}
                    disabled={disabled}
                    className="cursor-pointer"
                />
            </div>
        )
    }

    if (variant === 'card') {
        return (
            <Card className="p-4">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-base font-medium flex items-center gap-2">
                            {icon && <span>{icon}</span>}
                            {label}
                        </label>
                        {showInput && (
                            <Input
                                type="number"
                                value={inputValue}
                                onChange={(e) => handleInputChange(e.target.value)}
                                onBlur={handleInputBlur}
                                min={min}
                                max={max}
                                disabled={disabled}
                                className="w-20 text-center font-mono"
                            />
                        )}
                    </div>
                    <Slider
                        value={[value]}
                        onValueChange={(values) => onChange(values[0])}
                        min={min}
                        max={max}
                        step={step}
                        disabled={disabled}
                        className="cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{min}</span>
                        <span>{max}</span>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <label className="text-muted-foreground flex items-center gap-2">
                    {icon && <span>{icon}</span>}
                    {label}
                </label>
                {showInput ? (
                    <Input
                        type="number"
                        value={inputValue}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onBlur={handleInputBlur}
                        min={min}
                        max={max}
                        disabled={disabled}
                        className="w-16 h-7 text-center font-mono text-sm"
                    />
                ) : (
                    <span className={`font-mono font-semibold ${colorClasses[color]}`}>
                        {value}
                    </span>
                )}
            </div>
            <Slider
                value={[value]}
                onValueChange={(values) => onChange(values[0])}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                className="cursor-pointer"
            />
        </div>
    )
}
