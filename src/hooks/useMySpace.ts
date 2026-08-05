import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Space } from '../types/database'

/**
 * Cada usuário tem uma única área pessoal (o espaço "Minha Conta", criado
 * automaticamente no cadastro). O app não expõe o conceito de "Espaços" na
 * interface — compartilhamento acontece por meta (goal_members), não por
 * espaço. Este hook resolve o espaço pessoal do usuário logado.
 */
export function useMySpace() {
  const { user } = useAuth()
  const [space, setSpace] = useState<Space | null>(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!user) {
      setSpace(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('space_members')
      .select('space:spaces(*)')
      .eq('user_id', user.id)
      .order('joined_at', { ascending: true })
      .limit(1)

    if (!error && data) {
      const rows = data as unknown as { space: Space }[]
      setSpace(rows[0]?.space ?? null)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    reload()
  }, [reload])

  return { space, spaceId: space?.id, loading, reload }
}
