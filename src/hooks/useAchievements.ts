import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Achievement, Goal } from '../types/database'

export interface SharedAchievement {
  achievement: Achievement
  goal: Goal
}

export function useAchievements(spaceId: string | undefined) {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [sharedAchievements, setSharedAchievements] = useState<SharedAchievement[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!user) {
      setAchievements([])
      setGoals([])
      setSharedAchievements([])
      setLoading(false)
      return
    }
    setLoading(true)

    // Todas as conquistas do usuário, em qualquer espaço/meta (inclusive metas
    // de outras pessoas que ele ajudou a completar via convite).
    const [{ data: achievementsData }, { data: goalsData }] = await Promise.all([
      supabase.from('achievements').select('*, goal:goals(*)').eq('user_id', user.id),
      spaceId
        ? supabase.from('goals').select('*').eq('space_id', spaceId)
        : Promise.resolve({ data: [] as Goal[] }),
    ])

    const allAchievements = (achievementsData ?? []) as unknown as (Achievement & {
      goal: Goal
    })[]
    const ownGoals = goalsData ?? []
    const ownGoalIds = new Set(ownGoals.map((g) => g.id))

    setAchievements(allAchievements)
    setGoals(ownGoals)
    setSharedAchievements(
      allAchievements
        .filter((a) => a.goal && !ownGoalIds.has(a.goal_id))
        .map((a) => ({ achievement: a, goal: a.goal }))
    )
    setLoading(false)
  }, [spaceId, user])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel(`achievements:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'achievements', filter: `user_id=eq.${user.id}` },
        () => reload()
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, reload])

  return { achievements, goals, sharedAchievements, loading, reload }
}
