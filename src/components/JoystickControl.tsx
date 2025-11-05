import { useRef, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GameController, Lightbulb, GearSix, Crosshair } from '@phosphor-icons/react'
import { Fixture, StepperMotor, Servo } from '@/lib/types'
import { cn } from '@/lib/utils'

interface JoystickMapping {
    id: string
    fixtureIds: string[]
    motorIds: string[]
    servoIds: string[]
    xAxisChannel: string
    yAxisChannel: string
    sensitivity: number
    invertX: boolean
    invertY: boolean
}

interface JoystickControlProps {
    fixtures: Fixture[]
    stepperMotors: StepperMotor[]
    servos: Servo[]
    setFixtures: (updater: (fixtures: Fixture[]) => Fixture[]) => void
    setStepperMotors: (updater: (motors: StepperMotor[]) => StepperMotor[]) => void
    setServos: (updater: (servos: Servo[]) => Servo[]) => void
}

export default function JoystickControl({
    fixtures,
    stepperMotors,
    servos,
    setFixtures,
    setStepperMotors,
    setServos,
}: JoystickControlProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [mapping, setMapping] = useState<JoystickMapping>({
        id: 'default',
        fixtureIds: [],
        motorIds: [],
        servoIds: [],
        xAxisChannel: 'pan',
        yAxisChannel: 'tilt',
        sensitivity: 100,
        invertX: false,
        invertY: false,
    })
    const [isConfigOpen, setIsConfigOpen] = useState(false)

    const joystickSize = 200
    const knobSize = 60

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.clearRect(0, 0, joystickSize, joystickSize)

        const gradient = ctx.createRadialGradient(
            joystickSize / 2,
            joystickSize / 2,
            0,
            joystickSize / 2,
            joystickSize / 2,
            joystickSize / 2
        )
        gradient.addColorStop(0, 'rgba(101, 143, 241, 0.1)')
        gradient.addColorStop(1, 'rgba(101, 143, 241, 0.3)')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(joystickSize / 2, joystickSize / 2, joystickSize / 2 - 10, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = 'rgba(101, 143, 241, 0.5)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(joystickSize / 2, joystickSize / 2, joystickSize / 2 - 10, 0, Math.PI * 2)
        ctx.stroke()

        ctx.strokeStyle = 'rgba(101, 143, 241, 0.2)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(joystickSize / 2, 10)
        ctx.lineTo(joystickSize / 2, joystickSize - 10)
        ctx.moveTo(10, joystickSize / 2)
        ctx.lineTo(joystickSize - 10, joystickSize / 2)
        ctx.stroke()

        const knobX = joystickSize / 2 + position.x * ((joystickSize - knobSize) / 2)
        const knobY = joystickSize / 2 + position.y * ((joystickSize - knobSize) / 2)

        const knobGradient = ctx.createRadialGradient(knobX, knobY - 10, 0, knobX, knobY, knobSize / 2)
        knobGradient.addColorStop(0, '#658ff1')
        knobGradient.addColorStop(1, '#4a6bb8')
        ctx.fillStyle = knobGradient
        ctx.beginPath()
        ctx.arc(knobX, knobY, knobSize / 2, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = 2
        ctx.stroke()

        if (isDragging) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])
            ctx.beginPath()
            ctx.moveTo(joystickSize / 2, joystickSize / 2)
            ctx.lineTo(knobX, knobY)
            ctx.stroke()
            ctx.setLineDash([])
        }
    }, [position, isDragging])

    // eslint-disable-next-line react-hooks/exhaustive-deps -- setFixtures/setStepperMotors/setServos jsou stabilní updatery
    useEffect(() => {
        const x = mapping.invertX ? -position.x : position.x
        const y = mapping.invertY ? -position.y : position.y
        
        const normalizedX = ((x + 1) / 2) * 255
        const normalizedY = ((y + 1) / 2) * 255

        const scaledX = normalizedX * (mapping.sensitivity / 100)
        const scaledY = normalizedY * (mapping.sensitivity / 100)

        mapping.fixtureIds.forEach((fixtureId) => {
            const fixture = fixtures.find((f) => f.id === fixtureId)
            if (!fixture) return

            setFixtures((current) =>
                current.map((f) => {
                    if (f.id !== fixtureId) return f
                    return {
                        ...f,
                        channels: f.channels.map((ch) => {
                            if (ch.name.toLowerCase().includes(mapping.xAxisChannel.toLowerCase())) {
                                return { ...ch, value: Math.round(scaledX) }
                            }
                            if (ch.name.toLowerCase().includes(mapping.yAxisChannel.toLowerCase())) {
                                return { ...ch, value: Math.round(scaledY) }
                            }
                            return ch
                        }),
                    }
                })
            )
        })

        mapping.motorIds.forEach((motorId) => {
            setStepperMotors((current) =>
                current.map((motor) => {
                    if (motor.id !== motorId) return motor
                    return {
                        ...motor,
                        targetPosition: Math.round(scaledX * (motor.maxSteps / 255)),
                    }
                })
            )
        })

        mapping.servoIds.forEach((servoId) => {
            setServos((current) =>
                current.map((servo) => {
                    if (servo.id !== servoId) return servo
                    const range = servo.maxAngle - servo.minAngle
                    const angle = servo.minAngle + (scaledX / 255) * range
                    return {
                        ...servo,
                        targetAngle: Math.round(angle),
                    }
                })
            )
        })
    }, [position, mapping])

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        setIsDragging(true)
        updatePosition(e)
    }

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDragging) return
        updatePosition(e)
    }

    const handlePointerUp = () => {
        setIsDragging(false)
        setPosition({ x: 0, y: 0 })
    }

    const updatePosition = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const x = e.clientX - rect.left - centerX
        const y = e.clientY - rect.top - centerY

        const maxDistance = (joystickSize - knobSize) / 2
        const distance = Math.sqrt(x * x + y * y)
        
        if (distance > maxDistance) {
            const angle = Math.atan2(y, x)
            setPosition({
                x: (Math.cos(angle) * maxDistance) / maxDistance,
                y: (Math.sin(angle) * maxDistance) / maxDistance,
            })
        } else {
            setPosition({
                x: x / maxDistance,
                y: y / maxDistance,
            })
        }
    }

    const toggleFixture = (fixtureId: string) => {
        setMapping((prev) => ({
            ...prev,
            fixtureIds: prev.fixtureIds.includes(fixtureId)
                ? prev.fixtureIds.filter((id) => id !== fixtureId)
                : [...prev.fixtureIds, fixtureId],
        }))
    }

    const toggleMotor = (motorId: string) => {
        setMapping((prev) => ({
            ...prev,
            motorIds: prev.motorIds.includes(motorId)
                ? prev.motorIds.filter((id) => id !== motorId)
                : [...prev.motorIds, motorId],
        }))
    }

    const toggleServo = (servoId: string) => {
        setMapping((prev) => ({
            ...prev,
            servoIds: prev.servoIds.includes(servoId)
                ? prev.servoIds.filter((id) => id !== servoId)
                : [...prev.servoIds, servoId],
        }))
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <GameController className="w-5 h-5" />
                        Joystick Ovládání
                    </CardTitle>
                    <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Crosshair className="mr-2" />
                                Nastavení
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Konfigurace Joysticku</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                                <Tabs defaultValue="fixtures" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="fixtures">
                                            <Lightbulb className="mr-2" />
                                            Světla
                                        </TabsTrigger>
                                        <TabsTrigger value="motors">
                                            <GearSix className="mr-2" />
                                            Motory
                                        </TabsTrigger>
                                        <TabsTrigger value="servos">
                                            <GearSix className="mr-2" />
                                            Serva
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="fixtures" className="space-y-3">
                                        {fixtures.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                Žádná světla k dispozici
                                            </p>
                                        ) : (
                                            fixtures.map((fixture) => (
                                                <div
                                                    key={fixture.id}
                                                    className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                                                >
                                                    <Checkbox
                                                        id={`fixture-${fixture.id}`}
                                                        checked={mapping.fixtureIds.includes(fixture.id)}
                                                        onCheckedChange={() => toggleFixture(fixture.id)}
                                                    />
                                                    <Label
                                                        htmlFor={`fixture-${fixture.id}`}
                                                        className="flex-1 cursor-pointer"
                                                    >
                                                        <div className="font-medium">{fixture.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            DMX: {fixture.dmxAddress} | Typ: {fixture.fixtureType}
                                                        </div>
                                                    </Label>
                                                </div>
                                            ))
                                        )}
                                    </TabsContent>

                                    <TabsContent value="motors" className="space-y-3">
                                        {stepperMotors.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                Žádné motory k dispozici
                                            </p>
                                        ) : (
                                            stepperMotors.map((motor) => (
                                                <div
                                                    key={motor.id}
                                                    className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                                                >
                                                    <Checkbox
                                                        id={`motor-${motor.id}`}
                                                        checked={mapping.motorIds.includes(motor.id)}
                                                        onCheckedChange={() => toggleMotor(motor.id)}
                                                    />
                                                    <Label
                                                        htmlFor={`motor-${motor.id}`}
                                                        className="flex-1 cursor-pointer"
                                                    >
                                                        <div className="font-medium">{motor.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            DMX: {motor.dmxAddress} | Max kroků: {motor.maxSteps}
                                                        </div>
                                                    </Label>
                                                </div>
                                            ))
                                        )}
                                    </TabsContent>

                                    <TabsContent value="servos" className="space-y-3">
                                        {servos.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                Žádná serva k dispozici
                                            </p>
                                        ) : (
                                            servos.map((servo) => (
                                                <div
                                                    key={servo.id}
                                                    className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                                                >
                                                    <Checkbox
                                                        id={`servo-${servo.id}`}
                                                        checked={mapping.servoIds.includes(servo.id)}
                                                        onCheckedChange={() => toggleServo(servo.id)}
                                                    />
                                                    <Label
                                                        htmlFor={`servo-${servo.id}`}
                                                        className="flex-1 cursor-pointer"
                                                    >
                                                        <div className="font-medium">{servo.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            DMX: {servo.dmxAddress} | Rozsah: {servo.minAngle}°-
                                                            {servo.maxAngle}°
                                                        </div>
                                                    </Label>
                                                </div>
                                            ))
                                        )}
                                    </TabsContent>
                                </Tabs>

                                <div className="space-y-4 pt-4 border-t">
                                    <div>
                                        <Label className="text-sm font-medium mb-2 block">
                                            Citlivost: {mapping.sensitivity}%
                                        </Label>
                                        <Slider
                                            value={[mapping.sensitivity]}
                                            onValueChange={([value]) =>
                                                setMapping((prev) => ({ ...prev, sensitivity: value }))
                                            }
                                            min={10}
                                            max={200}
                                            step={10}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="invert-x"
                                                checked={mapping.invertX}
                                                onCheckedChange={(checked) =>
                                                    setMapping((prev) => ({ ...prev, invertX: checked as boolean }))
                                                }
                                            />
                                            <Label htmlFor="invert-x" className="cursor-pointer">
                                                Invertovat X osu
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="invert-y"
                                                checked={mapping.invertY}
                                                onCheckedChange={(checked) =>
                                                    setMapping((prev) => ({ ...prev, invertY: checked as boolean }))
                                                }
                                            />
                                            <Label htmlFor="invert-y" className="cursor-pointer">
                                                Invertovat Y osu
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <canvas
                            ref={canvasRef}
                            width={joystickSize}
                            height={joystickSize}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={handlePointerUp}
                            className={cn(
                                'rounded-full cursor-pointer touch-none',
                                isDragging && 'cursor-grabbing'
                            )}
                            style={{ touchAction: 'none' }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full max-w-sm text-center">
                        <div>
                            <div className="text-xs text-muted-foreground">X</div>
                            <div className="text-lg font-mono font-semibold">
                                {((position.x + 1) * 127.5).toFixed(0)}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Y</div>
                            <div className="text-lg font-mono font-semibold">
                                {((position.y + 1) * 127.5).toFixed(0)}
                            </div>
                        </div>
                    </div>

                    {(mapping.fixtureIds.length > 0 ||
                        mapping.motorIds.length > 0 ||
                        mapping.servoIds.length > 0) && (
                        <div className="w-full">
                            <div className="text-xs text-muted-foreground mb-2">Přiřazená zařízení:</div>
                            <div className="flex flex-wrap gap-2">
                                {mapping.fixtureIds.map((id) => {
                                    const fixture = fixtures.find((f) => f.id === id)
                                    return fixture ? (
                                        <Badge key={id} variant="default">
                                            <Lightbulb className="w-3 h-3 mr-1" />
                                            {fixture.name}
                                        </Badge>
                                    ) : null
                                })}
                                {mapping.motorIds.map((id) => {
                                    const motor = stepperMotors.find((m) => m.id === id)
                                    return motor ? (
                                        <Badge key={id} variant="secondary">
                                            <GearSix className="w-3 h-3 mr-1" />
                                            {motor.name}
                                        </Badge>
                                    ) : null
                                })}
                                {mapping.servoIds.map((id) => {
                                    const servo = servos.find((s) => s.id === id)
                                    return servo ? (
                                        <Badge key={id} variant="outline">
                                            <GearSix className="w-3 h-3 mr-1" />
                                            {servo.name}
                                        </Badge>
                                    ) : null
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
