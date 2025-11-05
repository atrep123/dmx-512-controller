import { StepperMotor, Servo, Universe } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash, GearSix, ArrowsOutCardinal, Target } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'

interface MotorsViewProps {
    stepperMotors: StepperMotor[]
    setStepperMotors: (updater: (motors: StepperMotor[]) => StepperMotor[]) => void
    servos: Servo[]
    setServos: (updater: (servos: Servo[]) => Servo[]) => void
    universes: Universe[]
}

export default function MotorsView({
    stepperMotors,
    setStepperMotors,
    servos,
    setServos,
    universes,
}: MotorsViewProps) {
    const [isMotorDialogOpen, setIsMotorDialogOpen] = useState(false)
    const [isServoDialogOpen, setIsServoDialogOpen] = useState(false)
    const [motorName, setMotorName] = useState('')
    const [motorDmxAddress, setMotorDmxAddress] = useState('1')
    const [motorMaxSteps, setMotorMaxSteps] = useState('10000')
    const [selectedUniverseId, setSelectedUniverseId] = useState('')
    const [servoName, setServoName] = useState('')
    const [servoDmxAddress, setServoDmxAddress] = useState('1')
    const [servoMinAngle, setServoMinAngle] = useState('0')
    const [servoMaxAngle, setServoMaxAngle] = useState('180')

    const addStepperMotor = () => {
        if (!motorName.trim()) {
            toast.error('Zadejte nazev motoru')
            return
        }
        if (!selectedUniverseId) {
            toast.error('Vyberte univerzum')
            return
        }

        const dmxAddress = parseInt(motorDmxAddress)
        const maxSteps = parseInt(motorMaxSteps)

        if (dmxAddress < 1 || dmxAddress > 510) {
            toast.error('DMX adresa musi byt mezi 1 a 510')
            return
        }

        const channels = [
            {
                id: `${Date.now()}-position-high`,
                number: dmxAddress,
                name: 'Pozice horni',
                value: 0,
            },
            {
                id: `${Date.now()}-position-low`,
                number: dmxAddress + 1,
                name: 'Pozice dolni',
                value: 0,
            },
            {
                id: `${Date.now()}-speed`,
                number: dmxAddress + 2,
                name: 'Rychlost',
                value: 128,
            },
        ]

        const newMotor: StepperMotor = {
            id: Date.now().toString(),
            name: motorName.trim(),
            dmxAddress,
            universeId: selectedUniverseId,
            channelCount: 3,
            channels,
            currentPosition: 0,
            targetPosition: 0,
            speed: 128,
            acceleration: 10,
            maxSteps,
        }

        setStepperMotors((current) => [...current, newMotor])
        setMotorName('')
        setMotorDmxAddress('1')
        setMotorMaxSteps('10000')
        setIsMotorDialogOpen(false)
        toast.success(`Krokovy motor "${newMotor.name}" pridan`)
    }

    const addServo = () => {
        if (!servoName.trim()) {
            toast.error('Zadejte nazev serva')
            return
        }
        if (!selectedUniverseId) {
            toast.error('Vyberte univerzum')
            return
        }

        const dmxAddress = parseInt(servoDmxAddress)
        const minAngle = parseInt(servoMinAngle)
        const maxAngle = parseInt(servoMaxAngle)

        if (dmxAddress < 1 || dmxAddress > 512) {
            toast.error('DMX adresa musi byt mezi 1 a 512')
            return
        }

        const newServo: Servo = {
            id: Date.now().toString(),
            name: servoName.trim(),
            dmxAddress,
            universeId: selectedUniverseId,
            channelId: `${Date.now()}-servo`,
            currentAngle: minAngle,
            targetAngle: minAngle,
            minAngle,
            maxAngle,
            speed: 100,
        }

        setServos((current) => [...current, newServo])
        setServoName('')
        setServoDmxAddress('1')
        setServoMinAngle('0')
        setServoMaxAngle('180')
        setIsServoDialogOpen(false)
        toast.success(`Servo "${newServo.name}" pridano`)
    }

    const updateMotorPosition = (motorId: string, position: number) => {
        setStepperMotors((current) =>
            current.map((motor) => {
                if (motor.id === motorId) {
                    const positionHigh = Math.floor(position / 256)
                    const positionLow = position % 256
                    return {
                        ...motor,
                        targetPosition: position,
                        channels: motor.channels.map((ch) => {
                            if (ch.name === 'Pozice horni') return { ...ch, value: positionHigh }
                            if (ch.name === 'Pozice dolni') return { ...ch, value: positionLow }
                            return ch
                        }),
                    }
                }
                return motor
            })
        )
    }

    const updateMotorSpeed = (motorId: string, speed: number) => {
        setStepperMotors((current) =>
            current.map((motor) =>
                motor.id === motorId
                    ? {
                          ...motor,
                          speed,
                          channels: motor.channels.map((ch) =>
                              ch.name === 'Rychlost' ? { ...ch, value: speed } : ch
                          ),
                      }
                    : motor
            )
        )
    }

    const updateServoAngle = (servoId: string, angle: number) => {
        setServos((current) =>
            current.map((servo) =>
                servo.id === servoId
                    ? {
                          ...servo,
                          targetAngle: angle,
                          currentAngle: angle,
                      }
                    : servo
            )
        )
    }

    const deleteMotor = (motorId: string) => {
        const motor = stepperMotors.find((m) => m.id === motorId)
        setStepperMotors((current) => current.filter((m) => m.id !== motorId))
        if (motor) {
            toast.success(`Motor "${motor.name}" smazan`)
        }
    }

    const deleteServo = (servoId: string) => {
        const servo = servos.find((s) => s.id === servoId)
        setServos((current) => current.filter((s) => s.id !== servoId))
        if (servo) {
            toast.success(`Servo "${servo.name}" smazano`)
        }
    }

    return (
        <Tabs defaultValue="steppers" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="steppers" className="flex items-center gap-2">
                    <GearSix />
                    Krokove motory
                </TabsTrigger>
                <TabsTrigger value="servos" className="flex items-center gap-2">
                    <ArrowsOutCardinal />
                    Serva
                </TabsTrigger>
            </TabsList>

            <TabsContent value="steppers">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold">Krokove motory</h2>
                        <p className="text-sm text-muted-foreground">Ovladani pozice a rychlosti krokovych motoru</p>
                    </div>
                    <Dialog open={isMotorDialogOpen} onOpenChange={setIsMotorDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2" disabled={universes.length === 0}>
                                <Plus weight="bold" />
                                Pridat motor
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Pridat krokovy motor</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="motor-name">Nazev motoru</Label>
                                    <Input
                                        id="motor-name"
                                        value={motorName}
                                        onChange={(e) => setMotorName(e.target.value)}
                                        placeholder="napr. Pan motor, Tilt motor"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="motor-universe">Univerzum</Label>
                                    <Select value={selectedUniverseId} onValueChange={setSelectedUniverseId}>
                                        <SelectTrigger id="motor-universe">
                                            <SelectValue placeholder="Vyberte univerzum" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {universes.map((universe) => (
                                                <SelectItem key={universe.id} value={universe.id}>
                                                    {universe.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="motor-dmx">DMX Adresa</Label>
                                        <Input
                                            id="motor-dmx"
                                            type="number"
                                            value={motorDmxAddress}
                                            onChange={(e) => setMotorDmxAddress(e.target.value)}
                                            min="1"
                                            max="510"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="motor-steps">Max kroku</Label>
                                        <Input
                                            id="motor-steps"
                                            type="number"
                                            value={motorMaxSteps}
                                            onChange={(e) => setMotorMaxSteps(e.target.value)}
                                            min="100"
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={addStepperMotor}>Pridat motor</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {stepperMotors.length === 0 ? (
                    <Card className="p-12 text-center">
                        <div className="flex flex-col items-center">
                            <div className="rounded-full bg-muted p-6 mb-4">
                                <GearSix size={48} className="text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Zadne krokove motory</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Pridejte krokove motory pro presne polohovani pres DMX
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {stepperMotors.map((motor) => {
                            const universe = universes.find((u) => u.id === motor.universeId)
                            return (
                                <Card key={motor.id} className="p-4">
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-lg">{motor.name}</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {universe?.name || 'Universe'}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <Badge variant="outline" className="text-xs">
                                                    @{motor.dmxAddress}
                                                </Badge>
                                                <Button
                                                    onClick={() => deleteMotor(motor.id)}
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <Trash className="text-destructive" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <label className="text-muted-foreground flex items-center gap-2">
                                                    <Target size={16} />
                                                    Pozice
                                                </label>
                                                <span className="font-mono text-primary font-semibold">
                                                    {motor.targetPosition} / {motor.maxSteps}
                                                </span>
                                            </div>
                                            <Slider
                                                value={[motor.targetPosition]}
                                                onValueChange={(values) =>
                                                    updateMotorPosition(motor.id, values[0])
                                                }
                                                max={motor.maxSteps}
                                                step={1}
                                                className="cursor-pointer"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <label className="text-muted-foreground flex items-center gap-2">
                                                    <GearSix size={16} />
                                                    Rychlost
                                                </label>
                                                <span className="font-mono text-primary font-semibold">
                                                    {motor.speed}
                                                </span>
                                            </div>
                                            <Slider
                                                value={[motor.speed]}
                                                onValueChange={(values) =>
                                                    updateMotorSpeed(motor.id, values[0])
                                                }
                                                max={255}
                                                step={1}
                                                className="cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </TabsContent>

            <TabsContent value="servos">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold">Serva</h2>
                        <p className="text-sm text-muted-foreground">Ovladani pozic serv (0-180deg)</p>
                    </div>
                    <Dialog open={isServoDialogOpen} onOpenChange={setIsServoDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2" disabled={universes.length === 0}>
                                <Plus weight="bold" />
                                Pridat servo
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Pridat servo</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="servo-name">Nazev serva</Label>
                                    <Input
                                        id="servo-name"
                                        value={servoName}
                                        onChange={(e) => setServoName(e.target.value)}
                                        placeholder="napr. Spot 1, Zrcadlo 2"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="servo-universe">Univerzum</Label>
                                    <Select value={selectedUniverseId} onValueChange={setSelectedUniverseId}>
                                        <SelectTrigger id="servo-universe">
                                            <SelectValue placeholder="Vyberte univerzum" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {universes.map((universe) => (
                                                <SelectItem key={universe.id} value={universe.id}>
                                                    {universe.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="servo-dmx">DMX Adresa</Label>
                                    <Input
                                        id="servo-dmx"
                                        type="number"
                                        value={servoDmxAddress}
                                        onChange={(e) => setServoDmxAddress(e.target.value)}
                                        min="1"
                                        max="512"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="servo-min">Min uhel (deg)</Label>
                                        <Input
                                            id="servo-min"
                                            type="number"
                                            value={servoMinAngle}
                                            onChange={(e) => setServoMinAngle(e.target.value)}
                                            min="0"
                                            max="180"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="servo-max">Max uhel (deg)</Label>
                                        <Input
                                            id="servo-max"
                                            type="number"
                                            value={servoMaxAngle}
                                            onChange={(e) => setServoMaxAngle(e.target.value)}
                                            min="0"
                                            max="180"
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={addServo}>Pridat servo</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {servos.length === 0 ? (
                    <Card className="p-12 text-center">
                        <div className="flex flex-col items-center">
                            <div className="rounded-full bg-muted p-6 mb-4">
                                <ArrowsOutCardinal size={48} className="text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Zadna serva</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Pridejte serva pro uhlove polohovani pres DMX
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {servos.map((servo) => {
                            const universe = universes.find((u) => u.id === servo.universeId)
                            return (
                                <Card key={servo.id} className="p-4">
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-lg">{servo.name}</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {universe?.name || 'Universe'}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <Badge variant="outline" className="text-xs">
                                                    @{servo.dmxAddress}
                                                </Badge>
                                                <Button
                                                    onClick={() => deleteServo(servo.id)}
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <Trash className="text-destructive" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <label className="text-muted-foreground">Uhel</label>
                                                <span className="font-mono text-primary font-semibold">
                                                    {servo.targetAngle}deg
                                                </span>
                                            </div>
                                            <Slider
                                                value={[servo.targetAngle]}
                                                onValueChange={(values) =>
                                                    updateServoAngle(servo.id, values[0])
                                                }
                                                min={servo.minAngle}
                                                max={servo.maxAngle}
                                                step={1}
                                                className="cursor-pointer"
                                            />
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>{servo.minAngle}deg</span>
                                                <span>{servo.maxAngle}deg</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </TabsContent>
        </Tabs>
    )
}
