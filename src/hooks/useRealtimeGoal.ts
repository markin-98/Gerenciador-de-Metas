import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Deposit, Goal } from '../types/database'

interface UseRealtimeGoalResult {
  goal: Goal | null
  deposits: Deposit[]
  loading: boolean
  markDeposit: (depositId: string, userId: string) => Promise<{ ok: boolean; message?: string }>
  unmarkDeposit: (depositId: string) => Promise<{ ok: boolean; message?: string }>
  deleteGoal: () => Promise<void>
  reload: () => Promise<void>
}

export function useRealtimeGoal(goalId: string | undefined): UseRealtimeGoalResult {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!goalId) return
    setLoading(true)
    const [{ data: goalData }, { data: depositsData }] = await Promise.all([
      supabase.from('goals').select('*').eq('id', goalId).single(),
      supabase
        .from('deposits')
        .select('*, profile:completed_by(id, name, avatar_url)')
        .eq('goal_id', goalId)
        .order('sequence', { ascending: true }),
    ])
    if (goalData) setGoal(goalData)
    if (depositsData) setDeposits(depositsData as unknown as Deposit[])
    setLoading(false)
  }, [goalId])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    if (!goalId) return

    const channel = supabase
      .channel(`goal-detail:${goalId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deposits', filter: `goal_id=eq.${goalId}` },
        () => reload()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'goals', filter: `id=eq.${goalId}` },
        () => reload()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [goalId, reload])

  async function markDeposit(depositId: string, userId: string) {
    const { data, error } = await supabase
      .from('deposits')
      .update({ status: 'completed', completed_by: userId, completed_at: new Date().toISOString() })
      .eq('id', depositId)
      .eq('status', 'pending')
      .select()

    if (error) return { ok: false, message: 'Erro ao marcar depósito.' }
    if (!data || data.length === 0) {
      await reload()
      return { ok: false, message: 'Este depósito já foi marcado por outra pessoa.' }
    }
    return { ok: true }
  }

  async function unmarkDeposit(depositId: string) {
    const { data, error } = await supabase
      .from('deposits')
      .update({ status: 'pending', completed_by: null, completed_at: null })
      .eq('id', depositId)
      .eq('status', 'completed')
      .select()

    if (error) return { ok: false, message: 'Erro ao desmarcar depósito.' }
    if (!data || data.length === 0) {
      await reload()
      return { ok: false, message: 'Não foi possível desmarcar este depósito.' }
    }
    return { ok: true }
  }

  async function deleteGoal() {
    if (!goalId) return
    const { error } = await supabase.from('goals').delete().eq('id', goalId)
    if (error) throw error
  }

  return { goal, deposits, loading, markDeposit, unmarkDeposit, deleteGoal, reload }
}

export function goalJustCompleted(previousStatus: string | undefined, goal: Goal | null) {
  return previousStatus === 'active' && goal?.status === 'completed'
}
