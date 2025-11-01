if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('Service Worker registered:', registration.scope)
      },
      (error) => {
        console.log('Service Worker registration failed:', error)
      }
    )
  })
}

let deferredPrompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  console.log('PWA install prompt available')
})

window.addEventListener('appinstalled', () => {
  console.log('PWA installed successfully')
  deferredPrompt = null
})

if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('Running as PWA')
}
