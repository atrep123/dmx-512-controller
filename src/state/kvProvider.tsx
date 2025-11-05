import { createContext, useContext } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { useKV } from '@github/spark/hooks'

export type UseKVHook = <T>(
  key: string,
  initialValue: T,
) => [T, Dispatch<SetStateAction<T>>]

const defaultUseKV: UseKVHook = (key, initialValue) => useKV(key, initialValue)

const KVContext = createContext<UseKVHook>(defaultUseKV)

export interface KVProviderProps {
  children: ReactNode
  useKVHook?: UseKVHook
}

export function KVProvider({ children, useKVHook }: KVProviderProps) {
  return (
    <KVContext.Provider value={useKVHook ?? defaultUseKV}>
      {children}
    </KVContext.Provider>
  )
}

export function useKVStore<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const hook = useContext(KVContext)
  return hook(key, initialValue)
}

export function createKVStore({ useKVHook }: { useKVHook: UseKVHook }) {
  return {
    Provider({ children }: { children: ReactNode }) {
      return (
        <KVContext.Provider value={useKVHook}>
          {children}
        </KVContext.Provider>
      )
    },
  }
}
