import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lightbulb, Palette, Gear, GearSix, Lightning, Plugs } from '@phosphor-icons/react'
import { Universe, Fixture, Scene, StepperMotor, Servo, Effect } from '@/lib/types'
import FixturesView from '@/components/FixturesView'
import ScenesView from '@/components/ScenesView'
import SetupView from '@/components/SetupView'
import MotorsView from '@/components/MotorsView'
import EffectsView from '@/components/EffectsView'
import ConnectionView from '@/components/ConnectionView'
import { Toaster } from '@/components/ui/sonner'

function App() {
    const [universes, setUniverses] = useKV<Universe[]>('dmx-universes', [])
    const [fixtures, setFixtures] = useKV<Fixture[]>('dmx-fixtures', [])
    const [scenes, setScenes] = useKV<Scene[]>('dmx-scenes', [])
    const [stepperMotors, setStepperMotors] = useKV<StepperMotor[]>('dmx-stepper-motors', [])
    const [servos, setServos] = useKV<Servo[]>('dmx-servos', [])
    const [effects, setEffects] = useKV<Effect[]>('dmx-effects', [])
    const [activeScene, setActiveScene] = useState<string | null>(null)

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Toaster />
            
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">DMX 512 Controller</h1>
                    <p className="text-sm text-muted-foreground mt-1">Professional Lighting & Motion Control</p>
                </header>

                <Tabs defaultValue="fixtures" className="w-full">
                    <TabsList className="grid w-full grid-cols-6 mb-6 h-auto">
                        <TabsTrigger value="fixtures" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
                            <Lightbulb />
                            <span className="text-xs sm:text-sm">Fixtures</span>
                        </TabsTrigger>
                        <TabsTrigger value="motors" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
                            <GearSix />
                            <span className="text-xs sm:text-sm">Motors</span>
                        </TabsTrigger>
                        <TabsTrigger value="effects" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
                            <Lightning />
                            <span className="text-xs sm:text-sm">Effects</span>
                        </TabsTrigger>
                        <TabsTrigger value="scenes" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
                            <Palette />
                            <span className="text-xs sm:text-sm">Scenes</span>
                        </TabsTrigger>
                        <TabsTrigger value="connection" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
                            <Plugs />
                            <span className="text-xs sm:text-sm">Connect</span>
                        </TabsTrigger>
                        <TabsTrigger value="setup" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
                            <Gear />
                            <span className="text-xs sm:text-sm">Setup</span>
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

                    <TabsContent value="motors" className="mt-0">
                        <MotorsView
                            stepperMotors={stepperMotors || []}
                            setStepperMotors={setStepperMotors}
                            servos={servos || []}
                            setServos={setServos}
                            universes={universes || []}
                        />
                    </TabsContent>

                    <TabsContent value="effects" className="mt-0">
                        <EffectsView
                            effects={effects || []}
                            setEffects={setEffects}
                            fixtures={fixtures || []}
                            setFixtures={setFixtures}
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

                    <TabsContent value="connection" className="mt-0">
                        <ConnectionView />
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