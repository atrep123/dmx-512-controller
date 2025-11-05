const CACHE_NAME = 'dmx-512-static-v3'
const PRECACHE_URLS = ['/manifest.json']
const API_DENYLIST = [/^\/(ws|rgb|healthz|readyz|metrics|version|debug)/]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch((error) => console.error('Precache failed', error))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
      )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  const url = new URL(request.url)

  if (url.origin === self.location.origin && API_DENYLIST.some((pattern) => pattern.test(url.pathname))) {
    return
  }

  if (url.origin === self.location.origin && url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheHashedAsset(request))
    return
  }

  if (
    url.origin === self.location.origin &&
    (url.pathname === '/' || url.pathname.endsWith('/index.html'))
  ) {
    return
  }

  event.respondWith(networkWithCacheFallback(request))
})

async function cacheHashedAsset(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)

  if (cached) {
    fetch(request)
      .then((response) => {
        if (response.ok) {
          cache.put(request, response.clone())
        }
      })
      .catch(() => undefined)
    return cached
  }

  const response = await fetch(request)
  if (response.ok) {
    cache.put(request, response.clone())
  }
  return response
}

async function networkWithCacheFallback(request) {
  try {
    return await fetch(request)
  } catch {
    const cache = await caches.open(CACHE_NAME)
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
    return Response.error()
  }
}
