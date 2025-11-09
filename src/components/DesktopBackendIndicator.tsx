import { useEffect, useState, type JSX } from 'react'
import { CircleNotch, CheckCircle, WarningCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

type BackendStatus = 'idle' | 'waiting' | 'ready' | 'error'

export function DesktopBackendIndicator() {
    const [status, setStatus] = useState<BackendStatus>('idle')
    const [attempt, setAttempt] = useState(0)
    const [message, setMessage] = useState<string | null>(null)

    useEffect(() => {
        if (typeof window === 'undefined' || !('__TAURI_INTERNALS__' in window)) {
            return
        }
        const handleWaiting = (event: Event) => {
            const value = (event as CustomEvent<number>).detail
            setStatus('waiting')
            setAttempt(typeof value === 'number' ? value : 0)
            setMessage(null)
        }
        const handleReady = () => {
            setStatus('ready')
            setMessage(null)
        }
        const handleError = (event: Event) => {
            const value = (event as CustomEvent<string>).detail
            setStatus('error')
            setMessage(typeof value === 'string' ? value : null)
        }
        window.addEventListener('desktop://backend/waiting', handleWaiting)
        window.addEventListener('desktop://backend/ready', handleReady)
        window.addEventListener('desktop://backend/error', handleError)
        return () => {
            window.removeEventListener('desktop://backend/waiting', handleWaiting)
            window.removeEventListener('desktop://backend/ready', handleReady)
            window.removeEventListener('desktop://backend/error', handleError)
        }
    }, [])

    if (status === 'idle' && message === null) {
        return null
    }

    const STATE_MAP: Record<BackendStatus, { label: string; description: string; icon: JSX.Element }> = {
        idle: {
            label: 'Desktop backend',
            description: 'Není aktivní',
            icon: <CircleNotch className="text-muted-foreground" size={16} />,
        },
        waiting: {
            label: 'Desktop backend',
            description: attempt > 0 ? `Startuji… (${attempt})` : 'Startuji…',
            icon: <CircleNotch className="text-primary animate-spin" size={16} />,
        },
        ready: {
            label: 'Desktop backend',
            description: 'Běží',
            icon: <CheckCircle className="text-emerald-500" size={16} weight="fill" />,
        },
        error: {
            label: 'Desktop backend',
            description: message ?? 'Chyba při startu',
            icon: <WarningCircle className="text-red-500" size={16} weight="fill" />,
        },
    }

    const state = STATE_MAP[status]

    return (
        <div
            className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors',
                status === 'error'
                    ? 'border-red-500/50 bg-red-500/10 text-red-600'
                    : status === 'ready'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700'
                    : 'border-border bg-muted/40 text-muted-foreground'
            )}
        >
            {state.icon}
            <div className="flex flex-col gap-0.5">
                <span className="font-semibold">{state.label}</span>
                <span className="text-[11px]">{state.description}</span>
            </div>
        </div>
    )
}
