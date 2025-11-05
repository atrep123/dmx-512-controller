import { createContext, useContext, useMemo, useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import type { Fixture, Scene, Universe } from '@/lib/types'
import type { Ack } from '@/shared/types'
import {
  getDefaultQueue,
  type DmxQueue,
  type Timer,
} from '@/lib/dmxQueue'
import { addAckListener, removeAckListener } from '@/lib/transport'

export interface SceneQueueResult {
  createRevertGuard(): () => void
  flush(): Promise<string[]>
  waitAck(): Promise<{ accepted: boolean; failed?: { ack: string } }>
  commit(): void
}

export interface QueueSceneInput {
  scene: Scene
  groupedChannels: Map<number, { channel: number; value: number }[]>
}

interface ScenesStoreValue {
  scenes: Scene[]
  setScenes: Dispatch<SetStateAction<Scene[]>>
  fixtures: Fixture[]
  setFixtures: Dispatch<SetStateAction<Fixture[]>>
  universes: Universe[]
  activeSceneId: string | null
  setActiveSceneId: Dispatch<SetStateAction<string | null>>
  upsertScene: (scene: Scene) => void
  removeScene: (sceneId: string) => void
  queueScene: (input: QueueSceneInput) => SceneQueueResult
}

const noop = () => {
  throw new Error('ScenesStoreProvider missing')
}

const defaultValue: ScenesStoreValue = {
  scenes: [],
  setScenes: noop,
  fixtures: [],
  setFixtures: noop,
  universes: [],
  activeSceneId: null,
  setActiveSceneId: noop,
  upsertScene: noop,
  removeScene: noop,
  queueScene: () => ({
    createRevertGuard: () => noop(),
    flush: async () => [],
    waitAck: async () => ({ accepted: true }),
    commit: noop,
  }),
}

const ScenesStoreContext = createContext<ScenesStoreValue>(defaultValue)

export interface ScenesStoreProviderProps {
  children: ReactNode
  value?: Partial<ScenesStoreValue>
  queue?: DmxQueue
  ackTimeoutMs?: number
  timer?: Timer
}

export function ScenesStoreProvider({
  children,
  value,
  queue = getDefaultQueue(),
  ackTimeoutMs = 1200,
  timer,
}: ScenesStoreProviderProps) {
  const [scenesState, setScenesState] = useState<Scene[]>(value?.scenes ?? [])
  const [fixturesState, setFixturesState] = useState<Fixture[]>(value?.fixtures ?? [])
  const [universesState] = useState<Universe[]>(value?.universes ?? [])
  const [activeSceneState, setActiveSceneState] = useState<string | null>(
    value?.activeSceneId ?? null,
  )

  const scenesData = value?.scenes ?? scenesState
  const setScenesFn = value?.setScenes ?? setScenesState
  const fixturesData = value?.fixtures ?? fixturesState
  const setFixturesFn = value?.setFixtures ?? setFixturesState
  const universesData = value?.universes ?? universesState
  const activeSceneIdData = value?.activeSceneId ?? activeSceneState
  const setActiveSceneIdFn = value?.setActiveSceneId ?? setActiveSceneState

  const mergedValue = useMemo<ScenesStoreValue>(() => {
    const usedQueue = queue
    const effectiveTimer: Timer = timer ?? {
      now: () => Date.now(),
      setTimeout: (cb, ms) => globalThis.setTimeout(cb, ms),
      clearTimeout: (id) => globalThis.clearTimeout(id),
      requestAnimationFrame: (cb) =>
        globalThis.requestAnimationFrame
          ? globalThis.requestAnimationFrame(cb)
          : globalThis.setTimeout(() => cb(Date.now()), 16),
      cancelAnimationFrame: (id) =>
        globalThis.cancelAnimationFrame
          ? globalThis.cancelAnimationFrame(id)
          : globalThis.clearTimeout(id),
    }

    const upsertScene = (scene: Scene) => {
      setScenesFn((current) => {
        const idx = current.findIndex((s) => s.id === scene.id)
        if (idx === -1) return [...current, scene]
        const copy = current.slice()
        copy[idx] = scene
        return copy
      })
    }

    const removeScene = (sceneId: string) => {
      setScenesFn((current) => current.filter((scene) => scene.id !== sceneId))
    }

    const queueScene = ({
      scene,
      groupedChannels,
    }: QueueSceneInput): SceneQueueResult => {
      const ackIdsRef = { current: [] as string[] }
      const immediateAcksRef = { current: [] as Ack[] }
      const fixturesSnapshot = fixturesData.map((fixture) => ({
        ...fixture,
        channels: fixture.channels.map((channel) => ({ ...channel })),
      }))

      for (const [universe, entries] of groupedChannels) {
        for (const entry of entries) {
          usedQueue.enqueue({
            universe,
            channel: entry.channel,
            value: entry.value,
          })
        }
      }

      return {
        createRevertGuard() {
          return () => setFixturesFn(fixturesSnapshot)
        },
        async flush() {
          const results = await usedQueue.flushNow()
          const immediate = results.filter((result) => result.ack)
          immediateAcksRef.current = immediate.map((result) => result.ack!)
          ackIdsRef.current = results
            .filter((result) => !result.ack)
            .map((result) => result.ackId)
          return results.map((result) => result.ackId)
        },
        async waitAck() {
          if (immediateAcksRef.current.length > 0) {
            const records = immediateAcksRef.current.splice(0)
            const failedRecord = records.find((record) => record.accepted === false)
            if (failedRecord) {
              return { accepted: false, failed: { ack: failedRecord.ack } }
            }
            if (ackIdsRef.current.length === 0) {
              return { accepted: true }
            }
          } else if (ackIdsRef.current.length === 0) {
            return { accepted: true }
          }
          return new Promise<{ accepted: boolean; failed?: { ack: string } }>(
            (resolve) => {
              const pending = new Set(ackIdsRef.current)
              const failures: string[] = []
              let timeoutId: number | undefined

              const handleAck = (ack: { ack: string; accepted: boolean }) => {
                if (!pending.has(ack.ack)) return
                if (!ack.accepted) {
                  failures.push(ack.ack)
                }
                pending.delete(ack.ack)
                if (pending.size === 0 || failures.length > 0) {
                  cleanup()
                  resolve({
                    accepted: failures.length === 0,
                    failed: failures.length
                      ? { ack: failures[0] }
                      : undefined,
                  })
                }
              }

              const cleanup = () => {
                removeAckListener(handleAck as any)
                if (timeoutId !== undefined) {
                  effectiveTimer.clearTimeout(timeoutId)
                }
              }

              addAckListener(handleAck as any)
              timeoutId = effectiveTimer.setTimeout(() => {
                cleanup()
                resolve({
                  accepted: failures.length === 0 && pending.size === 0,
                  failed:
                    failures.length > 0
                      ? { ack: failures[0] }
                      : pending.size > 0
                        ? { ack: Array.from(pending)[0] }
                        : undefined,
                })
              }, ackTimeoutMs)
            },
          )
        },
        commit() {
          setActiveSceneIdFn(scene.id)
        },
      }
    }

    return {
      scenes: scenesData,
      setScenes: setScenesFn,
      fixtures: fixturesData,
      setFixtures: setFixturesFn,
      universes: universesData,
      activeSceneId: activeSceneIdData,
      setActiveSceneId: setActiveSceneIdFn,
      upsertScene: value?.upsertScene ?? upsertScene,
      removeScene: value?.removeScene ?? removeScene,
      queueScene,
    }
  }, [
    ackTimeoutMs,
    activeSceneIdData,
    fixturesData,
    queue,
    scenesData,
    setActiveSceneIdFn,
    setFixturesFn,
    setScenesFn,
    universesData,
    value,
    timer,
  ])

  return (
    <ScenesStoreContext.Provider value={mergedValue}>
      {children}
    </ScenesStoreContext.Provider>
  )
}

export function useScenesStore() {
  return useContext(ScenesStoreContext)
}
