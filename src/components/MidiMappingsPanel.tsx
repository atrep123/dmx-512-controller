import { useEffect, useMemo, useState } from "react"
import { useKV } from "@github/spark/hooks"
import type { MidiMessage } from "@/hooks/useMidiBridge"
import { type MidiAction, type MidiMapping } from "@/lib/midiMappings"
import type { Scene, Effect } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Trash, Plug, MagicWand } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

type PendingCapture = {
  controller?: number
  deviceId?: string
  deviceName?: string
  command?: string
}

type MidiMappingsPanelProps = {
  scenes: Scene[]
  effects: Effect[]
}

const SUPPORTED_COMMANDS = ["control-change", "note-on", "note-off"] as const
const ACTION_OPTIONS: { value: MidiAction["type"]; label: string }[] = [
  { value: "channel", label: "DMX kanal" },
  { value: "scene", label: "Scena" },
  { value: "effect-toggle", label: "Pustit/zastavit efekt" },
  { value: "effect-intensity", label: "Intenzita efektu" },
  { value: "master-dimmer", label: "Master dimmer" },
]

export default function MidiMappingsPanel({ scenes, effects }: MidiMappingsPanelProps) {
  const [mappings, setMappings] = useKV<MidiMapping[]>("midi-mappings", [])
  const [channelInput, setChannelInput] = useState("1")
  const [controllerInput, setControllerInput] = useState("")
  const [commandInput, setCommandInput] = useState<(typeof SUPPORTED_COMMANDS)[number]>("control-change")
  const [actionType, setActionType] = useState<MidiAction["type"]>("channel")
  const [selectedSceneId, setSelectedSceneId] = useState(() => scenes[0]?.id ?? "")
  const [selectedEffectId, setSelectedEffectId] = useState(() => effects[0]?.id ?? "")
  const [effectBehavior, setEffectBehavior] = useState<"toggle" | "on" | "off">("toggle")
  const [captureActive, setCaptureActive] = useState(false)
  const [pendingCapture, setPendingCapture] = useState<PendingCapture | null>(null)
  const [lastMessage, setLastMessage] = useState<MidiMessage | null>(null)

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<MidiMessage>
      const message = custom.detail
      if (!message) return
      setLastMessage(message)
      if (!captureActive) return
      const command = message.command as (typeof SUPPORTED_COMMANDS)[number]
      if (!SUPPORTED_COMMANDS.includes(command)) {
        toast.error("Zachytavame CC nebo note-on/off. Zkus jiny prvek na kontroleru.")
        return
      }
      const controller = message.data?.[1]
      if (controller === undefined) {
        toast.error("Tato zprava neobsahuje cislo ovladace.")
        return
      }
      setPendingCapture({
        controller,
        deviceId: message.deviceId,
        deviceName: message.deviceName,
        command: message.command,
      })
      setControllerInput(String(controller))
      setCommandInput(command)
      setCaptureActive(false)
      toast.success(`Zachyceno ${message.command} #${controller}.`)
    }
    document.addEventListener("dmx-midi", handler)
    return () => document.removeEventListener("dmx-midi", handler)
  }, [captureActive])

  useEffect(() => {
    if (actionType === "scene" && scenes.length > 0 && !selectedSceneId) {
      setSelectedSceneId(scenes[0].id)
    }
    if (actionType.startsWith("effect") && effects.length > 0 && !selectedEffectId) {
      setSelectedEffectId(effects[0].id)
    }
  }, [actionType, scenes, effects, selectedEffectId, selectedSceneId])

  const addMapping = () => {
    const controller = parseInt(controllerInput, 10)
    if (Number.isNaN(controller) || controller < 0 || controller > 127) {
      toast.error("Zadej platne cislo (0-127) pro CC/note.")
      return
    }
    let action: MidiAction | null = null
    switch (actionType) {
      case "channel": {
        const channel = parseInt(channelInput, 10)
        if (Number.isNaN(channel) || channel < 1 || channel > 512) {
          toast.error("DMX kanal musi byt v rozsahu 1-512.")
          return
        }
        action = { type: "channel", channel }
        break
      }
      case "scene": {
        if (!selectedSceneId) {
          toast.error("Vyber sceny pro toto mapovani.")
          return
        }
        action = { type: "scene", sceneId: selectedSceneId }
        break
      }
      case "effect-toggle": {
        if (!selectedEffectId) {
          toast.error("Vyber efekt.")
          return
        }
        action = { type: "effect-toggle", effectId: selectedEffectId, behavior: effectBehavior }
        break
      }
      case "effect-intensity": {
        if (!selectedEffectId) {
          toast.error("Vyber efekt.")
          return
        }
        action = { type: "effect-intensity", effectId: selectedEffectId }
        break
      }
      case "master-dimmer": {
        action = { type: "master-dimmer" }
        break
      }
      default:
        action = null
    }
    if (!action) {
      toast.error("Vyber platny cil.")
      return
    }
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `midi-${Date.now()}`
    const newMapping: MidiMapping = {
      id,
      command: pendingCapture?.command ?? commandInput,
      controller,
      deviceId: pendingCapture?.deviceId,
      deviceName: pendingCapture?.deviceName,
      action,
    }
    setMappings([...(mappings || []), newMapping])
    setPendingCapture(null)
    toast.success("Mapovani ulozeno.")
  }

  const removeMapping = (id: string) => {
    setMappings((mappings || []).filter((mapping) => mapping.id !== id))
  }

  const summarizedMessage = useMemo(() => {
    if (!lastMessage) return "Zadna MIDI aktivita."
    const controller = lastMessage.data?.[1]
    const value = lastMessage.data?.[2]
    const source = lastMessage.deviceName ?? lastMessage.deviceId ?? "nezname zarizeni"
    return `Posledni: ${lastMessage.command} #${controller ?? "?"} hodnota ${value ?? "?"} (${source})`
  }, [lastMessage])

  const describeAction = (action: MidiAction): string => {
    switch (action.type) {
      case "channel":
        return `DMX kanal ${action.channel}`
      case "scene": {
        const scene = scenes.find((s) => s.id === action.sceneId)
        return `Scena ${scene?.name ?? action.sceneId}`
      }
      case "effect-toggle": {
        const effect = effects.find((e) => e.id === action.effectId)
        const behavior =
          action.behavior === "on" ? "zapnout" : action.behavior === "off" ? "vypnout" : "prepnout"
        return `Efekt ${effect?.name ?? action.effectId} (${behavior})`
      }
      case "effect-intensity": {
        const effect = effects.find((e) => e.id === action.effectId)
        return `Intenzita ${effect?.name ?? action.effectId}`
      }
      case "master-dimmer":
        return "Master dimmer"
      default:
        return ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <MagicWand size={20} className="text-primary" />
          MIDI mapovani
        </CardTitle>
        <CardDescription>
          Precti MIDI zpravy (CC i note-on/off) a prirad je k DMX kanalu, scene, efektu nebo master dimmeru.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-dashed border-primary/40 p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Typ MIDI zpravy</Label>
              <select
                value={commandInput}
                onChange={(event) => setCommandInput(event.target.value as (typeof SUPPORTED_COMMANDS)[number])}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {SUPPORTED_COMMANDS.map((command) => (
                  <option key={command} value={command}>
                    {command}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">Pouzij zachyceni, aby se prikaz doplnil automaticky.</p>
            </div>
            <div className="space-y-2">
              <Label>CC / note cislo</Label>
              <Input
                value={controllerInput}
                onChange={(e) => setControllerInput(e.target.value)}
                type="number"
                min={0}
                max={127}
                placeholder="napr. 0"
              />
              <p className="text-xs text-muted-foreground">Cislo ovladace (0-127). Nastav zachycenim nebo rucne.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Cil akce</Label>
              <select
                value={actionType}
                onChange={(event) => setActionType(event.target.value as MidiAction["type"])}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {ACTION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {actionType === "channel" && (
              <div className="space-y-2">
                <Label>DMX kanal</Label>
                <Input
                  value={channelInput}
                  onChange={(e) => setChannelInput(e.target.value)}
                  type="number"
                  min={1}
                  max={512}
                  placeholder="napr. 1"
                />
                <p className="text-xs text-muted-foreground">Globalni index kanalu (1-512) napric fixtures.</p>
              </div>
            )}
            {actionType === "scene" && (
              <div className="space-y-2">
                <Label>Scena</Label>
                <select
                  value={selectedSceneId}
                  onChange={(event) => setSelectedSceneId(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  disabled={scenes.length === 0}
                >
                  {scenes.length === 0 ? <option value="">Zadne scény</option> : null}
                  {scenes.map((scene) => (
                    <option key={scene.id} value={scene.id}>
                      {scene.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Vyber, ktera scena se ma vyvolat.</p>
              </div>
            )}
            {(actionType === "effect-toggle" || actionType === "effect-intensity") && (
              <div className="space-y-2">
                <Label>Efekt</Label>
                <select
                  value={selectedEffectId}
                  onChange={(event) => setSelectedEffectId(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  disabled={effects.length === 0}
                >
                  {effects.length === 0 ? <option value="">Zadne efekty</option> : null}
                  {effects.map((effect) => (
                    <option key={effect.id} value={effect.id}>
                      {effect.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Mapuj na existujici efekt.</p>
              </div>
            )}
            {actionType === "effect-toggle" && (
              <div className="space-y-2">
                <Label>Chovani</Label>
                <select
                  value={effectBehavior}
                  onChange={(event) => setEffectBehavior(event.target.value as "toggle" | "on" | "off")}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="toggle">Prepnout stav</option>
                  <option value="on">Vynutit zapnuti</option>
                  <option value="off">Vynutit vypnuti</option>
                </select>
                <p className="text-xs text-muted-foreground">Jak se ma efekt chovat po prijeti zpravy.</p>
              </div>
            )}
            {actionType === "master-dimmer" && (
              <div className="space-y-2">
                <Label>Master dimmer</Label>
                <p className="text-xs text-muted-foreground">
                  MIDI hodnota 0-127 se prevedou na 0-255 a ovlivni globalni intensity.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant={captureActive ? "secondary" : "outline"} onClick={() => setCaptureActive((v) => !v)}>
              {captureActive ? "Cekam na MIDI..." : "Zachytit MIDI zpravu"}
            </Button>
            {pendingCapture ? (
              <Badge variant="secondary">
                Zachyceno: {pendingCapture.deviceName ?? pendingCapture.deviceId ?? "nezname"} (
                {pendingCapture.command} #{pendingCapture.controller})
              </Badge>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">{summarizedMessage}</p>
        </div>

        {mappings && mappings.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Aktivni mapovani</h4>
            <div className="divide-y rounded-md border">
              {mappings.map((mapping) => (
                <div key={mapping.id} className="flex items-center justify-between gap-4 px-3 py-2 text-sm">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {mapping.command} #{mapping.controller} → {describeAction(mapping.action)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {mapping.deviceName || mapping.deviceId || "Libovolne zarizeni"}
                    </p>
                  </div>
                    <Button variant="ghost" size="icon" onClick={() => removeMapping(mapping.id)}>
                      <Trash className="text-destructive" />
                    </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Alert>
            <Plug size={18} />
            <AlertTitle>Zadne mapovani</AlertTitle>
            <AlertDescription>Prirad MIDI prvky ke kanalu, scene, efektu nebo master dimmeru.</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3">
        <Button onClick={addMapping}>Ulozit mapovani</Button>
      </CardFooter>
    </Card>
  )
}
