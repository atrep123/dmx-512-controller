const STORAGE_KEY = '__spark_kv_mock_store__'
let mockInstalled = false

type KvRecord = Record<string, unknown>

const readStore = (): KvRecord => {
  if (typeof window === 'undefined') {
    return {}
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {}
    }
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed ? parsed : {}
  } catch {
    return {}
  }
}

const writeStore = (store: KvRecord) => {
  if (typeof window === 'undefined') {
    return
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // ignore persistence failures (e.g., private mode)
  }
}

const getKvPath = (pathname: string) => {
  if (!pathname.startsWith('/_spark/kv')) {
    return null
  }
  const [, , , ...rest] = pathname.split('/')
  return rest.length ? decodeURIComponent(rest.join('/')) : ''
}

const createJsonResponse = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    status: init?.status ?? 200,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

const createTextResponse = (data: string, init?: ResponseInit) =>
  new Response(data, {
    status: init?.status ?? 200,
    headers: {
      'Content-Type': 'text/plain',
      ...(init?.headers ?? {}),
    },
  })

const installMock = () => {
  if (mockInstalled || typeof window === 'undefined' || typeof window.fetch !== 'function') {
    return
  }
  const store = readStore()
  const originalFetch = window.fetch.bind(window)
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init)
    const url = new URL(request.url, window.location.origin)
    const kvPath = getKvPath(url.pathname)
    if (kvPath === null) {
      return originalFetch(input, init)
    }

    if (kvPath === '') {
      if (request.method.toUpperCase() === 'GET') {
        return createJsonResponse(Object.keys(store))
      }
      return createJsonResponse({ error: 'Method not allowed' }, { status: 405 })
    }

    switch (request.method.toUpperCase()) {
      case 'GET': {
        if (!(kvPath in store)) {
          return new Response('Not Found', { status: 404 })
        }
        return createTextResponse(JSON.stringify(store[kvPath]))
      }
      case 'POST': {
        const raw = await request.text()
        try {
          store[kvPath] = raw ? JSON.parse(raw) : null
        } catch {
          return createJsonResponse({ error: 'Invalid JSON body' }, { status: 400 })
        }
        writeStore(store)
        return createJsonResponse({ ok: true })
      }
      case 'DELETE': {
        delete store[kvPath]
        writeStore(store)
        return new Response(null, { status: 204 })
      }
      default:
        return createJsonResponse({ error: 'Method not allowed' }, { status: 405 })
    }
  }
  mockInstalled = true
  console.info('[spark-kv] Mock service enabled (localStorage fallback)')
}

const shouldEnableMock = () => {
  if (!import.meta.env.DEV) {
    return false
  }
  const flag = import.meta.env.VITE_ENABLE_SPARK_KV_MOCK
  if (flag === 'false') {
    return false
  }
  return true
}

if (shouldEnableMock()) {
  installMock()
}

export {}
