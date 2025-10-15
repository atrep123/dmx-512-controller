import { Universe, Fixture, DMXChannel } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash, Lightbulb } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'

interface SetupViewProps {
    universes: Universe[]
    setUniverses: (updater: (universes: Universe[]) => Universe[]) => void
    fixtures: Fixture[]
    setFixtures: (updater: (fixtures: Fixture[]) => Fixture[]) => void
}

export default function SetupView({ universes, setUniverses, fixtures, setFixtures }: SetupViewProps) {
    const [isUniverseDialogOpen, setIsUniverseDialogOpen] = useState(false)
    const [isFixtureDialogOpen, setIsFixtureDialogOpen] = useState(false)
    const [universeName, setUniverseName] = useState('')
    const [universeNumber, setUniverseNumber] = useState('1')
    const [fixtureName, setFixtureName] = useState('')
    const [fixtureDmxAddress, setFixtureDmxAddress] = useState('1')
    const [fixtureChannelCount, setFixtureChannelCount] = useState('1')
    const [selectedUniverseId, setSelectedUniverseId] = useState('')
    const [fixtureType, setFixtureType] = useState<Fixture['fixtureType']>('generic')

    const addUniverse = () => {
        if (!universeName.trim()) {
            toast.error('Please enter a universe name')
            return
        }

        const newUniverse: Universe = {
            id: Date.now().toString(),
            name: universeName.trim(),
            number: parseInt(universeNumber) || 1,
        }

        setUniverses((currentUniverses) => [...currentUniverses, newUniverse])
        setUniverseName('')
        setUniverseNumber('1')
        setIsUniverseDialogOpen(false)
        toast.success(`Universe "${newUniverse.name}" created`)
    }

    const deleteUniverse = (universeId: string) => {
        const universe = universes.find((u) => u.id === universeId)
        const universeFixtures = fixtures.filter((f) => f.universeId === universeId)

        if (universeFixtures.length > 0) {
            toast.error('Cannot delete universe with fixtures')
            return
        }

        setUniverses((currentUniverses) => currentUniverses.filter((u) => u.id !== universeId))
        if (universe) {
            toast.success(`Universe "${universe.name}" deleted`)
        }
    }

    const addFixture = () => {
        if (!fixtureName.trim()) {
            toast.error('Please enter a fixture name')
            return
        }

        if (!selectedUniverseId) {
            toast.error('Please select a universe')
            return
        }

        const dmxAddress = parseInt(fixtureDmxAddress)
        const channelCount = parseInt(fixtureChannelCount)

        if (dmxAddress < 1 || dmxAddress > 512) {
            toast.error('DMX address must be between 1 and 512')
            return
        }

        if (channelCount < 1 || channelCount > 32) {
            toast.error('Channel count must be between 1 and 32')
            return
        }

        if (dmxAddress + channelCount - 1 > 512) {
            toast.error('Fixture exceeds DMX universe limit (512 channels)')
            return
        }

        const overlapping = fixtures.find((f) => {
            if (f.universeId !== selectedUniverseId) return false
            const fEnd = f.dmxAddress + f.channelCount - 1
            const newEnd = dmxAddress + channelCount - 1
            return !(newEnd < f.dmxAddress || dmxAddress > fEnd)
        })

        if (overlapping) {
            toast.error(`Address conflicts with fixture "${overlapping.name}"`)
            return
        }

        const channels: DMXChannel[] = []
        const channelNames = getChannelNames(fixtureType, channelCount)

        for (let i = 0; i < channelCount; i++) {
            channels.push({
                id: `${Date.now()}-${i}`,
                number: dmxAddress + i,
                name: channelNames[i] || `Channel ${i + 1}`,
                value: 0,
            })
        }

        const newFixture: Fixture = {
            id: Date.now().toString(),
            name: fixtureName.trim(),
            dmxAddress,
            channelCount,
            universeId: selectedUniverseId,
            channels,
            fixtureType,
        }

        setFixtures((currentFixtures) => [...currentFixtures, newFixture])
        setFixtureName('')
        setFixtureDmxAddress('1')
        setFixtureChannelCount('1')
        setFixtureType('generic')
        setIsFixtureDialogOpen(false)
        toast.success(`Fixture "${newFixture.name}" added`)
    }

    const deleteFixture = (fixtureId: string) => {
        const fixture = fixtures.find((f) => f.id === fixtureId)
        setFixtures((currentFixtures) => currentFixtures.filter((f) => f.id !== fixtureId))
        if (fixture) {
            toast.success(`Fixture "${fixture.name}" deleted`)
        }
    }

    const getChannelNames = (type: Fixture['fixtureType'], count: number): string[] => {
        switch (type) {
            case 'rgb':
                return ['Red', 'Green', 'Blue']
            case 'rgbw':
                return ['Red', 'Green', 'Blue', 'White']
            case 'moving-head':
                return ['Intensity', 'Pan', 'Tilt', 'Color', 'Gobo', 'Shutter', 'Prism', 'Focus']
            default:
                return Array.from({ length: count }, (_, i) => `Channel ${i + 1}`)
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold">Universes</h2>
                        <p className="text-sm text-muted-foreground">Manage DMX universes</p>
                    </div>
                    <Dialog open={isUniverseDialogOpen} onOpenChange={setIsUniverseDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus weight="bold" />
                                Add Universe
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add DMX Universe</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="universe-name">Universe Name</Label>
                                    <Input
                                        id="universe-name"
                                        value={universeName}
                                        onChange={(e) => setUniverseName(e.target.value)}
                                        placeholder="e.g., Main Stage, Back Light"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="universe-number">Universe Number</Label>
                                    <Input
                                        id="universe-number"
                                        type="number"
                                        value={universeNumber}
                                        onChange={(e) => setUniverseNumber(e.target.value)}
                                        min="1"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={addUniverse}>Add Universe</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {universes.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-sm text-muted-foreground">No universes configured</p>
                    </Card>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                        {universes.map((universe) => (
                            <Card key={universe.id} className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">{universe.name}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Universe {universe.number}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => deleteUniverse(universe.id)}
                                        variant="ghost"
                                        size="icon"
                                    >
                                        <Trash className="text-destructive" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold">Fixtures</h2>
                        <p className="text-sm text-muted-foreground">Configure lighting fixtures</p>
                    </div>
                    <Dialog open={isFixtureDialogOpen} onOpenChange={setIsFixtureDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2" disabled={universes.length === 0}>
                                <Plus weight="bold" />
                                Add Fixture
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Fixture</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fixture-name">Fixture Name</Label>
                                    <Input
                                        id="fixture-name"
                                        value={fixtureName}
                                        onChange={(e) => setFixtureName(e.target.value)}
                                        placeholder="e.g., Front Wash, Moving Head 1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fixture-universe">Universe</Label>
                                    <Select value={selectedUniverseId} onValueChange={setSelectedUniverseId}>
                                        <SelectTrigger id="fixture-universe">
                                            <SelectValue placeholder="Select universe" />
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
                                    <Label htmlFor="fixture-type">Fixture Type</Label>
                                    <Select
                                        value={fixtureType}
                                        onValueChange={(value) =>
                                            setFixtureType(value as Fixture['fixtureType'])
                                        }
                                    >
                                        <SelectTrigger id="fixture-type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="generic">Generic</SelectItem>
                                            <SelectItem value="rgb">RGB</SelectItem>
                                            <SelectItem value="rgbw">RGBW</SelectItem>
                                            <SelectItem value="moving-head">Moving Head</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="dmx-address">DMX Address</Label>
                                        <Input
                                            id="dmx-address"
                                            type="number"
                                            value={fixtureDmxAddress}
                                            onChange={(e) => setFixtureDmxAddress(e.target.value)}
                                            min="1"
                                            max="512"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="channel-count">Channels</Label>
                                        <Input
                                            id="channel-count"
                                            type="number"
                                            value={fixtureChannelCount}
                                            onChange={(e) => setFixtureChannelCount(e.target.value)}
                                            min="1"
                                            max="32"
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={addFixture}>Add Fixture</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {fixtures.length === 0 ? (
                    <Card className="p-12 text-center">
                        <div className="flex flex-col items-center">
                            <div className="rounded-full bg-muted p-6 mb-4">
                                <Lightbulb size={48} className="text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No Fixtures Yet</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                {universes.length === 0
                                    ? 'Create a universe first, then add fixtures to control DMX channels'
                                    : 'Add your first fixture to start controlling DMX channels'}
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {fixtures.map((fixture) => {
                            const universe = universes.find((u) => u.id === fixture.universeId)
                            return (
                                <Card key={fixture.id} className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold">{fixture.name}</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {universe?.name || 'Universe'}
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => deleteFixture(fixture.id)}
                                                variant="ghost"
                                                size="icon"
                                            >
                                                <Trash className="text-destructive" />
                                            </Button>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            <Badge variant="outline">@{fixture.dmxAddress}</Badge>
                                            <Badge variant="outline">{fixture.channelCount} channels</Badge>
                                            <Badge variant="secondary">{fixture.fixtureType}</Badge>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
