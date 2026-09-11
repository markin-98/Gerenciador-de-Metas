/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope

// Só o "app shell" (JS/CSS/HTML/ícones) fica em cache. Chamadas à API do
// Supabase são para outro domínio e nunca passam pelo service worker —
// sempre direto na rede, dados nunca ficam desatualizados.
precacheAndRoute(self.__WB_MANIFEST)

interface PushPayload {
  title: string
  body: string
  url: string
}

self.addEventListener('push', (event) => {
  if (!event.data) return
  const payload = event.data.json() as PushPayload

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/pwa-192.png',
      badge: '/pwa-192.png',
      data: { url: payload.url },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data as { url?: string })?.url ?? '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})
