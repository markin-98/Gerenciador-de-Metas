import { supabase } from '../lib/supabase'

export function useGoalInvite(goalId: string | undefined, spaceId: string | undefined) {
  async function createInviteLink(userId: string) {
    if (!goalId || !spaceId) throw new Error('Meta inválida.')

    // Cada meta tem exatamente um convite, permanente — sempre reaproveita o
    // mesmo link em vez de gerar um novo a cada clique.
    const { data: existing } = await supabase
      .from('invites')
      .select('token')
      .eq('goal_id', goalId)
      .maybeSingle()

    if (existing) {
      return `${window.location.origin}/join/${existing.token}`
    }

    const { data, error } = await supabase
      .from('invites')
      .insert({ space_id: spaceId, goal_id: goalId, created_by: userId })
      .select()
      .single()
    if (error) throw error
    return `${window.location.origin}/join/${data.token}`
  }

  return { createInviteLink }
}
