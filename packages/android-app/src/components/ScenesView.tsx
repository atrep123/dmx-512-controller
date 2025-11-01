import { Scene, Fixture } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Play, Trash, FloppyDisk } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'

interface ScenesViewProps {
    scenes: Scene[]
    setScenes: (updater: (scenes: Scene[]) => Scene[]) => void
    fixtures: Fixture[]
    setFixtures: (updater: (fixtures: Fixture[]) => Fixture[]) => void
    activeScene: string | null
    setActiveScene: (sceneId: string | null) => void
}

export default function ScenesView({
    scenes,
    setScenes,
    fixtures,
    setFixtures,
    activeScene,
    setActiveScene,
}: ScenesViewProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [sceneName, setSceneName] = useState('')

    const saveCurrentScene = () => {
        if (!sceneName.trim()) {
            toast.error('Zadejte název scény')
            return
        }

        const channelValues: Record<string, number> = {}
        fixtures.forEach((fixture) => {
            fixture.channels.forEach((channel) => {
                channelValues[channel.id] = channel.value
            })
        })

        const newScene: Scene = {
            id: Date.now().toString(),
            name: sceneName.trim(),
            channelValues,
            timestamp: Date.now(),
        }

        setScenes((currentScenes) => [...currentScenes, newScene])
        setSceneName('')
        setIsDialogOpen(false)
        toast.success(`Scéna "${newScene.name}" uložena`)
    }

    const recallScene = (scene: Scene) => {
        setFixtures((currentFixtures) =>
            currentFixtures.map((fixture) => ({
                ...fixture,
                channels: fixture.channels.map((channel) => ({
                    ...channel,
                    value: scene.channelValues[channel.id] ?? channel.value,
                })),
            }))
        )
        setActiveScene(scene.id)
        toast.success(`Scéna "${scene.name}" obnovena`)
    }

    const deleteScene = (sceneId: string) => {
        const scene = scenes.find((s) => s.id === sceneId)
        setScenes((currentScenes) => currentScenes.filter((s) => s.id !== sceneId))
        if (activeScene === sceneId) {
            setActiveScene(null)
        }
        if (scene) {
            toast.success(`Scéna "${scene.name}" smazána`)
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold">Scény</h2>
                    <p className="text-sm text-muted-foreground">Uložení a obnovení stavů osvětlení</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus weight="bold" />
                            Uložit scénu
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Uložit aktuální scénu</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="scene-name">Název scény</Label>
                                <Input
                                    id="scene-name"
                                    value={sceneName}
                                    onChange={(e) => setSceneName(e.target.value)}
                                    placeholder="např. Úvodní pohled, Plná intenzita"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            saveCurrentScene()
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={saveCurrentScene} className="gap-2">
                                <FloppyDisk weight="bold" />
                                Uložit scénu
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {scenes.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="flex flex-col items-center">
                        <div className="rounded-full bg-muted p-6 mb-4">
                            <FloppyDisk size={48} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Žádné uložené scény</h3>
                        <p className="text-sm text-muted-foreground max-w-md mb-4">
                            Nastavte kanály světel na požadované hodnoty a uložte je jako scénu pro okamžité obnovení
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {scenes.map((scene) => (
                        <Card
                            key={scene.id}
                            className={`p-4 ${activeScene === scene.id ? 'ring-2 ring-accent' : ''}`}
                        >
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg">{scene.name}</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(scene.timestamp).toLocaleDateString('cs-CZ')} v{' '}
                                        {new Date(scene.timestamp).toLocaleTimeString('cs-CZ')}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => recallScene(scene)}
                                        variant={activeScene === scene.id ? 'default' : 'outline'}
                                        className="flex-1 gap-2"
                                    >
                                        <Play weight="fill" />
                                        Obnovit
                                    </Button>
                                    <Button
                                        onClick={() => deleteScene(scene.id)}
                                        variant="outline"
                                        size="icon"
                                    >
                                        <Trash />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
