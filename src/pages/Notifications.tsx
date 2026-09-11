import { Link } from 'react-router-dom'
import { UserPlus, CheckCircle, XCircle, ArrowUp, Trophy } from '@phosphor-icons/react'
import { AppShell } from '../components/AppShell'
import { HistorySkeleton } from '../components/Skeleton'
import { useNotifications } from '../hooks/useNotifications'
import type { Notification, NotificationType } from '../types/database'

const ICONS: Record<NotificationType, typeof UserPlus> = {
  join_requested: UserPlus,
  join_resolved: CheckCircle,
  deposit_marked: ArrowUp,
  goal_completed: Trophy,
}

function relativeTime(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `há ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `há ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `há ${diffD}d`
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function NotificationRow({ notification, onRead }: { notification: Notification; onRead: (id: string) => void }) {
  const Icon = notification.type === 'join_resolved' && notification.title === 'Pedido recusado' ? XCircle : ICONS[notification.type]
  const unread = !notification.read_at
  const content = (
    <div
      className={`card-elevated flex items-start gap-3 p-4 transition-colors ${unread ? 'bg-primary-container/30' : ''}`}
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
        <Icon size={18} weight="fill" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-body-md font-semibold text-on-surface">{notification.title}</p>
        <p className="mt-0.5 text-body-sm text-on-surface-variant">{notification.body}</p>
        <p className="mt-1 text-label-sm text-on-surface-variant">{relativeTime(notification.created_at)}</p>
      </div>
      {unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
    </div>
  )

  if (notification.goal_id) {
    return (
      <Link to={`/goals/${notification.goal_id}`} onClick={() => unread && onRead(notification.id)}>
        {content}
      </Link>
    )
  }
  return (
    <button type="button" className="w-full text-left" onClick={() => unread && onRead(notification.id)}>
      {content}
    </button>
  )
}

export function Notifications() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications()

  return (
    <AppShell>
      <div className="animate-fade-in-up flex items-center justify-between">
        <h1 className="text-headline-sm-mobile text-on-surface">Notificações</h1>
        {unreadCount > 0 && (
          <button type="button" onClick={markAllAsRead} className="text-label-md font-semibold text-primary">
            Marcar todas como lidas
          </button>
        )}
      </div>

      {loading && <HistorySkeleton />}

      {!loading && notifications.length === 0 && (
        <p className="animate-fade-in-up mt-6 text-body-md text-on-surface-variant">
          Nenhuma notificação por aqui ainda.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {notifications.map((notification, index) => (
          <div key={notification.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 40}ms` }}>
            <NotificationRow notification={notification} onRead={markAsRead} />
          </div>
        ))}
      </div>
    </AppShell>
  )
}
