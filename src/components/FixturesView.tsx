import { Fixture, Universe } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Faders } from '@phosphor-icons/react'

interface FixturesViewProps {
    fixtures: Fixture[]
    setFixtures: (updater: (fixtures: Fixture[]) => Fixture[]) => void
    universes: Universe[]
    activeScene: string | null
}

export default function FixturesView({ fixtures, setFixtures, universes }: FixturesViewProps) {
    const updateChannelValue = (fixtureId: string, channelId: string, value: number) => {
        setFixtures((currentFixtures) =>
            currentFixtures.map((fixture) =>
                fixture.id === fixtureId
                    ? {
                          ...fixture,
                          channels: fixture.channels.map((channel) =>
                              channel.id === channelId ? { ...channel, value } : channel
                          ),
                      }
                    : fixture
            )
        )
    }

    if (fixtures.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                    <Faders size={48} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Fixtures Yet</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                    Add your first fixture in the Setup tab to start controlling DMX channels
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {fixtures.map((fixture) => {
                const universe = universes.find((u) => u.id === fixture.universeId)
                return (
                    <Card key={fixture.id} className="p-4">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-semibold text-lg">{fixture.name}</h3>
                                <p className="text-xs text-muted-foreground">
                                    {universe?.name || 'Universe'}
                                </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                @{fixture.dmxAddress}
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            {fixture.channels.map((channel) => (
                                <div key={channel.id} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <label className="text-muted-foreground">
                                            Ch {channel.number}: {channel.name}
                                        </label>
                                        <span className="font-mono text-primary font-semibold">
                                            {channel.value}
                                        </span>
                                    </div>
                                    <Slider
                                        value={[channel.value]}
                                        onValueChange={(values) =>
                                            updateChannelValue(fixture.id, channel.id, values[0])
                                        }
                                        max={255}
                                        step={1}
                                        className="cursor-pointer"
                                    />
                                </div>
                            ))}
                        </div>
                    </Card>
                )
            })}
        </div>
    )
}
