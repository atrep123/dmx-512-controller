import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Target } from '@phosphor-icons/react'

interface PositionControlBlockProps {
    panValue: number
    tiltValue: number
    onPanChange: (value: number) => void
    onTiltChange: (value: number) => void
    title?: string
    showReset?: boolean
    variant?: 'default' | 'compact'
}

export function PositionControlBlock({
    panValue,
    tiltValue,
    onPanChange,
    onTiltChange,
    title = 'Pan / Tilt',
    showReset = true,
    variant = 'default',
}: PositionControlBlockProps) {
    const step = 5

    const handleReset = () => {
        onPanChange(127)
        onTiltChange(127)
    }

    const handlePanIncrease = () => {
        const newValue = Math.min(255, panValue + step)
        onPanChange(newValue)
    }

    const handlePanDecrease = () => {
        const newValue = Math.max(0, panValue - step)
        onPanChange(newValue)
    }

    const handleTiltIncrease = () => {
        const newValue = Math.min(255, tiltValue + step)
        onTiltChange(newValue)
    }

    const handleTiltDecrease = () => {
        const newValue = Math.max(0, tiltValue - step)
        onTiltChange(newValue)
    }

    if (variant === 'compact') {
        return (
            <Card className="p-3">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{title}</span>
                        <div className="flex gap-2 text-xs">
                            <Badge variant="outline">P: {panValue}</Badge>
                            <Badge variant="outline">T: {tiltValue}</Badge>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div />
                        <Button onClick={handleTiltIncrease} variant="outline" size="sm">
                            <ArrowUp />
                        </Button>
                        <div />
                        <Button onClick={handlePanDecrease} variant="outline" size="sm">
                            <ArrowLeft />
                        </Button>
                        {showReset && (
                            <Button onClick={handleReset} variant="secondary" size="sm">
                                <Target />
                            </Button>
                        )}
                        <Button onClick={handlePanIncrease} variant="outline" size="sm">
                            <ArrowRight />
                        </Button>
                        <div />
                        <Button onClick={handleTiltDecrease} variant="outline" size="sm">
                            <ArrowDown />
                        </Button>
                        <div />
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card className="p-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <div className="flex gap-3">
                        <div className="text-center">
                            <div className="text-xs text-muted-foreground">Pan</div>
                            <Badge variant="outline" className="font-mono">
                                {panValue}
                            </Badge>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-muted-foreground">Tilt</div>
                            <Badge variant="outline" className="font-mono">
                                {tiltValue}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                    <div />
                    <Button
                        onClick={handleTiltIncrease}
                        variant="outline"
                        size="lg"
                        className="h-16"
                    >
                        <ArrowUp size={24} />
                    </Button>
                    <div />

                    <Button
                        onClick={handlePanDecrease}
                        variant="outline"
                        size="lg"
                        className="h-16"
                    >
                        <ArrowLeft size={24} />
                    </Button>

                    {showReset && (
                        <Button
                            onClick={handleReset}
                            variant="secondary"
                            size="lg"
                            className="h-16 gap-2"
                        >
                            <Target size={24} />
                        </Button>
                    )}

                    <Button
                        onClick={handlePanIncrease}
                        variant="outline"
                        size="lg"
                        className="h-16"
                    >
                        <ArrowRight size={24} />
                    </Button>

                    <div />
                    <Button
                        onClick={handleTiltDecrease}
                        variant="outline"
                        size="lg"
                        className="h-16"
                    >
                        <ArrowDown size={24} />
                    </Button>
                    <div />
                </div>
            </div>
        </Card>
    )
}
