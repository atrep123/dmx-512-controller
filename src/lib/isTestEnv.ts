export function isTestEnv(): boolean {
  if (typeof import.meta !== 'object') {
    return false
  }
  const meta = import.meta as unknown as {
    vitest?: unknown
    env?: { MODE?: string; VITEST?: string | boolean }
  }
  if (meta?.vitest) {
    return true
  }
  const mode = meta?.env?.MODE?.toLowerCase()
  const flag = meta?.env?.VITEST
  return mode === 'test' || flag === true || flag === 'true'
}
