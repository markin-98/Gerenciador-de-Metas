import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Notification } from '../types/database'

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!user) {
      setNotifications([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*, actor:actor_id(id, name, avatar_url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)
    setNotifications((data ?? []) as unknown as Notification[])
    setLoading(false)
  }, [user])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => reload()
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, reload])

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    )
  }

  async function markAllAsRead() {
    if (!user) return
    const now = new Date().toISOString()
    await supabase
      .from('notifications')
      .update({ read_at: now })
      .eq('user_id', user.id)
      .is('read_at', null)
    setNotifications((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })))
  }

  const unreadCount = notifications.filter((n) => !n.read_at).length

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, reload }
}
