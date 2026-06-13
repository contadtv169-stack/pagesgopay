// GoPay Service Worker - Push Notifications
const CACHE_NAME = 'gopay-v1'

self.addEventListener('install', (e) => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim())
})

// Handle push events from server (Web Push Protocol)
self.addEventListener('push', (e) => {
  if (!e.data) return
  let payload = { title: 'GoPay', body: 'Nova notificação', icon: '/pagesgopay/icon.svg' }
  try { payload = { ...payload, ...e.data.json() } } catch {}
  e.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/pagesgopay/icon.svg',
      badge: '/pagesgopay/icon.svg',
      vibrate: [200, 100, 200],
      tag: 'gopay-payment',
      renotify: true,
      data: payload,
    })
  )
})

// Click on notification opens the app
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('gopay') && 'focus' in client) {
          return client.focus()
        }
      }
      return clients.openWindow('/pagesgopay/')
    })
  )
})
