import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { GoalJoinRequest } from '../types/database'

export function useGoalJoinRequests(goalId: string | undefined) {
  const [requests, setRequests] = useState<GoalJoinRequest[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!goalId) {
      setRequests([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('goal_join_requests')
      .select('*, profile:user_id(id, name, avatar_url)')
      .eq('goal_id', goalId)
      .eq('status', 'pending')
      .order('requested_at', { ascending: true })
    setRequests((data ?? []) as unknown as GoalJoinRequest[])
    setLoading(false)
  }, [goalId])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    if (!goalId) return
    const channel = supabase
      .channel(`join-requests:${goalId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goal_join_requests',
          filter: `goal_id=eq.${goalId}`,
        },
        () => reload()
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [goalId, reload])

  async function approve(requestId: string, userId: string) {
    const { error } = await supabase
      .from('goal_join_requests')
      .update({ status: 'approved', resolved_by: userId })
      .eq('id', requestId)
    if (error) throw error
    await reload()
  }

  async function reject(requestId: string, userId: string) {
    const { error } = await supabase
      .from('goal_join_requests')
      .update({ status: 'rejected', resolved_by: userId })
      .eq('id', requestId)
    if (error) throw error
    await reload()
  }

  return { requests, loading, approve, reject, reload }
}
