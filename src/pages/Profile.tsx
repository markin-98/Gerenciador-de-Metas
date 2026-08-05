import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  PencilSimple,
  Check,
  X,
  Fire,
  Trophy,
  Target,
  Wallet,
  CalendarBlank,
  SignOut,
} from '@phosphor-icons/react'
import { AppShell } from '../components/AppShell'
import { EditableAvatar } from '../components/EditableAvatar'
import { useAuth } from '../contexts/AuthContext'
import { useMySpace } from '../hooks/useMySpace'
import { useGoals } from '../hooks/useGoals'
import { useGoalsProgress } from '../hooks/useGoalsProgress'
import { useStreak } from '../hooks/useStreak'
import { useAchievements } from '../hooks/useAchievements'
import { useSharedGoals } from '../hooks/useSharedGoals'
import { useAvatarUpload } from '../hooks/useAvatarUpload'
import { useToast } from '../contexts/ToastContext'
import { translateSupabaseError } from '../lib/errors'
import { formatCentsToBRL } from '../lib/deposits'

export function Profile() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const { spaceId } = useMySpace()
  const { goals } = useGoals(spaceId)
  const { progressByGoal } = useGoalsProgress(goals)
  const { streakDays } = useStreak(spaceId)
  const { achievements } = useAchievements(spaceId)
  const { sharedByMe, sharedWithMe, loading } = useSharedGoals()
  const { uploadAvatar, uploading } = useAvatarUpload()

  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [savingName, setSavingName] = useState(false)

  const activeGoals = goals.filter((g) => g.status === 'active')
  const completedGoals = goals.filter((g) => g.status === 'completed')
  const totalSavedCents = goals.reduce(
    (sum, g) => sum + (progressByGoal[g.id]?.savedCents ?? 0),
    0
  )
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      })
    : null

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  async function handleAvatarSelect(file: File) {
    try {
      await uploadAvatar(file)
      showToast('Foto de perfil atualizada!', 'success')
    } catch (err) {
      showToast(translateSupabaseError(err), 'error')
    }
  }

  function startEditingName() {
    setNameDraft(profile?.name ?? '')
    setEditingName(true)
  }

  async function handleSaveName() {
    if (!nameDraft.trim()) return
    setSavingName(true)
    try {
      await updateProfile({ name: nameDraft.trim() })
      setEditingName(false)
      showToast('Nome atualizado!', 'success')
    } catch (err) {
      showToast(translateSupabaseError(err), 'error')
    } finally {
      setSavingName(false)
    }
  }

  const stats = [
    { icon: Target, label: 'Metas ativas', value: String(activeGoals.length) },
    { icon: Trophy, label: 'Concluídas', value: String(completedGoals.length) },
    { icon: Wallet, label: 'Total guardado', value: formatCentsToBRL(totalSavedCents) },
    {
      icon: Fire,
      label: 'Sequência',
      value: `${streakDays} ${streakDays === 1 ? 'dia' : 'dias'}`,
    },
  ]

  return (
    <AppShell>
      <h1 className="text-headline-sm-mobile text-on-surface">Perfil</h1>

      <div className="card-gradient-primary animate-fade-in-up mt-6 flex items-center gap-4 rounded-lg p-6 text-on-primary shadow-lg">
        <EditableAvatar
          name={profile?.name}
          avatarUrl={profile?.avatar_url}
          size="xl"
          uploading={uploading}
          onSelectFile={handleAvatarSelect}
        />
        <div className="min-w-0 flex-1">
          {editingName ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName()
                  if (e.key === 'Escape') setEditingName(false)
                }}
                className="min-w-0 flex-1 rounded-md border border-white/30 bg-white/10 px-2 py-1 text-body-lg font-semibold text-on-primary placeholder:text-primary-fixed focus:border-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveName}
                disabled={savingName}
                aria-label="Salvar nome"
                className="shrink-0 rounded-full bg-white/15 p-1.5 disabled:opacity-60"
              >
                <Check size={16} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => setEditingName(false)}
                aria-label="Cancelar"
                className="shrink-0 rounded-full bg-white/15 p-1.5"
              >
                <X size={16} weight="bold" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={startEditingName}
              className="group flex items-center gap-1.5 text-left"
            >
              <p className="truncate text-body-lg font-semibold text-on-primary">
                {profile?.name}
              </p>
              <PencilSimple
                size={14}
                className="shrink-0 opacity-0 transition-opacity group-hover:opacity-70"
              />
            </button>
          )}
          <p className="truncate text-label-md text-primary-fixed">{user?.email}</p>
          {memberSince && (
            <p className="mt-1 flex items-center gap-1 text-label-sm text-primary-fixed">
              <CalendarBlank size={13} />
              Desde {memberSince}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            style={{ animationDelay: `${index * 60}ms` }}
            className="animate-fade-in-up card-elevated flex items-center gap-3 p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed-variant">
              <stat.icon size={20} weight="fill" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-body-md font-semibold text-on-surface">{stat.value}</p>
              <p className="text-label-sm text-on-surface-variant">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {achievements.length > 0 && (
        <Link
          to="/achievements"
          className="animate-fade-in-up card-elevated card-elevated-hover mt-4 flex items-center justify-between p-4"
        >
          <span className="flex items-center gap-2 text-body-md text-on-surface">
            <Trophy size={18} weight="fill" className="text-primary" />
            {achievements.length} {achievements.length === 1 ? 'conquista' : 'conquistas'}{' '}
            desbloqueadas
          </span>
          <span className="text-label-sm text-primary">Ver todas →</span>
        </Link>
      )}

      <section className="mt-8">
        <h2 className="text-body-lg font-semibold text-on-surface">Metas que você compartilhou</h2>
        {loading && <p className="mt-3 text-body-md text-on-surface-variant">Carregando…</p>}
        {!loading && sharedByMe.length === 0 && (
          <p className="mt-3 text-body-md text-on-surface-variant">
            Você ainda não compartilhou nenhuma meta.
          </p>
        )}
        <div className="mt-4 flex flex-col gap-3">
          {sharedByMe.map(({ goal, members }) => (
            <Link
              key={goal.id}
              to={`/goals/${goal.id}`}
              className="card-elevated card-elevated-hover animate-fade-in-up block p-4"
            >
              <p className="text-body-md font-semibold text-on-surface">{goal.name}</p>
              <p className="mt-1 text-label-sm text-on-surface-variant">
                Compartilhada com {members.map((m) => m.name).join(', ')}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-body-lg font-semibold text-on-surface">
          Metas compartilhadas com você
        </h2>
        {loading && <p className="mt-3 text-body-md text-on-surface-variant">Carregando…</p>}
        {!loading && sharedWithMe.length === 0 && (
          <p className="mt-3 text-body-md text-on-surface-variant">
            Ninguém compartilhou uma meta com você ainda.
          </p>
        )}
        <div className="mt-4 flex flex-col gap-3">
          {sharedWithMe.map(({ goal, owner }) => (
            <Link
              key={goal.id}
              to={`/goals/${goal.id}`}
              className="card-elevated card-elevated-hover animate-fade-in-up block p-4"
            >
              <p className="text-body-md font-semibold text-on-surface">{goal.name}</p>
              <p className="mt-1 text-label-sm text-on-surface-variant">
                De {owner?.name ?? 'alguém'}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-10">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-error px-4 py-3 text-label-md text-error transition-transform active:scale-95"
        >
          <SignOut size={18} weight="bold" />
          Sair da conta
        </button>
      </div>
    </AppShell>
  )
}
