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
            toast.error('Please enter a scene name')
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
        toast.success(`Scene "${newScene.name}" saved`)
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
        toast.success(`Scene "${scene.name}" recalled`)
    }

    const deleteScene = (sceneId: string) => {
        const scene = scenes.find((s) => s.id === sceneId)
        setScenes((currentScenes) => currentScenes.filter((s) => s.id !== sceneId))
        if (activeScene === sceneId) {
            setActiveScene(null)
        }
        if (scene) {
            toast.success(`Scene "${scene.name}" deleted`)
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold">Scenes</h2>
                    <p className="text-sm text-muted-foreground">Save and recall lighting states</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus weight="bold" />
                            Save Scene
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Save Current Scene</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="scene-name">Scene Name</Label>
                                <Input
                                    id="scene-name"
                                    value={sceneName}
                                    onChange={(e) => setSceneName(e.target.value)}
                                    placeholder="e.g., Opening Look, Full Intensity"
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
                                Save Scene
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
                        <h3 className="text-lg font-semibold mb-2">No Scenes Saved</h3>
                        <p className="text-sm text-muted-foreground max-w-md mb-4">
                            Set your fixture channels to desired values and save them as a scene for instant recall
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
                                        {new Date(scene.timestamp).toLocaleDateString()} at{' '}
                                        {new Date(scene.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => recallScene(scene)}
                                        variant={activeScene === scene.id ? 'default' : 'outline'}
                                        className="flex-1 gap-2"
                                    >
                                        <Play weight="fill" />
                                        Recall
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
