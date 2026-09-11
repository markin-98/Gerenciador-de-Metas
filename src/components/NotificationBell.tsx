import { Link } from 'react-router-dom'
import { Bell } from '@phosphor-icons/react'
import { useNotifications } from '../hooks/useNotifications'

export function NotificationBell() {
  const { unreadCount } = useNotifications()

  return (
    <Link
      to="/notifications"
      aria-label={unreadCount > 0 ? `Notificações, ${unreadCount} não lidas` : 'Notificações'}
      className="relative flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-95"
    >
      <Bell size={24} weight={unreadCount > 0 ? 'fill' : 'regular'} className="text-on-surface" />
      {unreadCount > 0 && (
        <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold leading-none text-on-error">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
