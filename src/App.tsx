import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lightbulb, Palette, Gear } from '@phosphor-icons/react'
import { Universe, Fixture, Scene } from '@/lib/types'
import FixturesView from '@/components/FixturesView'
import ScenesView from '@/components/ScenesView'
import SetupView from '@/components/SetupView'
import { Toaster } from '@/components/ui/sonner'

function App() {
    const [universes, setUniverses] = useKV<Universe[]>('dmx-universes', [])
    const [fixtures, setFixtures] = useKV<Fixture[]>('dmx-fixtures', [])
    const [scenes, setScenes] = useKV<Scene[]>('dmx-scenes', [])
    const [activeScene, setActiveScene] = useState<string | null>(null)

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Toaster />
            
            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">DMX 512 Controller</h1>
                    <p className="text-sm text-muted-foreground mt-1">Professional Lighting Control</p>
                </header>

                <Tabs defaultValue="fixtures" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="fixtures" className="flex items-center gap-2">
                            <Lightbulb />
                            <span className="hidden sm:inline">Fixtures</span>
                        </TabsTrigger>
                        <TabsTrigger value="scenes" className="flex items-center gap-2">
                            <Palette />
                            <span className="hidden sm:inline">Scenes</span>
                        </TabsTrigger>
                        <TabsTrigger value="setup" className="flex items-center gap-2">
                            <Gear />
                            <span className="hidden sm:inline">Setup</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="fixtures" className="mt-0">
                        <FixturesView
                            fixtures={fixtures || []}
                            setFixtures={setFixtures}
                            universes={universes || []}
                            activeScene={activeScene}
                        />
                    </TabsContent>

                    <TabsContent value="scenes" className="mt-0">
                        <ScenesView
                            scenes={scenes || []}
                            setScenes={setScenes}
                            fixtures={fixtures || []}
                            setFixtures={setFixtures}
                            activeScene={activeScene}
                            setActiveScene={setActiveScene}
                        />
                    </TabsContent>

                    <TabsContent value="setup" className="mt-0">
                        <SetupView
                            universes={universes || []}
                            setUniverses={setUniverses}
                            fixtures={fixtures || []}
                            setFixtures={setFixtures}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default App