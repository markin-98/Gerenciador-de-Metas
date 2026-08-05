import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function toDateKey(iso: string) {
  return iso.slice(0, 10)
}

/** Calcula a sequência atual de dias seguidos com pelo menos um depósito marcado. */
export function useStreak(spaceId: string | undefined) {
  const [streakDays, setStreakDays] = useState(0)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!spaceId) {
      setStreakDays(0)
      setLoading(false)
      return
    }
    setLoading(true)

    const { data: goals } = await supabase.from('goals').select('id').eq('space_id', spaceId)
    const goalIds = (goals ?? []).map((g) => g.id)

    if (goalIds.length === 0) {
      setStreakDays(0)
      setLoading(false)
      return
    }

    const { data: deposits } = await supabase
      .from('deposits')
      .select('completed_at')
      .in('goal_id', goalIds)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1000)

    const activeDays = new Set(
      (deposits ?? []).filter((d) => d.completed_at).map((d) => toDateKey(d.completed_at as string))
    )

    let streak = 0
    const cursor = new Date()
    const todayKey = toDateKey(cursor.toISOString())
    if (!activeDays.has(todayKey)) {
      cursor.setDate(cursor.getDate() - 1)
    }

    while (activeDays.has(toDateKey(cursor.toISOString()))) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    }

    setStreakDays(streak)
    setLoading(false)
  }, [spaceId])

  useEffect(() => {
    reload()
  }, [reload])

  return { streakDays, loading, reload }
}
