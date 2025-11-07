import { useEffect, useMemo, useState } from "react";
import { Scene, Fixture, Universe } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Play,
  Trash,
  FloppyDisk,
  Star,
  NotePencil,
  CopySimple,
  Info,
  ClipboardText,
  PushPinSimple,
} from "@phosphor-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addAckListener, removeAckListener } from "@/lib/transport";
import { setChannel, __flushForTests } from "@/lib/dmxQueue";
import { isTestEnv } from "@/lib/isTestEnv";
import { toast } from "sonner";

interface ScenesViewProps {
  scenes: Scene[];
  setScenes: (updater: (scenes: Scene[]) => Scene[]) => void;
  fixtures: Fixture[];
  setFixtures: (updater: (fixtures: Fixture[]) => Fixture[]) => void;
  universes?: Universe[];
  activeScene: string | null;
  setActiveScene: (sceneId: string | null) => void;
}

type RevertGuard = {
  prev: Fixture[];
  ackDeadline: number;
  expiresAt: number;
};

const generateId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const parseTags = (raw: string) =>
  raw
    .split(/[,;]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

export default function ScenesView({
  scenes,
  setScenes,
  fixtures,
  setFixtures,
  universes = [],
  activeScene,
  setActiveScene,
}: ScenesViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sceneName, setSceneName] = useState("");
  const [sceneDescription, setSceneDescription] = useState("");
  const [sceneTagsInput, setSceneTagsInput] = useState("");
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sceneSort, setSceneSort] = useState<"newest" | "oldest" | "az" | "za">(
    "newest"
  );
  const [revertGuard, setRevertGuard] = useState<RevertGuard | null>(null);
  const [detailScene, setDetailScene] = useState<Scene | null>(null);
  const [defaultSceneId, setDefaultSceneId] = useState<string | null>(null);

  useEffect(() => {
    if (!revertGuard) return;
    const timer = window.setTimeout(
      () => setRevertGuard(null),
      Math.max(0, revertGuard.expiresAt - Date.now())
    );
    return () => window.clearTimeout(timer);
  }, [revertGuard]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("dmx-default-scene");
      if (stored) {
        setDefaultSceneId(stored);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    scenes.forEach((scene) => (scene.tags ?? []).forEach((tag) => set.add(tag)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "cs"));
  }, [scenes]);

  const channelMeta = useMemo(() => {
    const map = new Map<
      string,
      { fixtureId: string; fixtureName: string; universe?: number }
    >();
    fixtures.forEach((fixture) => {
      const universe = universes.find((u) => u.id === fixture.universeId);
      fixture.channels.forEach((ch) =>
        map.set(ch.id, {
          fixtureId: fixture.id,
          fixtureName: fixture.name,
          universe: universe?.number,
        })
      );
    });
    return map;
  }, [fixtures, universes]);

  const sceneStats = useMemo(() => {
    const totalChannels = scenes.reduce(
      (acc, scene) => acc + Object.keys(scene.channelValues).length,
      0
    );
    const favorites = scenes.filter((scene) => scene.favorite).length;
    return {
      totalScenes: scenes.length,
      favorites,
      avgChannels: scenes.length ? Math.round(totalChannels / scenes.length) : 0,
      tagCount: availableTags.length,
    };
  }, [scenes, availableTags]);

  const filteredScenes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery = (scene: Scene) => {
      if (!query) return true;
      const haystack = [
        scene.name,
        scene.description ?? "",
        ...(scene.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    };
    const base = [...scenes]
      .filter((scene) => (favoritesOnly ? scene.favorite : true))
      .filter((scene) =>
        selectedTag ? (scene.tags ?? []).includes(selectedTag) : true
      )
      .filter(matchesQuery)
      .sort((a, b) => {
        if (!!b.favorite !== !!a.favorite) {
          return Number(!!b.favorite) - Number(!!a.favorite);
        }
        return 0;
      });
    return base.sort((a, b) => {
      switch (sceneSort) {
        case "oldest":
          return a.timestamp - b.timestamp;
        case "az":
          return a.name.localeCompare(b.name, "cs");
        case "za":
          return b.name.localeCompare(a.name, "cs");
        case "newest":
        default:
          return b.timestamp - a.timestamp;
      }
    });
  }, [scenes, favoritesOnly, selectedTag, searchQuery, sceneSort]);

  const resetDialog = () => {
    setSceneName("");
    setSceneDescription("");
    setSceneTagsInput("");
    setEditingSceneId(null);
  };

  const saveScene = () => {
    if (!sceneName.trim()) {
      toast.error("Zadejte název scény");
      return;
    }
    const tags = parseTags(sceneTagsInput);
    const metadata = {
      name: sceneName.trim(),
      description: sceneDescription.trim() || undefined,
      tags: tags.length ? tags : undefined,
    };

    if (editingSceneId) {
      setScenes((current) =>
        current.map((scene) =>
          scene.id === editingSceneId ? { ...scene, ...metadata } : scene
        )
      );
      toast.success(`Scéna „${metadata.name}“ upravena`);
    } else {
      const channelValues: Record<string, number> = {};
      fixtures.forEach((fixture) => {
        fixture.channels.forEach((channel) => {
          channelValues[channel.id] = channel.value;
        });
      });
      const newScene: Scene = {
        id: generateId(),
        name: metadata.name,
        channelValues,
        timestamp: Date.now(),
        description: metadata.description,
        tags: metadata.tags,
      };
      setScenes((current) => [...current, newScene]);
      toast.success(`Scéna „${newScene.name}“ uložená`);
    }
    resetDialog();
    setIsDialogOpen(false);
  };

  const recallScene = (scene: Scene) => {
    const prevFixtures = JSON.parse(JSON.stringify(fixtures)) as Fixture[];
    setFixtures((currentFixtures) =>
      currentFixtures.map((fixture) => ({
        ...fixture,
        channels: fixture.channels.map((channel) => ({
          ...channel,
          value: scene.channelValues[channel.id] ?? channel.value,
        })),
      }))
    );
    setActiveScene(scene.id);
    toast.success(`Scéna „${scene.name}“ obnovena`);

    const guard: RevertGuard = {
      prev: prevFixtures,
      ackDeadline: Date.now() + 1200,
      expiresAt: Date.now() + 5000,
    };
    setRevertGuard(guard);
    const onAck = (ack: { accepted: boolean }) => {
      if (Date.now() <= guard.ackDeadline && ack.accepted === false) {
        setFixtures(() => guard.prev);
        setRevertGuard(null);
        toast.error("Scéna odmítnuta serverem – vracím původní stav");
      }
    };
    addAckListener(onAck as any);
    setTimeout(() => removeAckListener(onAck as any), 1200);

    try {
      const byUniverse = new Map<number, { ch: number; val: number }[]>();
      for (const fixture of fixtures) {
        const universe = universes.find((u) => u.id === fixture.universeId);
        const uniNum = universe ? universe.number : 0;
        for (const ch of fixture.channels) {
          const targetVal = scene.channelValues[ch.id];
          if (typeof targetVal === "number") {
            const base = typeof fixture.dmxAddress === "number" ? fixture.dmxAddress : 1;
            const offset = typeof ch.number === "number" ? ch.number - 1 : 0;
            const absCh = Math.max(1, Math.min(512, base + offset));
            const arr = byUniverse.get(uniNum) ?? [];
            arr.push({ ch: absCh, val: targetVal });
            byUniverse.set(uniNum, arr);
          }
        }
      }
      for (const [uni, entries] of byUniverse) {
        for (const entry of entries) {
          setChannel(uni, entry.ch, entry.val);
        }
      }
      if (isTestEnv()) {
        Promise.resolve()
          .then(() => __flushForTests())
          .catch((error) => {
            if (import.meta.env.DEV) {
              console.warn("scenes_flush_skip", error);
            }
          });
      }
    } catch (error) {
      console.error("scenes_recall_error", error);
    }
  };

  const deleteScene = (sceneId: string) => {
    const scene = scenes.find((s) => s.id === sceneId);
    setScenes((current) => current.filter((s) => s.id !== sceneId));
    if (activeScene === sceneId) {
      setActiveScene(null);
    }
    if (scene) {
      toast.success(`Scéna „${scene.name}“ smazána`);
    }
  };

  const toggleFavorite = (sceneId: string) => {
    setScenes((current) =>
      current.map((scene) =>
        scene.id === sceneId ? { ...scene, favorite: !scene.favorite } : scene
      )
    );
  };

  const duplicateScene = (scene: Scene) => {
    const copy: Scene = {
      ...scene,
      id: generateId(),
      name: `${scene.name} (kopie)`,
      timestamp: Date.now(),
    };
    setScenes((current) => [...current, copy]);
    toast.success(`Scéna „${scene.name}“ duplikována`);
  };

  const handleManualRevert = () => {
    if (!revertGuard) return;
    setFixtures(() => revertGuard.prev);
    setRevertGuard(null);
    toast.message("Scéna byla vrácena zpět");
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag((current) => (current === tag ? null : tag));
    setSearchQuery("");
  };

  const openEditDialog = (scene: Scene) => {
    setEditingSceneId(scene.id);
    setSceneName(scene.name);
    setSceneDescription(scene.description ?? "");
    setSceneTagsInput((scene.tags ?? []).join(", "));
    setIsDialogOpen(true);
  };

  const openDetail = (scene: Scene) => setDetailScene(scene);
  const closeDetail = () => setDetailScene(null);

  const copySceneJson = (scene: Scene) => {
    const payload = JSON.stringify(scene, null, 2);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(payload).then(() => {
        toast.success("Scéna zkopírována do schránky");
      });
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = payload;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand("copy");
        toast.success("Scéna zkopírována do schránky");
      } catch {
        toast.error("Nepodařilo se zkopírovat JSON");
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const setDefaultScene = (sceneId: string | null) => {
    setDefaultSceneId(sceneId);
    try {
      if (sceneId) {
        window.localStorage.setItem("dmx-default-scene", sceneId);
      } else {
        window.localStorage.removeItem("dmx-default-scene");
      }
    } catch {
      /* ignore */
    }
  };

  const describeScene = (scene: Scene) => {
    const channelIds = Object.keys(scene.channelValues);
    const fixturesTouched = new Set<string>();
    const universesTouched = new Set<number>();
    channelIds.forEach((id) => {
      const meta = channelMeta.get(id);
      if (meta) {
        fixturesTouched.add(meta.fixtureId);
        if (typeof meta.universe === "number") {
          universesTouched.add(meta.universe);
        }
      }
    });
    return {
      channelCount: channelIds.length,
      fixtures: fixturesTouched.size,
      universes: universesTouched.size,
    };
  };

  const showEmptyState = scenes.length === 0;
  const detailStats = detailScene ? describeScene(detailScene) : null;

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Scény</h2>
            <p className="text-sm text-muted-foreground">
              Ukládej a vyvolávej kompletní stavy osvětlení
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:w-3/4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="scene-search">Hledání / filtrování</Label>
              <Input
                id="scene-search"
                placeholder="např. intro, fade, #warmup"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-end">
              <div className="space-y-2">
                <Label>Řazení</Label>
                <Select
                  value={sceneSort}
                  onValueChange={(value) =>
                    setSceneSort(value as typeof sceneSort)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Řazení" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Nejnovější</SelectItem>
                    <SelectItem value="oldest">Nejstarší</SelectItem>
                    <SelectItem value="az">A → Z</SelectItem>
                    <SelectItem value="za">Z → A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={favoritesOnly ? "default" : "outline"}
                className="gap-2"
                onClick={() => setFavoritesOnly((prev) => !prev)}
              >
                <Star weight={favoritesOnly ? "fill" : "regular"} />
                Oblíbené
              </Button>
              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetDialog();
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    className="gap-2"
                    type="button"
                    onClick={() => {
                      resetDialog();
                    }}
                  >
                    <Plus weight="bold" />
                    Uložit scénu
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingSceneId ? "Upravit scénu" : "Uložit aktuální scénu"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="scene-name">Název scény</Label>
                      <Input
                        id="scene-name"
                        value={sceneName}
                        onChange={(e) => setSceneName(e.target.value)}
                        placeholder="např. Úvodní pohled"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            saveScene();
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scene-description">Poznámky</Label>
                      <Textarea
                        id="scene-description"
                        value={sceneDescription}
                        onChange={(e) => setSceneDescription(e.target.value)}
                        placeholder="Krátký popis, kdy scénu použít"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scene-tags">
                        Štítky{" "}
                        <span className="text-xs text-muted-foreground">
                          (oddělené čárkou)
                        </span>
                      </Label>
                      <Input
                        id="scene-tags"
                        value={sceneTagsInput}
                        onChange={(e) => setSceneTagsInput(e.target.value)}
                        placeholder="např. intro, fade, #warmup"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={resetDialog}>
                      Zrušit
                    </Button>
                    <Button onClick={saveScene} className="gap-2">
                      <FloppyDisk weight="bold" />
                      {editingSceneId ? "Uložit změny" : "Uložit scénu"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4 text-sm">
            <p className="text-muted-foreground">Scény</p>
            <p className="text-2xl font-semibold">{sceneStats.totalScenes}</p>
          </Card>
          <Card className="p-4 text-sm">
            <p className="text-muted-foreground">Oblíbené</p>
            <p className="text-2xl font-semibold">{sceneStats.favorites}</p>
          </Card>
          <Card className="p-4 text-sm">
            <p className="text-muted-foreground">Průměr kanálů</p>
            <p className="text-2xl font-semibold">{sceneStats.avgChannels}</p>
          </Card>
          <Card className="p-4 text-sm">
            <p className="text-muted-foreground">Štítky</p>
            <p className="text-2xl font-semibold">{sceneStats.tagCount}</p>
          </Card>
        </div>

        {availableTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Štítky:</span>
            {availableTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleTagClick(tag)}
              >
                #{tag}
              </Badge>
            ))}
            {(selectedTag || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTag(null);
                  setSearchQuery("");
                }}
              >
                Vymazat filtr
              </Button>
            )}
          </div>
        )}
      </div>

      {revertGuard && (
        <Card className="mb-4 border-dashed">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">DMX příkazy právě probíhají</p>
              <p className="text-sm text-muted-foreground">
                Pokud se scéna nehodí, můžeš ji během několika sekund vrátit.
              </p>
            </div>
            <Button variant="outline" onClick={handleManualRevert}>
              Vrátit změny
            </Button>
          </div>
        </Card>
      )}

      {filteredScenes.length === 0 ? (
        showEmptyState ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <FloppyDisk size={48} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Žádná uložená scéna
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mb-4">
                Nastav kanály svítidel na požadované hodnoty a ulož je jako scénu
                pro okamžité obnovení.
              </p>
            </div>
          </Card>
        ) : (
          <Card className="p-6 text-sm text-muted-foreground">
            Žádná scéna neodpovídá aktuálnímu filtru. Zkus změnit vyhledávání
            nebo štítky.
          </Card>
        )
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredScenes.map((scene) => {
            const stats = describeScene(scene);
            const isDefault = scene.id === defaultSceneId;
            return (
              <Card
                key={scene.id}
                className={`p-4 ${
                  activeScene === scene.id ? "ring-2 ring-accent" : ""
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {scene.name}
                        {isDefault && (
                          <Badge variant="default" className="text-xs gap-1">
                            <PushPinSimple weight="bold" />
                            Výchozí
                          </Badge>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(scene.timestamp).toLocaleDateString("cs-CZ")} v{" "}
                        {new Date(scene.timestamp).toLocaleTimeString("cs-CZ")}
                      </p>
                      {scene.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {scene.description}
                        </p>
                      )}
                      {scene.tags && scene.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {scene.tags.map((tag) => (
                            <Badge
                              key={`${scene.id}-${tag}`}
                              variant="outline"
                              className="text-xs cursor-pointer"
                              onClick={() => handleTagClick(tag)}
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {stats.fixtures} svítidel · {stats.channelCount} kanálů ·{" "}
                        {stats.universes} univerz
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleFavorite(scene.id)}
                        aria-label="Přidat mezi oblíbené"
                      >
                        <Star
                          weight={scene.favorite ? "fill" : "regular"}
                          className={scene.favorite ? "text-yellow-500" : ""}
                        />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openDetail(scene)}
                        aria-label="Detail scény"
                      >
                        <Info />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => duplicateScene(scene)}
                        aria-label="Duplikovat scénu"
                      >
                        <CopySimple />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditDialog(scene)}
                        aria-label="Upravit scénu"
                      >
                        <NotePencil />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => recallScene(scene)}
                      variant={activeScene === scene.id ? "default" : "outline"}
                      className="flex-1 gap-2"
                    >
                      <Play weight="fill" />
                      Obnovit
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setDefaultScene(isDefault ? null : scene.id)
                      }
                      aria-label="Nastavit jako výchozí"
                    >
                      <PushPinSimple weight={isDefault ? "fill" : "regular"} />
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
            );
          })}
        </div>
      )}

      <Dialog open={detailScene !== null} onOpenChange={(open) => !open && closeDetail()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail scény</DialogTitle>
            <DialogDescription>
              Přehled metadat a kanálů scény
            </DialogDescription>
          </DialogHeader>
          {detailScene && detailStats && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold">{detailScene.name}</h3>
                {detailScene.favorite && <Badge>Oblíbená</Badge>}
                {detailScene.description && (
                  <Badge variant="outline">{detailScene.description}</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Uloženo{" "}
                {new Date(detailScene.timestamp).toLocaleString("cs-CZ")}
              </p>
              {detailScene.tags && detailScene.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {detailScene.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-3 text-sm">
                <Card className="p-3">
                  <p className="text-muted-foreground text-xs">Kanálů</p>
                  <p className="text-xl font-semibold">
                    {detailStats.channelCount}
                  </p>
                </Card>
                <Card className="p-3">
                  <p className="text-muted-foreground text-xs">Svítidel</p>
                  <p className="text-xl font-semibold">
                    {detailStats.fixtures}
                  </p>
                </Card>
                <Card className="p-3">
                  <p className="text-muted-foreground text-xs">Univerz</p>
                  <p className="text-xl font-semibold">
                    {detailStats.universes}
                  </p>
                </Card>
              </div>
              <div className="space-y-2">
                <Label>Kanály (ukázka)</Label>
                <div className="rounded border p-3 max-h-48 overflow-y-auto text-xs font-mono space-y-1">
                  {Object.entries(detailScene.channelValues)
                    .slice(0, 20)
                    .map(([channelId, value]) => {
                      const meta = channelMeta.get(channelId);
                      return (
                        <div
                          key={channelId}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="truncate">
                            {meta?.fixtureName ?? "Kanál"} ({channelId})
                          </span>
                          <span>{value}</span>
                        </div>
                      );
                    })}
                  {Object.keys(detailScene.channelValues).length > 20 && (
                    <p className="text-muted-foreground">
                      … a další kanály
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => copySceneJson(detailScene)}
                >
                  <ClipboardText />
                  Kopírovat JSON
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() =>
                    setDefaultScene(
                      detailScene.id === defaultSceneId ? null : detailScene.id
                    )
                  }
                >
                  <PushPinSimple />
                  {detailScene.id === defaultSceneId
                    ? "Zrušit výchozí"
                    : "Nastavit jako výchozí"}
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeDetail}>
              Zavřít
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
