import { useCallback, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Play, Trash, FloppyDisk } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { buildScene, applySceneToFixtures, groupChannelsByUniverse } from '@/lib/sceneUtils'
import { useScenesStore } from '@/state/scenesStore'

export default function ScenesView() {
  const {
    scenes,
    fixtures,
    universes,
    upsertScene,
    removeScene,
    setFixtures,
    activeSceneId,
    setActiveSceneId,
    queueScene,
  } = useScenesStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sceneName, setSceneName] = useState('')

  const groupedScenes = useMemo(
    () =>
      scenes.map((scene) => ({
        scene,
        groupedChannels: groupChannelsByUniverse({
          scene,
          fixtures,
          universes,
        }),
      })),
    [fixtures, scenes, universes],
  )

  const handleSave = useCallback(() => {
    const trimmed = sceneName.trim()
    if (!trimmed) {
      toast.error('Zadejte nazev sceny')
      return
    }
    const snapshot = buildScene({
      fixtures,
      name: trimmed,
    })
    upsertScene(snapshot)
    setSceneName('')
    setIsDialogOpen(false)
    toast.success(`Scena "${snapshot.name}" ulozena`)
  }, [fixtures, sceneName, upsertScene])

  const handleRecall = useCallback(
    async ({ scene, groupedChannels }: (typeof groupedScenes)[number]) => {
      const txn = queueScene({ scene, groupedChannels })
      const revert = txn.createRevertGuard()
      applySceneToFixtures({
        fixtures,
        scene,
        setFixtures,
      })
      await txn.flush()
      const ack = await txn.waitAck()
      if (!ack.accepted) {
        revert()
        toast.error('Scena odmitnuta serverem - vracim puvodni stav')
        return
      }
      txn.commit()
      toast.success(`Scena "${scene.name}" obnovena`)
    },
    [fixtures, queueScene, setFixtures],
  )

  const handleDelete = useCallback(
    (sceneId: string) => {
      const scene = scenes.find((item) => item.id === sceneId)
      removeScene(sceneId)
      if (scene) {
        toast.success(`Scena "${scene.name}" smazana`)
      }
      if (activeSceneId === sceneId) {
        setActiveSceneId(null)
      }
    },
    [activeSceneId, removeScene, scenes, setActiveSceneId],
  )

  const renderEmptyState = () => (
    <Card className="p-12 text-center">
      <div className="flex flex-col items-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <FloppyDisk size={48} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Zadne ulozene sceny</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-4">
          Nastavte kanaly svetel na pozadovane hodnoty a ulozit je jako scenu pro okamzite obnoveni.
        </p>
      </div>
    </Card>
  )

  const renderSceneCard = (sceneEntry: (typeof groupedScenes)[number]) => (
    <Card
      key={sceneEntry.scene.id}
      className={`p-4 ${activeSceneId === sceneEntry.scene.id ? 'ring-2 ring-accent' : ''}`}
    >
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{sceneEntry.scene.name}</h3>
          <p className="text-xs text-muted-foreground">
            {new Date(sceneEntry.scene.timestamp).toLocaleDateString('cs-CZ')} v{' '}
            {new Date(sceneEntry.scene.timestamp).toLocaleTimeString('cs-CZ')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleRecall(sceneEntry)}
            variant={activeSceneId === sceneEntry.scene.id ? 'default' : 'outline'}
            className="flex-1 gap-2"
          >
            <Play weight="fill" />
            Obnovit
          </Button>
          <Button
            onClick={() => handleDelete(sceneEntry.scene.id)}
            variant="outline"
            size="icon"
          >
            <Trash />
          </Button>
        </div>
      </div>
    </Card>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Sceny</h2>
          <p className="text-sm text-muted-foreground">Ulozeni a obnoveni stavu osvetleni</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus weight="bold" />
              Ulozit scenu
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ulozit aktualni scenu</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="scene-name">Nazev sceny</Label>
                <Input
                  id="scene-name"
                  value={sceneName}
                  onChange={(event) => setSceneName(event.target.value)}
                  placeholder="napr. Uvodni pohled, Plna intenzita"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleSave()
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave} className="gap-2">
                <FloppyDisk weight="bold" />
                Ulozit scenu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {scenes.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groupedScenes.map((entry) => renderSceneCard(entry))}
        </div>
      )}
    </div>
  )
}
