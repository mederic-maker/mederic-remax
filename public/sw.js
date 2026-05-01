const CACHE = 'mederic-v1'
const PRECACHE = ['/', '/listings', '/manifest.json']

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  if (e.request.url.includes('/api/')) return // ne pas cacher les API

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone()
        caches.open(CACHE).then((cache) => cache.put(e.request, clone))
        return res
      })
      .catch(() => caches.match(e.request))
  )
})

// Push notifications
self.addEventListener('push', (e) => {
  const data = e.data?.json() ?? {}
  e.waitUntil(
    self.registration.showNotification(data.title ?? 'Médéric Souccar', {
      body: data.body ?? '',
      icon: data.icon ?? '/icons/icon-192.png',
      badge: data.badge ?? '/icons/badge-72.png',
      data: { url: data.url ?? '/crm/leads' },
      requireInteraction: true,
    })
  )
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = e.notification.data?.url ?? '/crm/leads'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      const existing = windowClients.find((c) => c.url.includes(url))
      if (existing) return existing.focus()
      return clients.openWindow(url)
    })
  )
})
