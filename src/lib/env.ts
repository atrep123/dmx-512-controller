const FALLBACK_HTTP_URL = 'http://localhost:3001'
const FALLBACK_WS_URL = 'ws://localhost:3001/ws'

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

function resolveWindowOrigin(): string {
  if (typeof window === 'undefined' || !window.location?.origin) {
    return ''
  }
  return window.location.origin
}

function normalizeHttpUrl(value?: string | null): string {
  if (!value) {
    return ''
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimTrailingSlash(trimmed)
  }
  try {
    const url = new URL(trimmed, FALLBACK_HTTP_URL)
    return trimTrailingSlash(url.toString())
  } catch {
    return ''
  }
}

const envHttpBase = normalizeHttpUrl(import.meta.env?.VITE_BACKEND_URL)
const runtimeOrigin = normalizeHttpUrl(resolveWindowOrigin())

export const BACKEND_BASE_URL = envHttpBase || runtimeOrigin || FALLBACK_HTTP_URL

function buildWsFromHttpBase(httpBase: string, path: string): string {
  try {
    const base = new URL(httpBase || FALLBACK_HTTP_URL)
    const protocol = base.protocol === 'https:' ? 'wss:' : 'ws:'
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${protocol}//${base.host}${cleanPath}`
  } catch {
    return FALLBACK_WS_URL
  }
}

function normalizeWsUrl(value?: string | null): string {
  if (!value) {
    return ''
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }
  if (/^wss?:\/\//i.test(trimmed)) {
    return trimmed
  }
  return buildWsFromHttpBase(BACKEND_BASE_URL, trimmed)
}

const envWsBase = normalizeWsUrl(import.meta.env?.VITE_WS_URL)

export const BACKEND_WS_URL = envWsBase || buildWsFromHttpBase(BACKEND_BASE_URL, '/ws')

function isAbsoluteHttp(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

export function buildBackendUrl(path: string): string {
  if (!path) {
    return BACKEND_BASE_URL
  }
  if (isAbsoluteHttp(path)) {
    return path
  }
  if (path === '/') {
    return BACKEND_BASE_URL
  }
  const prefix = path.startsWith('/') ? '' : '/'
  return `${BACKEND_BASE_URL}${prefix}${path}`
}

export function buildWebSocketUrl(path?: string): string {
  if (!path) {
    return BACKEND_WS_URL
  }
  if (/^wss?:\/\//i.test(path)) {
    return path
  }
  try {
    const base = new URL(BACKEND_WS_URL)
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${base.protocol}//${base.host}${cleanPath}`
  } catch {
    return BACKEND_WS_URL
  }
}
