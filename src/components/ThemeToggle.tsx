import { useTheme } from 'next-themes'
import { Laptop, Moon, Sun } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const MODES = [
  { value: 'light', label: 'Světlé', icon: Sun },
  { value: 'dark', label: 'Tmavé', icon: Moon },
  { value: 'system', label: 'Systém', icon: Laptop },
] as const

export function ThemeToggle() {
  const { theme = 'system', setTheme } = useTheme()

  return (
    <div className="inline-flex items-center divide-x overflow-hidden rounded-full border bg-background/80 shadow-sm">
      {MODES.map((mode) => (
        <button
          key={mode.value}
          type="button"
          aria-pressed={theme === mode.value}
          aria-label={`Přepnout na ${mode.label} téma`}
          onClick={() => setTheme(mode.value)}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            theme === mode.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <mode.icon size={16} weight={theme === mode.value ? 'fill' : 'regular'} />
          <span className="hidden sm:inline">{mode.label}</span>
        </button>
      ))}
    </div>
  )
}
