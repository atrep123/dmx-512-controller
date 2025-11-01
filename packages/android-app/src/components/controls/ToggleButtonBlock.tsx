import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pencil } from '@phosphor-icons/react'

interface ToggleButtonBlockProps {
    label: string
    active: boolean
    onToggle: () => void
    icon?: React.ReactNode
    activeIcon?: React.ReactNode
    variant?: 'default' | 'large' | 'minimal'
    disabled?: boolean
    showStatus?: boolean
    effectId?: string
    onEffectChange?: () => void
    showEdit?: boolean
}

export function ToggleButtonBlock({
    label,
    active,
    onToggle,
    icon,
    activeIcon,
    variant = 'default',
    disabled = false,
    showStatus = true,
    effectId,
    onEffectChange,
    showEdit = false,
}: ToggleButtonBlockProps) {
    const displayIcon = active && activeIcon ? activeIcon : icon

    if (variant === 'minimal') {
        return (
            <Button
                onClick={onToggle}
                disabled={disabled}
                variant={active ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
            >
                {displayIcon}
                {label}
                {showStatus && (
                    <Badge variant={active ? 'secondary' : 'outline'} className="ml-1">
                        {active ? 'ZAP' : 'VYP'}
                    </Badge>
                )}
            </Button>
        )
    }

    if (variant === 'large') {
        return (
            <Card className={`p-6 transition-all ${active ? 'ring-2 ring-accent bg-accent/5' : ''} relative group`}>
                {showEdit && onEffectChange && (
                    <Button
                        onClick={(e) => {
                            e.stopPropagation()
                            onEffectChange()
                        }}
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Pencil size={16} />
                    </Button>
                )}
                <button
                    onClick={onToggle}
                    disabled={disabled}
                    className="w-full flex flex-col items-center gap-4 disabled:opacity-50"
                >
                    <div className={`text-4xl ${active ? 'text-accent' : 'text-muted-foreground'}`}>
                        {displayIcon}
                    </div>
                    <div className="text-center">
                        <h3 className="font-semibold text-lg">{label}</h3>
                        {showStatus && (
                            <Badge variant={active ? 'default' : 'outline'} className="mt-2">
                                {active ? 'AKTIVNÍ' : 'NEAKTIVNÍ'}
                            </Badge>
                        )}
                    </div>
                </button>
            </Card>
        )
    }

    return (
        <Card className={`p-4 transition-all ${active ? 'ring-2 ring-accent' : ''} relative group`}>
            {showEdit && onEffectChange && (
                <Button
                    onClick={(e) => {
                        e.stopPropagation()
                        onEffectChange()
                    }}
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 h-auto"
                >
                    <Pencil size={14} />
                </Button>
            )}
            <button
                onClick={onToggle}
                disabled={disabled}
                className="w-full flex items-center justify-between gap-3 disabled:opacity-50"
            >
                <div className="flex items-center gap-3">
                    <div className={`text-2xl ${active ? 'text-accent' : 'text-muted-foreground'}`}>
                        {displayIcon}
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold">{label}</h3>
                        {showStatus && (
                            <p className="text-xs text-muted-foreground">
                                {active ? 'Aktivní' : 'Neaktivní'}
                            </p>
                        )}
                    </div>
                </div>
                <div
                    className={`w-12 h-6 rounded-full transition-colors ${
                        active ? 'bg-accent' : 'bg-muted'
                    } relative`}
                >
                    <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                            active ? 'translate-x-7' : 'translate-x-1'
                        }`}
                    />
                </div>
            </button>
        </Card>
    )
}
