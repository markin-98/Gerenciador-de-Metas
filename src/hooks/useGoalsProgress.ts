import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Goal } from '../types/database'

export interface GoalProgress {
  savedCents: number
  percent: number
}

export function useGoalsProgress(goals: Goal[]) {
  const [progressByGoal, setProgressByGoal] = useState<Record<string, GoalProgress>>({})

  const reload = useCallback(async () => {
    if (goals.length === 0) {
      setProgressByGoal({})
      return
    }
    const goalIds = goals.map((g) => g.id)
    const { data } = await supabase
      .from('deposits')
      .select('goal_id, amount_cents')
      .in('goal_id', goalIds)
      .eq('status', 'completed')

    const savedByGoal = new Map<string, number>()
    for (const row of data ?? []) {
      savedByGoal.set(row.goal_id, (savedByGoal.get(row.goal_id) ?? 0) + row.amount_cents)
    }

    const result: Record<string, GoalProgress> = {}
    for (const goal of goals) {
      const savedCents = savedByGoal.get(goal.id) ?? 0
      const percent =
        goal.total_amount_cents > 0
          ? Math.round((savedCents / goal.total_amount_cents) * 100)
          : 0
      result[goal.id] = { savedCents, percent }
    }
    setProgressByGoal(result)
  }, [goals])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    const channel = supabase
      .channel('deposits-progress')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deposits' }, () => reload())
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [reload])

  return { progressByGoal, reload }
}
