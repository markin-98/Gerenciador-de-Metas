/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

declare const self: ServiceWorkerGlobalScope

// Só o "app shell" (JS/CSS/HTML/ícones) fica em cache. Chamadas à API do
// Supabase são para outro domínio e nunca passam pelo service worker —
// sempre direto na rede, dados nunca ficam desatualizados.
precacheAndRoute(self.__WB_MANIFEST)

// Sem isso, um SW novo fica "esperando" até todas as abas/instâncias da
// versão antiga fecharem — o que praticamente nunca acontece num PWA
// instalado (tela de início, sempre "aberto"). skipWaiting + clientsClaim
// faz o SW novo assumir imediatamente, então updates chegam no próximo
// carregamento em vez de ficarem presos servindo a versão antiga do cache.
self.skipWaiting()
clientsClaim()

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
