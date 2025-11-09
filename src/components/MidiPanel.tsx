import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MusicNotes, WarningCircle, Keyboard } from "@phosphor-icons/react"
import { useMidiBridge, type MidiMessage } from "@/hooks/useMidiBridge"

function formatCommand(message: MidiMessage | null): string {
  if (!message) {
    return "—"
  }
  const parts = [message.command]
  if (typeof message.channel === "number") {
    parts.push(`ch${message.channel + 1}`)
  }
  return parts.join(" · ")
}

export function MidiPanel() {
  const [lastMessage, setLastMessage] = useState<MidiMessage | null>(null)
  const { supported, enabled, pending, error, devices, enable, disable } = useMidiBridge({
    onMessage: (msg) => setLastMessage(msg),
  })

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <MusicNotes className="text-primary" size={22} />
            MIDI (preview)
          </CardTitle>
          <CardDescription>
            Připoj MIDI kontrolér a sleduj příchozí zprávy pro budoucí mapování. Chrome 128+ a HTTPS vyžadováno.
          </CardDescription>
        </div>
        <Badge variant="outline">Preview</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {!supported ? (
          <Alert className="border-border bg-muted/50">
            <WarningCircle className="text-muted-foreground" size={18} />
            <AlertTitle>MIDI API není podporováno</AlertTitle>
            <AlertDescription>
              Web MIDI funguje pouze v prohlížečích Chromium na zabezpečených doménách (https:// nebo localhost).
            </AlertDescription>
          </Alert>
        ) : null}
        {error ? (
          <Alert variant="destructive">
            <WarningCircle size={18} />
            <AlertTitle>Nepodařilo se připojit k MIDI</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={enabled ? disable : enable}
            disabled={!supported || pending}
            variant={enabled ? "secondary" : "default"}
          >
            {enabled ? "Vypnout MIDI bridge" : "Zapnout MIDI bridge"}
          </Button>
          {!supported ? (
            <Button variant="outline" disabled>
              Potřebujete Chrome 128+ (HTTPS)
            </Button>
          ) : null}
        </div>
        <div className="grid gap-3">
          <div className="rounded-md border border-border/60 bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Poslední zpráva</p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
              <span className="font-semibold">{formatCommand(lastMessage)}</span>
              {lastMessage ? (
                <>
                  <span className="text-muted-foreground">
                    data: {lastMessage.data.map((value) => value.toString()).join(", ")}
                  </span>
                  <span className="text-muted-foreground">{lastMessage.deviceName ?? lastMessage.deviceId}</span>
                </>
              ) : (
                <span className="text-muted-foreground">Zatím jsme nic nepřijali.</span>
              )}
            </div>
          </div>
          <div className="rounded-md border border-border/60">
            <div className="border-b border-border/60 px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Detekovaná zařízení
            </div>
            <div className="divide-y divide-border/60">
              {devices.length === 0 ? (
                <p className="px-3 py-3 text-sm text-muted-foreground">
                  Žádné MIDI vstupy. Připojte kontrolér a klikněte na „Zapnout“.
                </p>
              ) : (
                devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between px-3 py-3 text-sm">
                    <div>
                      <p className="font-medium">{device.name ?? "Neznámé zařízení"}</p>
                      <p className="text-xs text-muted-foreground">{device.manufacturer ?? "Bez výrobce"}</p>
                    </div>
                    <Badge variant={device.state === "connected" ? "default" : "outline"}>
                      {device.state ?? "unknown"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Keyboard size={16} />
          <span>Mapování zatím jen loguje MIDI data a posílá event `dmx-midi`.</span>
        </div>
        <a
          href="https://github.com/atrep123/dmx-512-controller/issues/421"
          target="_blank"
          rel="noreferrer"
          className="text-primary underline-offset-4 hover:underline"
        >
          Sdílej feedback v issue #421 →
        </a>
      </CardFooter>
    </Card>
  )
}

export default MidiPanel
