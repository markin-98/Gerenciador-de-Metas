// Edge Function chamada pelo trigger `on_notification_created_send_push`
// (ver supabase/migrations/0012_notifications.sql) sempre que uma notificação
// é inserida. Busca as push subscriptions do destinatário e envia via Web
// Push (VAPID). Assinaturas que respondem 404/410 (endpoint morto) são
// removidas.
//
// A function é implantada com verify_jwt=false (o trigger chama via pg_net
// com o header Authorization padrão, não um JWT de usuário), então a única
// proteção contra chamadas forjadas por qualquer pessoa/usuário autenticado
// é o segredo compartilhado abaixo — só o trigger (via Vault) o conhece.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3'

interface NotificationPayload {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  goal_id: string | null
}

const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
const vapidSubject = Deno.env.get('VAPID_SUBJECT')
const triggerSecret = Deno.env.get('PUSH_TRIGGER_SECRET')

if (vapidPublicKey && vapidPrivateKey && vapidSubject) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject || !triggerSecret) {
    return new Response('VAPID não configurado', { status: 500 })
  }

  if (req.headers.get('x-trigger-secret') !== triggerSecret) {
    return new Response('unauthorized', { status: 401 })
  }

  const payload = (await req.json()) as NotificationPayload

  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', payload.user_id)

  if (!subscriptions || subscriptions.length === 0) {
    return new Response('sem subscriptions', { status: 200 })
  }

  const pushPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.goal_id ? `/goals/${payload.goal_id}` : '/notifications',
  })

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          pushPayload
        )
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
        }
      }
    })
  )

  return new Response('ok', { status: 200 })
})
