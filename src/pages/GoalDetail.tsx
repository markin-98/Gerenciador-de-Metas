import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Target,
  PiggyBank,
  Trophy,
  UserPlus,
  TrashSimple,
  Check,
  X,
  BellRinging,
} from '@phosphor-icons/react'
import { AppShell } from '../components/AppShell'
import { DepositGrid } from '../components/DepositGrid'
import { ProgressBar } from '../components/ProgressBar'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ShareLinkDialog } from '../components/ShareLinkDialog'
import { Avatar } from '../components/Avatar'
import { Confetti } from '../components/Confetti'
import { useRealtimeGoal } from '../hooks/useRealtimeGoal'
import { useGoalInvite } from '../hooks/useGoalInvite'
import { useGoalJoinRequests } from '../hooks/useGoalJoinRequests'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { calculateProgress, formatCentsToBRL } from '../lib/deposits'
import { translateSupabaseError } from '../lib/errors'
import type { Deposit } from '../types/database'

export function GoalDetail() {
  const { goalId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const { goal, deposits, markDeposit, unmarkDeposit, deleteGoal } = useRealtimeGoal(goalId)
  const { createInviteLink } = useGoalInvite(goalId, goal?.space_id)
  const isOwner = Boolean(user && goal && user.id === goal.created_by)
  const { requests, approve, reject } = useGoalJoinRequests(isOwner ? goalId : undefined)
  const [depositToUnmark, setDepositToUnmark] = useState<Deposit | null>(null)
  const [inviting, setInviting] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const previousStatus = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (previousStatus.current === 'active' && goal?.status === 'completed') {
      showToast(`Meta "${goal.name}" atingiu 100%! Parabéns!`, 'success')
      setCelebrate(true)
      setTimeout(() => setCelebrate(false), 1200)
    }
    previousStatus.current = goal?.status
  }, [goal?.status, goal?.name, showToast])

  if (!goal) {
    return (
      <AppShell>
        <p className="text-body-md text-on-surface-variant">Carregando…</p>
      </AppShell>
    )
  }

  const { savedCents, remainingCents, percent } = calculateProgress(
    deposits,
    goal.total_amount_cents
  )
  const isCompleted = goal.status === 'completed'
  const TypeIcon = goal.type === 'challenge' ? Target : PiggyBank

  async function handleDepositClick(deposit: Deposit) {
    if (!user) return
    if (deposit.status === 'pending') {
      const result = await markDeposit(deposit.id, user.id)
      if (!result.ok) showToast(result.message ?? 'Erro ao marcar depósito.', 'error')
    } else {
      setDepositToUnmark(deposit)
    }
  }

  async function confirmUnmark() {
    if (!depositToUnmark) return
    const result = await unmarkDeposit(depositToUnmark.id)
    if (!result.ok) showToast(result.message ?? 'Erro ao desmarcar depósito.', 'error')
    setDepositToUnmark(null)
  }

  async function handleInvite() {
    if (!user) return
    setInviting(true)
    try {
      const link = await createInviteLink(user.id)
      setInviteLink(link)
    } catch (err) {
      showToast(translateSupabaseError(err), 'error')
    } finally {
      setInviting(false)
    }
  }

  async function handleApprove(requestId: string, requesterName: string) {
    if (!user) return
    setResolvingId(requestId)
    try {
      await approve(requestId, user.id)
      showToast(`${requesterName} agora participa da meta!`, 'success')
    } catch (err) {
      showToast(translateSupabaseError(err), 'error')
    } finally {
      setResolvingId(null)
    }
  }

  async function handleReject(requestId: string) {
    if (!user) return
    setResolvingId(requestId)
    try {
      await reject(requestId, user.id)
    } catch (err) {
      showToast(translateSupabaseError(err), 'error')
    } finally {
      setResolvingId(null)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteGoal()
      showToast('Meta excluída.', 'success')
      navigate('/')
    } catch (err) {
      showToast(translateSupabaseError(err), 'error')
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  const contributors = Array.from(
    new Map(
      deposits
        .filter((d) => d.status === 'completed' && d.profile)
        .map((d) => [d.profile!.id, d.profile!])
    ).values()
  )

  return (
    <AppShell>
      <div className="animate-fade-in-up card-elevated relative overflow-hidden p-6">
        <Confetti fire={celebrate} />

        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <TypeIcon size={26} weight="duotone" className="shrink-0 text-primary" />
            <h1 className="truncate text-headline-sm-mobile text-on-surface">{goal.name}</h1>
          </div>
          <span
            className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-label-sm ${
              isCompleted
                ? 'bg-primary-fixed text-on-primary-fixed-variant'
                : 'bg-secondary-container text-on-secondary-container'
            }`}
          >
            {isCompleted && <Trophy size={14} weight="fill" />}
            {isCompleted ? 'Concluída' : goal.type === 'challenge' ? 'Desafio' : 'Meta'}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleInvite}
            disabled={inviting}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary px-4 py-1.5 text-label-md text-primary transition-transform active:scale-95 disabled:opacity-60"
          >
            <UserPlus size={16} weight="bold" />
            {inviting ? 'Gerando link…' : 'Convidar para esta meta'}
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            aria-label="Excluir meta"
            className="inline-flex items-center justify-center rounded-full border border-error/40 p-2 text-error transition-transform active:scale-95"
          >
            <TrashSimple size={16} weight="bold" />
          </button>
        </div>

        {contributors.length > 0 && (
          <div className="mt-3 flex -space-x-2">
            {contributors.map((profile) => (
              <div key={profile.id} title={profile.name}>
                <Avatar name={profile.name} avatarUrl={profile.avatar_url} size="sm" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-baseline justify-between text-body-md">
          <span className="font-semibold text-on-surface">{formatCentsToBRL(savedCents)}</span>
          <span className="text-on-surface-variant">
            de {formatCentsToBRL(goal.total_amount_cents)}
          </span>
        </div>

        <ProgressBar percent={percent} className="mt-2" />

        <div className="mt-2 flex justify-between text-label-sm text-on-surface-variant">
          <span>{percent}% concluído</span>
          <span>{isCompleted ? 'Meta batida!' : `Restam ${formatCentsToBRL(remainingCents)}`}</span>
        </div>
      </div>

      {isOwner && requests.length > 0 && (
        <div
          style={{ animationDelay: '60ms' }}
          className="animate-fade-in-up card-elevated mt-6 border border-primary/30 p-6"
        >
          <div className="flex items-center gap-2">
            <BellRinging size={18} weight="fill" className="text-primary" />
            <h2 className="text-body-lg font-semibold text-on-surface">
              {requests.length} {requests.length === 1 ? 'pedido pendente' : 'pedidos pendentes'}
            </h2>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center gap-3">
                <Avatar
                  name={request.profile?.name}
                  avatarUrl={request.profile?.avatar_url}
                  size="sm"
                />
                <p className="min-w-0 flex-1 truncate text-body-md text-on-surface">
                  {request.profile?.name ?? 'Alguém'}
                </p>
                <button
                  type="button"
                  onClick={() => handleReject(request.id)}
                  disabled={resolvingId === request.id}
                  aria-label="Recusar"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-error/40 text-error transition-transform active:scale-95 disabled:opacity-60"
                >
                  <X size={16} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(request.id, request.profile?.name ?? 'Pessoa')}
                  disabled={resolvingId === request.id}
                  aria-label="Aprovar"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary transition-transform active:scale-95 disabled:opacity-60"
                >
                  <Check size={16} weight="bold" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{ animationDelay: '80ms' }}
        className="animate-fade-in-up card-elevated mt-6 p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-body-lg font-semibold text-on-surface">Seus Depósitos</h2>
          <span className="text-label-sm text-on-surface-variant">
            {deposits.filter((d) => d.status === 'completed').length}/{goal.deposits_count}
          </span>
        </div>
        <div className="mt-5">
          <DepositGrid deposits={deposits} onDepositClick={handleDepositClick} />
        </div>
      </div>

      <ConfirmDialog
        open={depositToUnmark !== null}
        title="Desmarcar depósito?"
        description={
          depositToUnmark
            ? `Isso vai remover o depósito de ${formatCentsToBRL(depositToUnmark.amount_cents)} (posição ${depositToUnmark.sequence}) do seu progresso.`
            : ''
        }
        confirmLabel="Desmarcar"
        onConfirm={confirmUnmark}
        onCancel={() => setDepositToUnmark(null)}
      />

      <ConfirmDialog
        open={confirmingDelete}
        title="Excluir esta meta?"
        description={`Isso vai apagar "${goal.name}" e todos os seus depósitos e conquistas relacionadas, para todo mundo que participa dela. Essa ação não pode ser desfeita.`}
        confirmLabel={deleting ? 'Excluindo…' : 'Excluir'}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />

      <ShareLinkDialog
        open={inviteLink !== null}
        title="Convidar para esta meta"
        description={`Esse é o link fixo desta meta — sempre o mesmo. Quem abrir vira um pedido de entrada; você decide quem aprova para participar de "${goal.name}".`}
        link={inviteLink ?? ''}
        onClose={() => setInviteLink(null)}
      />
    </AppShell>
  )
}
