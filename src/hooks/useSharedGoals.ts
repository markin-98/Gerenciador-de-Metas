import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Goal, Profile } from '../types/database'

export interface SharedByMeGoal {
  goal: Goal
  members: Profile[]
}

export interface SharedWithMeGoal {
  goal: Goal
  owner: Profile | null
}

export function useSharedGoals() {
  const { user } = useAuth()
  const [sharedByMe, setSharedByMe] = useState<SharedByMeGoal[]>([])
  const [sharedWithMe, setSharedWithMe] = useState<SharedWithMeGoal[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!user) {
      setSharedByMe([])
      setSharedWithMe([])
      setLoading(false)
      return
    }
    setLoading(true)

    const [byMeResult, withMeResult] = await Promise.all([
      supabase
        .from('goal_members')
        .select('goal:goals!inner(*), profile:profiles(*)')
        .eq('goal.created_by', user.id),
      supabase
        .from('goal_members')
        .select('goal:goals(*, owner:created_by(*))')
        .eq('user_id', user.id),
    ])

    if (byMeResult.data) {
      const rows = byMeResult.data as unknown as { goal: Goal; profile: Profile }[]
      const byGoal = new Map<string, SharedByMeGoal>()
      for (const row of rows) {
        if (!byGoal.has(row.goal.id)) byGoal.set(row.goal.id, { goal: row.goal, members: [] })
        byGoal.get(row.goal.id)!.members.push(row.profile)
      }
      setSharedByMe(Array.from(byGoal.values()))
    }

    if (withMeResult.data) {
      const rows = withMeResult.data as unknown as {
        goal: Goal & { owner: Profile | null }
      }[]
      setSharedWithMe(
        rows
          .filter((row) => row.goal && row.goal.created_by !== user.id)
          .map((row) => ({ goal: row.goal, owner: row.goal.owner }))
      )
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    reload()
  }, [reload])

  return { sharedByMe, sharedWithMe, loading, reload }
}
