import { useState, lazy, Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lightbulb, Palette, Gear, GearSix, Lightning, Plugs, Play, Cube, SquaresFour } from '@phosphor-icons/react'
import { Universe, Fixture, Scene, StepperMotor, Servo, Effect } from '@/lib/types'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { Toaster } from '@/components/ui/sonner'
import { useKVStore } from '@/state/kvProvider'
import { ScenesStoreProvider } from '@/state/scenesStore'

const FixturesView = lazy(() => import('@/components/FixturesView'))
const ScenesView = lazy(() => import('@/components/ScenesView'))
const SetupView = lazy(() => import('@/components/SetupView'))
const MotorsView = lazy(() => import('@/components/MotorsView'))
const EffectsView = lazy(() => import('@/components/EffectsView'))
const ConnectionView = lazy(() => import('@/components/ConnectionView'))
const LiveControlView = lazy(() => import('@/components/LiveControlView'))
const ControlBlocksDemo = lazy(() => import('@/components/ControlBlocksDemo'))
const CustomPageBuilder = lazy(() => import('@/components/CustomPageBuilder'))

function App() {
    const [universes, setUniverses] = useKVStore<Universe[]>('dmx-universes', [])
    const [fixtures, setFixtures] = useKVStore<Fixture[]>('dmx-fixtures', [])
    const [scenes, setScenes] = useKVStore<Scene[]>('dmx-scenes', [])
    const [stepperMotors, setStepperMotors] = useKVStore<StepperMotor[]>('dmx-stepper-motors', [])
    const [servos, setServos] = useKVStore<Servo[]>('dmx-servos', [])
    const [effects, setEffects] = useKVStore<Effect[]>('dmx-effects', [])
    const [activeScene, setActiveScene] = useState<string | null>(null)

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Toaster />
            <PWAInstallPrompt />
            
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">DMX 512 Kontroler</h1>
                    <p className="text-sm text-muted-foreground mt-1">Profesionalni rizeni osvetleni a motoru</p>
                </header>

                <Tabs defaultValue="custom" className="w-full">
                    <TabsList className="grid w-full grid-cols-9 mb-6 h-auto">
                        <TabsTrigger value="custom" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
                            <SquaresFour weight="fill" />
                            <span className="text-xs sm:text-sm">Moje stranka</span>
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
                            <span className="text-xs sm:text-sm">Svetla</span>
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
                            <span className="text-xs sm:text-sm">Sceny</span>
                        </TabsTrigger>
                        <TabsTrigger value="connection" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
                            <Plugs />
                            <span className="text-xs sm:text-sm">Pripojeni</span>
                        </TabsTrigger>
                        <TabsTrigger value="setup" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
                            <Gear />
                            <span className="text-xs sm:text-sm">Nastaveni</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="custom" className="mt-0">
                        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Nacitam...</div>}>
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
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="blocks" className="mt-0">
                        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Nacitam...</div>}>
                            <ControlBlocksDemo />
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="live" className="mt-0">
                        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Nacitam...</div>}>
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
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="fixtures" className="mt-0">
                        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Nacitam...</div>}>
                            <FixturesView
                                fixtures={fixtures || []}
                                setFixtures={setFixtures}
                                universes={universes || []}
                                activeScene={activeScene}
                            />
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="motors" className="mt-0">
                        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Nacitam...</div>}>
                            <MotorsView
                                stepperMotors={stepperMotors || []}
                                setStepperMotors={setStepperMotors}
                                servos={servos || []}
                                setServos={setServos}
                                universes={universes || []}
                            />
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="effects" className="mt-0">
                        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Nacitam...</div>}>
                            <EffectsView
                                effects={effects || []}
                                setEffects={setEffects}
                                fixtures={fixtures || []}
                                setFixtures={setFixtures}
                            />
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="scenes" className="mt-0">
                        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Nacitam...</div>}>
                            <ScenesStoreProvider
                                value={{
                                    scenes: scenes || [],
                                    setScenes,
                                    fixtures: fixtures || [],
                                    setFixtures,
                                    universes: universes || [],
                                    activeSceneId: activeScene,
                                    setActiveSceneId: setActiveScene,
                                }}
                            >
                                <ScenesView />
                            </ScenesStoreProvider>
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="connection" className="mt-0">
                        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Nacitam...</div>}>
                            <ConnectionView />
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="setup" className="mt-0">
                        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Nacitam...</div>}>
                            <SetupView
                                universes={universes || []}
                                setUniverses={setUniverses}
                                fixtures={fixtures || []}
                                setFixtures={setFixtures}
                            />
                        </Suspense>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default App




