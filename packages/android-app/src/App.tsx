import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lightbulb, Palette, Gear, GearSix, Lightning, Plugs, Play, Cube, SquaresFour } from '@phosphor-icons/react'
import { Universe, Fixture, Scene, StepperMotor, Servo, Effect } from '@/lib/types'
import FixturesView from '@/components/FixturesView'
import ScenesView from '@/components/ScenesView'
import SetupView from '@/components/SetupView'
import MotorsView from '@/components/MotorsView'
import EffectsView from '@/components/EffectsView'
import ConnectionView from '@/components/ConnectionView'
import LiveControlView from '@/components/LiveControlView'
import ControlBlocksDemo from '@/components/ControlBlocksDemo'
import CustomPageBuilder from '@/components/CustomPageBuilder'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
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
            <PWAInstallPrompt />
            
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">DMX 512 Kontrolér</h1>
                    <p className="text-sm text-muted-foreground mt-1">Profesionální řízení osvětlení a motorů</p>
                </header>

                <Tabs defaultValue="custom" className="w-full">
                    <TabsList className="grid w-full grid-cols-9 mb-6 h-auto">
                        <TabsTrigger value="custom" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
                            <SquaresFour weight="fill" />
                            <span className="text-xs sm:text-sm">Moje stránka</span>
                        </TabsTrigger>
                        <TabsTrigger value="blocks" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
                            <Cube weight="fill" />
                            <span className="text-xs sm:text-sm">UI Bloky</span>
                        </TabsTrigger>
                        <TabsTrigger value="live" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
                            <Play weight="fill" />
                            <span className="text-xs sm:text-sm">Kontrola</span>
                        </TabsTrigger>
                        <TabsTrigger value="fixtures" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
                            <Lightbulb />
                            <span className="text-xs sm:text-sm">Světla</span>
                        </TabsTrigger>
                        <TabsTrigger value="motors" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
                            <GearSix />
                            <span className="text-xs sm:text-sm">Motory</span>
                        </TabsTrigger>
                        <TabsTrigger value="effects" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
                            <Lightning />
                            <span className="text-xs sm:text-sm">Efekty</span>
                        </TabsTrigger>
                        <TabsTrigger value="scenes" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
                            <Palette />
                            <span className="text-xs sm:text-sm">Scény</span>
                        </TabsTrigger>
                        <TabsTrigger value="connection" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
                            <Plugs />
                            <span className="text-xs sm:text-sm">Připojení</span>
                        </TabsTrigger>
                        <TabsTrigger value="setup" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
                            <Gear />
                            <span className="text-xs sm:text-sm">Nastavení</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="custom" className="mt-0">
                        <CustomPageBuilder
                            effects={effects || []}
                            fixtures={fixtures || []}
                            stepperMotors={stepperMotors || []}
                            servos={servos || []}
                            setEffects={setEffects}
                            setFixtures={setFixtures}
                            setStepperMotors={setStepperMotors}
                            setServos={setServos}
                        />
                    </TabsContent>

                    <TabsContent value="blocks" className="mt-0">
                        <ControlBlocksDemo />
                    </TabsContent>

                    <TabsContent value="live" className="mt-0">
                        <LiveControlView
                            fixtures={fixtures || []}
                            setFixtures={setFixtures}
                            effects={effects || []}
                            setEffects={setEffects}
                            universes={universes || []}
                            stepperMotors={stepperMotors || []}
                            setStepperMotors={setStepperMotors}
                            servos={servos || []}
                            setServos={setServos}
                        />
                    </TabsContent>

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