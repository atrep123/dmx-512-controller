import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lightbulb, Palette, Gear, GearSix, Lightning, Plugs, Play, Cube, SquaresFour } from '@phosphor-icons/react'
import { Universe, Fixture, Scene, StepperMotor, Servo, Effect } from '@/lib/types'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { DesktopOnboarding, ONBOARDING_STORAGE_KEY } from '@/components/DesktopOnboarding'
import { Toaster } from '@/components/ui/sonner'
import { ThemeToggle } from '@/components/ThemeToggle'
import { saveScenes } from '@/lib/scenesClient'
import { downloadShow, uploadShow, type ShowSnapshot } from '@/lib/showClient'
import { toast } from 'sonner'

const FixturesView = lazy(() => import('@/components/FixturesView'))
const ScenesView = lazy(() => import('@/components/ScenesView'))
const SetupView = lazy(() => import('@/components/SetupView'))
const MotorsView = lazy(() => import('@/components/MotorsView'))
const EffectsView = lazy(() => import('@/components/EffectsView'))
const ConnectionView = lazy(() => import('@/components/ConnectionView'))
const LiveControlView = lazy(() => import('@/components/LiveControlView'))
const ControlBlocksDemo = lazy(() => import('@/components/ControlBlocksDemo'))
const CustomPageBuilder = lazy(() => import('@/components/CustomPageBuilder'))
const DataManagementView = lazy(() => import('@/components/DataManagementView'))

const SHOW_PERSIST_DEBOUNCE_MS = 400

function App() {
    const [universes, setUniversesState] = useState<Universe[]>([])
    const [fixtures, setFixturesState] = useState<Fixture[]>([])
    const [stepperMotors, setStepperMotorsState] = useState<StepperMotor[]>([])
    const [servos, setServosState] = useState<Servo[]>([])
    const [effects, setEffectsState] = useState<Effect[]>([])
    const [activeScene, setActiveScene] = useState<string | null>(null)
    const [scenes, setScenesState] = useState<Scene[]>([])
    const [scenesLoading, setScenesLoading] = useState<boolean>(true)
    const [scenesError, setScenesError] = useState<string | null>(null)
    const [showLoading, setShowLoading] = useState<boolean>(true)
    const [showError, setShowError] = useState<string | null>(null)
    const [lastExportedAt, setLastExportedAt] = useState<string | number | null>(null)
    const [showDirty, setShowDirty] = useState<boolean>(false)
    const [isDesktopShell, setIsDesktopShell] = useState<boolean>(false)
    const [needsDesktopOnboarding, setNeedsDesktopOnboarding] = useState<boolean>(false)
    const isMountedRef = useRef(true)
    const showPersistTimerRef = useRef<number | null>(null)
    const pendingShowSnapshotRef = useRef<ShowSnapshot | null>(null)

    const flushPendingShowSnapshot = useCallback(async () => {
        const snapshot = pendingShowSnapshotRef.current
        if (!snapshot) {
            return
        }
        pendingShowSnapshotRef.current = null
        try {
            await uploadShow(snapshot)
            setShowDirty(false)
            setLastExportedAt(snapshot.exportedAt)
        } catch (error) {
            console.error('show_sync_failed', error)
            toast.error('Nepodarilo se ulozit konfiguraci')
            pendingShowSnapshotRef.current = snapshot
            if (showPersistTimerRef.current !== null) {
                window.clearTimeout(showPersistTimerRef.current)
            }
            showPersistTimerRef.current = window.setTimeout(() => {
                showPersistTimerRef.current = null
                void flushPendingShowSnapshot()
            }, SHOW_PERSIST_DEBOUNCE_MS)
        }
    }, [])

    useEffect(() => {
        return () => {
            isMountedRef.current = false
            if (showPersistTimerRef.current !== null) {
                window.clearTimeout(showPersistTimerRef.current)
            }
            void flushPendingShowSnapshot()
        }
    }, [flushPendingShowSnapshot])

    const restartDesktopOnboarding = useCallback(() => {
        if (typeof window !== 'undefined') {
            try {
                window.localStorage.removeItem(ONBOARDING_STORAGE_KEY)
            } catch (error) {
                console.warn('onboarding_reset_failed', error)
            }
        }
        setNeedsDesktopOnboarding(true)
    }, [])

    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }
        const desktopDetected = '__TAURI_INTERNALS__' in window
        setIsDesktopShell(desktopDetected)
        if (!desktopDetected) {
            setNeedsDesktopOnboarding(false)
            return
        }
        try {
            const stored = window.localStorage.getItem(ONBOARDING_STORAGE_KEY)
            setNeedsDesktopOnboarding(!stored)
        } catch {
            setNeedsDesktopOnboarding(true)
        }
    }, [])

    useEffect(() => {
        if (!isDesktopShell) {
            return
        }
        let active = true
        let unlisten: (() => void) | undefined
        const bind = async () => {
            try {
                const { listen } = await import('@tauri-apps/api/event')
                if (!active) {
                    return
                }
                unlisten = await listen('desktop://onboarding/reset', () => {
                    restartDesktopOnboarding()
                })
            } catch (error) {
                console.warn('desktop_onboarding_event_failed', error)
            }
        }
        bind()
        return () => {
            active = false
            if (typeof unlisten === 'function') {
                void unlisten()
            }
        }
    }, [isDesktopShell, restartDesktopOnboarding])

    const refreshShow = useCallback(async (): Promise<boolean> => {
        setShowLoading(true)
        setScenesLoading(true)
        try {
            const snapshot = await downloadShow()
            if (!isMountedRef.current) {
                return false
            }
            setShowError(null)
            setScenesError(null)
            if (Array.isArray(snapshot.universes)) {
                setUniversesState(snapshot.universes)
            }
            if (Array.isArray(snapshot.fixtures)) {
                setFixturesState(snapshot.fixtures)
            }
            if (Array.isArray(snapshot.effects)) {
                setEffectsState(snapshot.effects)
            }
            if (Array.isArray(snapshot.stepperMotors)) {
                setStepperMotorsState(snapshot.stepperMotors)
            }
            if (Array.isArray(snapshot.servos)) {
                setServosState(snapshot.servos)
            }
            if (Array.isArray(snapshot.scenes)) {
                setScenesState(snapshot.scenes)
            }
            if (snapshot.exportedAt) {
                setLastExportedAt(snapshot.exportedAt)
            }
            pendingShowSnapshotRef.current = null
            if (showPersistTimerRef.current !== null) {
                window.clearTimeout(showPersistTimerRef.current)
                showPersistTimerRef.current = null
            }
            setShowDirty(false)
            return true
        } catch (error) {
            if (isMountedRef.current) {
                console.error('show_fetch_failed', error)
                setShowError('Nepodarilo se nacist konfiguraci')
                setScenesError('Nepodarilo se nacist sceny')
            }
            return false
        } finally {
            if (isMountedRef.current) {
                setShowLoading(false)
                setScenesLoading(false)
            }
        }
    }, [])

    useEffect(() => {
        void refreshShow()
    }, [refreshShow])
    const scheduleShowSnapshotPersist = useCallback(
        (snapshot: ShowSnapshot) => {
            pendingShowSnapshotRef.current = snapshot
            setShowDirty(true)
            if (showPersistTimerRef.current !== null) {
                window.clearTimeout(showPersistTimerRef.current)
            }
            showPersistTimerRef.current = window.setTimeout(() => {
                showPersistTimerRef.current = null
                void flushPendingShowSnapshot()
            }, SHOW_PERSIST_DEBOUNCE_MS)
        },
        [flushPendingShowSnapshot]
    )

    const persistShowSnapshot = useCallback(
        (overrides?: Partial<ShowSnapshot>) => {
            const snapshot: ShowSnapshot = {
                version: '1.1',
                exportedAt: new Date().toISOString(),
                universes: overrides?.universes ?? universes,
                fixtures: overrides?.fixtures ?? fixtures,
                scenes: overrides?.scenes ?? scenes,
                effects: overrides?.effects ?? effects,
                stepperMotors: overrides?.stepperMotors ?? stepperMotors,
                servos: overrides?.servos ?? servos,
            }
            setLastExportedAt(snapshot.exportedAt)
            scheduleShowSnapshotPersist(snapshot)
        },
        [universes, fixtures, scenes, effects, stepperMotors, servos, scheduleShowSnapshotPersist]
    )

    const setUniverses = useCallback(
        (updater: (universes: Universe[]) => Universe[]) => {
            setUniversesState((current) => {
                const next = updater(current)
                persistShowSnapshot({ universes: next })
                return next
            })
        },
        [persistShowSnapshot]
    )

    const setFixtures = useCallback(
        (updater: (fixtures: Fixture[]) => Fixture[]) => {
            setFixturesState((current) => {
                const next = updater(current)
                persistShowSnapshot({ fixtures: next })
                return next
            })
        },
        [persistShowSnapshot]
    )

    const setEffects = useCallback(
        (updater: (effects: Effect[]) => Effect[]) => {
            setEffectsState((current) => {
                const next = updater(current)
                persistShowSnapshot({ effects: next })
                return next
            })
        },
        [persistShowSnapshot]
    )

    const setStepperMotors = useCallback(
        (updater: (motors: StepperMotor[]) => StepperMotor[]) => {
            setStepperMotorsState((current) => {
                const next = updater(current)
                persistShowSnapshot({ stepperMotors: next })
                return next
            })
        },
        [persistShowSnapshot]
    )

    const setServos = useCallback(
        (updater: (servos: Servo[]) => Servo[]) => {
            setServosState((current) => {
                const next = updater(current)
                persistShowSnapshot({ servos: next })
                return next
            })
        },
        [persistShowSnapshot]
    )

    const persistScenes = useCallback(
        async (next: Scene[]) => {
            try {
                await saveScenes(next)
            } catch (error) {
                console.error('scenes_save_failed', error)
                toast.error('Nepodařilo se uložit scény')
                void refreshShow()
            }
        },
        [refreshShow]
    )

    const setScenes = useCallback(
        (updater: (scenes: Scene[]) => Scene[]) => {
            setScenesState((current) => {
                const next = updater(current)
                void persistScenes(next)
                persistShowSnapshot({ scenes: next })
                return next
            })
        },
        [persistScenes, persistShowSnapshot]
    )

    const tabButtonClass = 'flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 min-h-[48px] rounded-lg text-xs sm:text-sm font-medium transition-colors data-[state=active]:bg-background data-[state=active]:text-foreground'

    if (isDesktopShell && needsDesktopOnboarding) {
        return (
            <>
                <DesktopOnboarding onComplete={() => setNeedsDesktopOnboarding(false)} />
                <Toaster />
            </>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Toaster />
            <PWAInstallPrompt />
            
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <header className="mb-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">DMX 512 Kontrol�r</h1>
                            <p className="text-sm text-muted-foreground mt-1">Profesion�ln� ��zen� osv�tlen� a motor�</p>
                        </div>
                        <ThemeToggle />
                    </div>
                </header>

                <Tabs defaultValue="custom" className="w-full">
                    <TabsList className="grid w-full grid-cols-9 mb-6 h-auto gap-2 rounded-xl bg-muted/30 p-1">
                        <TabsTrigger value="custom" className={tabButtonClass}>
                            <SquaresFour weight="fill" />
                            <span className="text-xs sm:text-sm">Moje stránka</span>
                        </TabsTrigger>
                        <TabsTrigger value="blocks" className={tabButtonClass}>
                            <Cube weight="fill" />
                            <span className="text-xs sm:text-sm">UI Bloky</span>
                        </TabsTrigger>
                        <TabsTrigger value="live" className={tabButtonClass}>
                            <Play weight="fill" />
                            <span className="text-xs sm:text-sm">Kontrola</span>
                        </TabsTrigger>
                        <TabsTrigger value="fixtures" className={tabButtonClass}>
                            <Lightbulb />
                            <span className="text-xs sm:text-sm">Světla</span>
                        </TabsTrigger>
                        <TabsTrigger value="motors" className={tabButtonClass}>
                            <GearSix />
                            <span className="text-xs sm:text-sm">Motory</span>
                        </TabsTrigger>
                        <TabsTrigger value="effects" className={tabButtonClass}>
                            <Lightning />
                            <span className="text-xs sm:text-sm">Efekty</span>
                        </TabsTrigger>
                        <TabsTrigger value="scenes" className={tabButtonClass}>
                            <Palette />
                            <span className="text-xs sm:text-sm">Scény</span>
                        </TabsTrigger>
                        <TabsTrigger value="connection" className={tabButtonClass}>
                            <Plugs />
                            <span className="text-xs sm:text-sm">Připojení</span>
                        </TabsTrigger>
                        <TabsTrigger value="setup" className={tabButtonClass}>
                            <Gear />
                            <span className="text-xs sm:text-sm">Nastavení</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="custom" className="mt-0">
                        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Načítám…</div>}>
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
                        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Načítám…</div>}>
                            <ControlBlocksDemo />
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="live" className="mt-0">
                        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Načítám…</div>}>
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
                        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Načítám…</div>}>
                            <FixturesView
                                fixtures={fixtures || []}
                                setFixtures={setFixtures}
                                universes={universes || []}
                                activeScene={activeScene}
                            />
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="motors" className="mt-0">
                        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Načítám…</div>}>
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
                        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Načítám…</div>}>
                            <EffectsView
                                effects={effects || []}
                                setEffects={setEffects}
                                fixtures={fixtures || []}
                                setFixtures={setFixtures}
                            />
                        </Suspense>
                    </TabsContent>

<TabsContent value="scenes" className="mt-0">
                        {scenesLoading ? (
                            <div className="p-4 text-sm text-muted-foreground">Načítám scény…</div>
                        ) : scenesError ? (
                            <div className="p-4 text-sm text-destructive">{scenesError}</div>
                        ) : (
                            <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Načítám…</div>}>
                                <ScenesView
                                    scenes={scenes}
                                    setScenes={setScenes}
                                    fixtures={fixtures || []}
                                    setFixtures={setFixtures}
                                    universes={universes || []}
                                    activeScene={activeScene}
                                    setActiveScene={setActiveScene}
                                />
                            </Suspense>
                        )}
                    </TabsContent>

                    <TabsContent value="connection" className="mt-0">
                        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Načítám…</div>}>
                            <ConnectionView />
                        </Suspense>
                    </TabsContent>

                                        <TabsContent value="setup" className="mt-0 space-y-4">
                        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Načítám…</div>}>
                            <SetupView
                                universes={universes || []}
                                setUniverses={setUniverses}
                                fixtures={fixtures || []}
                                setFixtures={setFixtures}
                                onRestartDesktopWizard={isDesktopShell ? restartDesktopOnboarding : undefined}
                            />
                        </Suspense>
                        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Načítám…</div>}>
                            <DataManagementView
                                universes={universes || []}
                                fixtures={fixtures || []}
                                scenes={scenes || []}
                                effects={effects || []}
                                stepperMotors={stepperMotors || []}
                                servos={servos || []}
                                setUniverses={setUniverses}
                                setFixtures={setFixtures}
                                setScenes={setScenes}
                                setEffects={setEffects}
                                setStepperMotors={setStepperMotors}
                                setServos={setServos}
                                showLoading={showLoading}
                                showError={showError}
                                showDirty={showDirty}
                                onRefreshShow={refreshShow}
                                lastExportedAt={lastExportedAt}
                            />
                        </Suspense>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default App
