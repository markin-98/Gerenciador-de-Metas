import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Goal } from '../types/database'
import {
  generateChallengeSequence,
  generateTargetSequence,
  isTargetViable,
} from '../lib/deposits'

export function useGoals(spaceId: string | undefined) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!spaceId) {
      setGoals([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('space_id', spaceId)
      .order('created_at', { ascending: false })
    if (!error && data) setGoals(data)
    setLoading(false)
  }, [spaceId])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    if (!spaceId) return
    const channel = supabase
      .channel(`goals:${spaceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'goals', filter: `space_id=eq.${spaceId}` },
        () => reload()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [spaceId, reload])

  async function createChallengeGoal(
    name: string,
    startReais: number,
    endReais: number,
    userId: string
  ) {
    if (!spaceId) throw new Error('Espaço inválido.')
    const sequence = generateChallengeSequence(startReais, endReais)
    const totalAmountCents = sequence.reduce((sum, v) => sum + v, 0)

    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .insert({
        space_id: spaceId,
        name,
        type: 'challenge',
        total_amount_cents: totalAmountCents,
        deposits_count: sequence.length,
        created_by: userId,
      })
      .select()
      .single()
    if (goalError) throw goalError

    await insertDeposits(goal.id, sequence)
    await reload()
    return goal
  }

  async function createTargetGoal(
    name: string,
    totalAmountCents: number,
    depositsCount: number,
    userId: string
  ) {
    if (!spaceId) throw new Error('Espaço inválido.')
    if (!isTargetViable(totalAmountCents, depositsCount)) {
      throw new Error(
        'Combinação inviável: aumente o valor total ou reduza a quantidade de depósitos.'
      )
    }
    const sequence = generateTargetSequence(totalAmountCents, depositsCount)

    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .insert({
        space_id: spaceId,
        name,
        type: 'target',
        total_amount_cents: totalAmountCents,
        deposits_count: sequence.length,
        created_by: userId,
      })
      .select()
      .single()
    if (goalError) throw goalError

    await insertDeposits(goal.id, sequence)
    await reload()
    return goal
  }

  async function insertDeposits(goalId: string, sequence: number[]) {
    const rows = sequence.map((amount_cents, index) => ({
      goal_id: goalId,
      sequence: index + 1,
      amount_cents,
    }))
    const { error } = await supabase.from('deposits').insert(rows)
    if (error) throw error
  }

  return { goals, loading, reload, createChallengeGoal, createTargetGoal }
}
