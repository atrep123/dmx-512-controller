import { Universe, Fixture, DMXChannel } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash, Lightbulb } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { fixtureTemplates, findFixtureTemplate } from '@/lib/fixtureTemplates'

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
    const [fixtureTemplateId, setFixtureTemplateId] = useState('')
    const selectedTemplate = useMemo(() => findFixtureTemplate(fixtureTemplateId), [fixtureTemplateId])

    const addUniverse = () => {
        if (!universeName.trim()) {
            toast.error('Zadejte název univerza')
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
        toast.success(`Univerzum "${newUniverse.name}" vytvořeno`)
    }

    const deleteUniverse = (universeId: string) => {
        const universe = universes.find((u) => u.id === universeId)
        const universeFixtures = fixtures.filter((f) => f.universeId === universeId)

        if (universeFixtures.length > 0) {
            toast.error('Nelze smazat univerzum se světly')
            return
        }

        setUniverses((currentUniverses) => currentUniverses.filter((u) => u.id !== universeId))
        if (universe) {
            toast.success(`Univerzum "${universe.name}" smazáno`)
        }
    }

    const addFixture = () => {
        if (!fixtureName.trim()) {
            toast.error('Zadejte název světla')
            return
        }

        if (!selectedUniverseId) {
            toast.error('Vyberte univerzum')
            return
        }

        const dmxAddress = parseInt(fixtureDmxAddress)
        const requestedChannelCount = parseInt(fixtureChannelCount)
        const channelCount = selectedTemplate?.channelCount ?? requestedChannelCount

        if (Number.isNaN(dmxAddress) || dmxAddress < 1 || dmxAddress > 512) {
            toast.error('DMX adresa musí být mezi 1 a 512')
            return
        }

        if (Number.isNaN(channelCount) || channelCount < 1 || channelCount > 32) {
            toast.error('Počet kanálů musí být mezi 1 a 32')
            return
        }

        if (dmxAddress + channelCount - 1 > 512) {
            toast.error('Světlo překračuje limit DMX univerza (512 kanálů)')
            return
        }

        const overlapping = fixtures.find((f) => {
            if (f.universeId !== selectedUniverseId) return false
            const fEnd = f.dmxAddress + f.channelCount - 1
            const newEnd = dmxAddress + channelCount - 1
            return !(newEnd < f.dmxAddress || dmxAddress > fEnd)
        })

        if (overlapping) {
            toast.error(`Adresa koliduje se světlem "${overlapping.name}"`)
            return
        }

        const channelNames = (selectedTemplate?.channelNames ?? getChannelNames(fixtureType, channelCount)).slice(0, channelCount)
        const channels: DMXChannel[] = []
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
        setFixtureTemplateId('')
        setIsFixtureDialogOpen(false)
        toast.success(`Světlo "${newFixture.name}" přidáno`)
    }

    const handleFixtureTemplateSelect = (templateId: string) => {
        setFixtureTemplateId(templateId)
        if (!templateId) return
        const template = findFixtureTemplate(templateId)
        if (template) {
            setFixtureType(template.fixtureType)
            setFixtureChannelCount(String(template.channelCount))
        }
    }

    const handleFixtureTypeChange = (value: Fixture['fixtureType']) => {
        setFixtureTemplateId('')
        setFixtureType(value)
    }

const deleteFixture = (fixtureId: string) => {
        const fixture = fixtures.find((f) => f.id === fixtureId)
        setFixtures((currentFixtures) => currentFixtures.filter((f) => f.id !== fixtureId))
        if (fixture) {
            toast.success(`Světlo "${fixture.name}" smazáno`)
        }
    }

    const getChannelNames = (type: Fixture['fixtureType'], count: number): string[] => {
        switch (type) {
            case 'rgb':
                return ['Červená', 'Zelená', 'Modrá']
            case 'rgbw':
                return ['Červená', 'Zelená', 'Modrá', 'Bílá']
            case 'moving-head':
                return ['Intenzita', 'Pan', 'Tilt', 'Barva', 'Gobo', 'Závěrka', 'Hranol', 'Zaostření']
            case 'stepper-motor':
                return ['Pozice horní', 'Pozice dolní', 'Rychlost']
            case 'servo':
                return ['Úhel']
            default:
                return Array.from({ length: count }, (_, i) => `Kanál ${i + 1}`)
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold">Univerza</h2>
                        <p className="text-sm text-muted-foreground">Správa DMX univerzí</p>
                    </div>
                    <Dialog open={isUniverseDialogOpen} onOpenChange={setIsUniverseDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus weight="bold" />
                                Přidat univerzum
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Přidat DMX univerzum</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="universe-name">Název univerza</Label>
                                    <Input
                                        id="universe-name"
                                        value={universeName}
                                        onChange={(e) => setUniverseName(e.target.value)}
                                        placeholder="např. Hlavní jeviště, Zadní světlo"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="universe-number">Číslo univerza</Label>
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
                                <Button onClick={addUniverse}>Přidat univerzum</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {universes.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-sm text-muted-foreground">Žádná nastavená univerza</p>
                    </Card>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                        {universes.map((universe) => (
                            <Card key={universe.id} className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">{universe.name}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Univerzum {universe.number}
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
                        <h2 className="text-xl font-semibold">Světla</h2>
                        <p className="text-sm text-muted-foreground">Konfigurace světelných zařízení</p>
                    </div>
                    <Dialog open={isFixtureDialogOpen} onOpenChange={setIsFixtureDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2" disabled={universes.length === 0}>
                                <Plus weight="bold" />
                                Přidat světlo
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Přidat světlo</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fixture-name">Název světla</Label>
                                    <Input
                                        id="fixture-name"
                                        value={fixtureName}
                                        onChange={(e) => setFixtureName(e.target.value)}
                                        placeholder="např. Přední zálivka, Moving Head 1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fixture-universe">Univerzum</Label>
                                    <Select value={selectedUniverseId} onValueChange={setSelectedUniverseId}>
                                        <SelectTrigger id="fixture-universe">
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
                                    <Label htmlFor="fixture-template">Šablona</Label>
                                    <Select value={fixtureTemplateId} onValueChange={handleFixtureTemplateSelect}>
                                        <SelectTrigger id="fixture-template">
                                            <SelectValue placeholder="Vyberte šablonu (volitelné)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Vlastní</SelectItem>
                                            {fixtureTemplates.map((template) => (
                                                <SelectItem key={template.id} value={template.id}>
                                                    {template.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {selectedTemplate && (
                                    <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                                        <p className="font-semibold text-foreground">{selectedTemplate.name}</p>
                                        <p>{selectedTemplate.description}</p>
                                        <div className="mt-2 grid grid-cols-2 gap-1">
                                            {selectedTemplate.channelNames.map((name, index) => (
                                                <span key={`${selectedTemplate.id}-${index}`}>
                                                    Ch {index + 1}: {name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="fixture-type">Typ světla</Label>
                                    <Select
                                        value={fixtureType}
                                        onValueChange={(value) =>
                                            handleFixtureTypeChange(value as Fixture['fixtureType'])
                                        }
                                    >
                                        <SelectTrigger id="fixture-type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="generic">Obecné</SelectItem>
                                            <SelectItem value="rgb">RGB</SelectItem>
                                            <SelectItem value="rgbw">RGBW</SelectItem>
                                            <SelectItem value="moving-head">Moving Head</SelectItem>
                                            <SelectItem value="stepper-motor">Krokový motor</SelectItem>
                                            <SelectItem value="servo">Servo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="dmx-address">DMX Adresa</Label>
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
                                        <Label htmlFor="channel-count">Kanály</Label>
                                        <Input
                                            id="channel-count"
                                            type="number"
                                            value={fixtureChannelCount}
                                            onChange={(e) => {
                                            setFixtureChannelCount(e.target.value)
                                            setFixtureTemplateId('')
                                        }}
                                            min="1"
                                            max="32"
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={addFixture}>Přidat světlo</Button>
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
                            <h3 className="text-lg font-semibold mb-2">Zatím žádná světla</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                {universes.length === 0
                                    ? 'Nejprve vytvořte univerzum, pak přidejte světla pro ovládání DMX kanálů'
                                    : 'Přidejte první světlo pro ovládání DMX kanálů'}
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
                                                    {universe?.name || 'Univerzum'}
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
                                            <Badge variant="outline">{fixture.channelCount} kanálů</Badge>
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
