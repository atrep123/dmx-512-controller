import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ButtonPadItem {
    id: string
    label: string
    icon?: React.ReactNode
    color?: 'default' | 'accent' | 'secondary' | 'destructive'
    badge?: string
}

interface ButtonPadBlockProps {
    title?: string
    items: ButtonPadItem[]
    activeId?: string | null
    onItemClick: (id: string) => void
    columns?: 2 | 3 | 4 | 6
    variant?: 'default' | 'compact'
}

export function ButtonPadBlock({
    title,
    items,
    activeId,
    onItemClick,
    columns = 3,
    variant = 'default',
}: ButtonPadBlockProps) {
    const gridCols = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        6: 'grid-cols-6',
    }

    if (variant === 'compact') {
        return (
            <div className="space-y-2">
                {title && <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>}
                <div className={`grid ${gridCols[columns]} gap-2`}>
                    {items.map((item) => {
                        const isActive = activeId === item.id
                        return (
                            <Button
                                key={item.id}
                                onClick={() => onItemClick(item.id)}
                                variant={isActive ? 'default' : 'outline'}
                                size="sm"
                                className="gap-1.5"
                            >
                                {item.icon}
                                <span className="text-xs">{item.label}</span>
                            </Button>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <Card className="p-4">
            {title && (
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
            )}
            <div className={`grid ${gridCols[columns]} gap-3`}>
                {items.map((item) => {
                    const isActive = activeId === item.id
                    const colorVariants = {
                        default: isActive ? 'default' : 'outline',
                        accent: isActive ? 'default' : 'outline',
                        secondary: isActive ? 'secondary' : 'outline',
                        destructive: 'destructive',
                    }

                    return (
                        <Button
                            key={item.id}
                            onClick={() => onItemClick(item.id)}
                            variant={colorVariants[item.color || 'default'] as any}
                            size="lg"
                            className="flex flex-col items-center gap-2 h-auto py-4 relative"
                        >
                            {item.icon && <div className="text-2xl">{item.icon}</div>}
                            <span className="text-sm font-medium">{item.label}</span>
                            {item.badge && (
                                <Badge variant="secondary" className="absolute top-1 right-1 text-xs">
                                    {item.badge}
                                </Badge>
                            )}
                        </Button>
                    )
                })}
            </div>
        </Card>
    )
}
