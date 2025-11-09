import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trash, ClipboardText, Terminal } from '@phosphor-icons/react'

type BackendLogEntry = {
    ts: number
    line: string
}

export function DesktopBackendConsole() {
    const [logs, setLogs] = useState<BackendLogEntry[]>([])
    const [isDesktop, setIsDesktop] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }
        const desktopDetected = '__TAURI_INTERNALS__' in window
        setIsDesktop(desktopDetected)
        if (!desktopDetected) {
            return
        }
        const handleLog = (event: Event) => {
            const detail = (event as CustomEvent<string>).detail ?? ''
            const entry: BackendLogEntry = { ts: Date.now(), line: detail }
            setLogs((current) => {
                const next = [entry, ...current]
                if (next.length > 200) {
                    next.pop()
                }
                return next
            })
        }
        window.addEventListener('dmx-backend://log', handleLog)
        return () => {
            window.removeEventListener('dmx-backend://log', handleLog)
        }
    }, [])

    const hasLogs = logs.length > 0
    const logText = useMemo(() => logs.map((entry) => formatLine(entry)).join('\n'), [logs])

    const copyLogs = async () => {
        if (!hasLogs || typeof navigator === 'undefined' || !navigator.clipboard) {
            return
        }
        try {
            await navigator.clipboard.writeText(logText)
        } catch (error) {
            console.error('desktop_backend_console_copy_failed', error)
        }
    }

    if (!isDesktop) {
        return null
    }

    return (
        <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Terminal size={18} className="text-primary" />
                    <div>
                        <p className="font-semibold text-sm">Desktop backend log</p>
                        <p className="text-xs text-muted-foreground">Posledních {logs.length} záznamů z dmx-backend.exe</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyLogs} disabled={!hasLogs}>
                        <ClipboardText size={14} />
                        <span className="ml-1 hidden sm:inline">Kopírovat</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setLogs([])} disabled={!hasLogs}>
                        <Trash size={14} />
                        <span className="ml-1 hidden sm:inline">Vyčistit</span>
                    </Button>
                </div>
            </div>
            <ScrollArea className="h-48 rounded-md border bg-muted/20 p-3 text-[11px] font-mono leading-relaxed">
                {hasLogs ? (
                    <pre className="whitespace-pre-wrap text-xs text-muted-foreground">{logText}</pre>
                ) : (
                    <p className="text-xs text-muted-foreground">Žádná logovací data (otevři desktop appku nebo počkej na další zprávy).</p>
                )}
            </ScrollArea>
        </Card>
    )
}

function formatLine(entry: BackendLogEntry): string {
    const time = new Date(entry.ts).toLocaleTimeString('cs-CZ', { hour12: false })
    return `[${time}] ${entry.line}`
}
