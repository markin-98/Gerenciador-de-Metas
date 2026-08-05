import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { HourglassMedium, XCircle } from '@phosphor-icons/react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

type Status = 'loading' | 'pending' | 'rejected' | 'error'

export function Join() {
  const { token } = useParams()
  const { user, session, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')
  const [goalName, setGoalName] = useState('')

  useEffect(() => {
    if (authLoading) return

    if (!session) {
      navigate(`/login?redirect=/join/${token}`, { replace: true })
      return
    }

    async function join() {
      if (!token || !user) return
      const { data: invites, error: inviteError } = await supabase.rpc('get_invite_by_token', {
        p_token: token,
      })
      const invite = invites?.[0]

      if (inviteError || !invite) {
        setError('Convite inválido ou expirado.')
        setStatus('error')
        return
      }

      if (invite.goal_id) {
        setGoalName(invite.goal_name ?? 'esta meta')

        const { data: myStatus } = await supabase.rpc('get_my_goal_status', {
          p_goal_id: invite.goal_id,
        })

        if (myStatus === 'member') {
          navigate(`/goals/${invite.goal_id}`, { replace: true })
          return
        }

        if (myStatus === 'rejected') {
          setStatus('rejected')
          return
        }

        if (myStatus === 'none') {
          const { error: requestError } = await supabase
            .from('goal_join_requests')
            .upsert(
              { goal_id: invite.goal_id, user_id: user.id },
              { onConflict: 'goal_id,user_id', ignoreDuplicates: true }
            )
          if (requestError) {
            setError('Não foi possível enviar seu pedido de entrada.')
            setStatus('error')
            return
          }
        }

        setStatus('pending')
        return
      }

      const { error: joinError } = await supabase
        .from('space_members')
        .upsert(
          { space_id: invite.space_id, user_id: user.id },
          { onConflict: 'space_id,user_id', ignoreDuplicates: true }
        )

      if (joinError) {
        setError('Não foi possível entrar no espaço.')
        setStatus('error')
        return
      }

      navigate('/', { replace: true })
    }

    join()
  }, [authLoading, session, token, user, navigate])

  useEffect(() => {
    if (status !== 'pending' || !user) return

    const channel = supabase
      .channel(`join-request-wait:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'goal_join_requests',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as { status: string; goal_id: string }
          if (row.status === 'approved') {
            navigate(`/goals/${row.goal_id}`, { replace: true })
          } else if (row.status === 'rejected') {
            setStatus('rejected')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [status, user, navigate])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-6">
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

      <div className="animate-scale-in card-elevated w-full max-w-sm rounded-2xl p-8 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-primary-fixed border-t-primary" />
            <p className="text-body-md text-on-surface-variant">Entrando…</p>
          </div>
        )}
        {status === 'pending' && (
          <>
            <span className="animate-pulse-soft mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
              <HourglassMedium size={28} weight="fill" />
            </span>
            <h1 className="mt-5 text-headline-sm-mobile text-on-surface">Pedido enviado!</h1>
            <p className="mt-2 text-body-md text-on-surface-variant">
              Aguardando o dono de "{goalName}" aprovar sua entrada. Essa tela atualiza sozinha
              assim que isso acontecer.
            </p>
          </>
        )}
        {status === 'rejected' && (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error-container text-on-error-container">
              <XCircle size={28} weight="fill" />
            </span>
            <h1 className="mt-5 text-headline-sm-mobile text-on-surface">Pedido não aceito</h1>
            <p className="mt-2 text-body-md text-on-surface-variant">
              O dono de "{goalName}" não aprovou sua entrada dessa vez.
            </p>
          </>
        )}
        {status === 'error' && (
          <div className="rounded-xl bg-error-container/50 px-4 py-3 text-body-md text-on-error-container">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
