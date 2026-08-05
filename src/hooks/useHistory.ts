import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Deposit, Goal } from '../types/database'

export interface HistoryEvent {
  id: string
  type: 'deposit' | 'goal_created'
  date: string
  goalName: string
  goalId: string
  amountCents?: number
  actorName: string
  actorAvatarUrl?: string | null
}

export function useHistory(spaceId: string | undefined) {
  const { user } = useAuth()
  const [events, setEvents] = useState<HistoryEvent[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!spaceId || !user) {
      setEvents([])
      setLoading(false)
      return
    }
    setLoading(true)

    const [{ data: ownGoals }, { data: memberRows }] = await Promise.all([
      supabase
        .from('goals')
        .select('*, profile:created_by(id, name, avatar_url)')
        .eq('space_id', spaceId),
      supabase.from('goal_members').select('goal_id').eq('user_id', user.id),
    ])

    type GoalWithProfile = Goal & { profile?: { name: string; avatar_url: string | null } }

    let goalList = (ownGoals ?? []) as unknown as GoalWithProfile[]
    const ownGoalIds = new Set(goalList.map((g) => g.id))
    const sharedGoalIds = (memberRows ?? [])
      .map((r) => r.goal_id)
      .filter((id) => !ownGoalIds.has(id))

    if (sharedGoalIds.length > 0) {
      const { data: sharedGoals } = await supabase
        .from('goals')
        .select('*, profile:created_by(id, name, avatar_url)')
        .in('id', sharedGoalIds)
      goalList = [...goalList, ...((sharedGoals ?? []) as unknown as GoalWithProfile[])]
    }

    const goalIds = goalList.map((g) => g.id)

    let deposits: (Deposit & { profile?: { name: string; avatar_url: string | null } })[] = []
    if (goalIds.length > 0) {
      const { data } = await supabase
        .from('deposits')
        .select('*, profile:completed_by(id, name, avatar_url)')
        .in('goal_id', goalIds)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
      deposits = (data ?? []) as unknown as (Deposit & {
        profile?: { name: string; avatar_url: string | null }
      })[]
    }

    const goalById = new Map(goalList.map((g) => [g.id, g]))

    const depositEvents: HistoryEvent[] = deposits
      .filter((d) => d.completed_at)
      .map((d) => ({
        id: `deposit-${d.id}`,
        type: 'deposit',
        date: d.completed_at as string,
        goalName: goalById.get(d.goal_id)?.name ?? '',
        goalId: d.goal_id,
        amountCents: d.amount_cents,
        actorName: d.profile?.name ?? 'Alguém',
        actorAvatarUrl: d.profile?.avatar_url,
      }))

    const goalCreatedEvents: HistoryEvent[] = goalList.map((g) => ({
      id: `goal-${g.id}`,
      type: 'goal_created',
      date: g.created_at,
      goalName: g.name,
      goalId: g.id,
      actorName: g.profile?.name ?? 'Alguém',
      actorAvatarUrl: g.profile?.avatar_url,
    }))

    const all = [...depositEvents, ...goalCreatedEvents].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    setEvents(all)
    setLoading(false)
  }, [spaceId, user])

  useEffect(() => {
    reload()
  }, [reload])

  return { events, loading, reload }
}
