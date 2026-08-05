import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Fire, Sparkle } from '@phosphor-icons/react'
import { AppShell } from '../components/AppShell'
import { GoalCard } from '../components/GoalCard'
import { Logo } from '../components/Logo'
import { Avatar } from '../components/Avatar'
import { AnimatedCentsValue } from '../components/AnimatedNumber'
import { DashboardSkeleton } from '../components/Skeleton'
import { useAuth } from '../contexts/AuthContext'
import { useMySpace } from '../hooks/useMySpace'
import { useGoals } from '../hooks/useGoals'
import { useGoalsProgress } from '../hooks/useGoalsProgress'
import { useStreak } from '../hooks/useStreak'
import { useToast } from '../contexts/ToastContext'
import { getGreeting } from '../lib/greeting'

export function Dashboard() {
  const { profile } = useAuth()
  const { showToast } = useToast()
  const { spaceId, loading: spaceLoading } = useMySpace()
  const { goals, loading: goalsLoading } = useGoals(spaceId)
  const { progressByGoal } = useGoalsProgress(goals)
  const { streakDays } = useStreak(spaceId)
  const previousStatuses = useRef<Record<string, string>>({})

  const loading = spaceLoading || goalsLoading
  const activeGoals = goals.filter((g) => g.status === 'active')
  const completedGoals = goals.filter((g) => g.status === 'completed')
  const totalSavedCents = activeGoals.reduce(
    (sum, g) => sum + (progressByGoal[g.id]?.savedCents ?? 0),
    0
  )

  useEffect(() => {
    for (const goal of goals) {
      const prev = previousStatuses.current[goal.id]
      if (prev === 'active' && goal.status === 'completed') {
        showToast(`Meta "${goal.name}" atingiu 100%!`, 'success')
      }
      previousStatuses.current[goal.id] = goal.status
    }
  }, [goals, showToast])

  return (
    <AppShell>
      <header className="animate-fade-in-up flex items-center justify-between gap-3">
        <Logo variant="full" size="lg" withBackground />
        <Link
          to="/profile"
          aria-label="Meu perfil"
          className="transition-transform active:scale-95"
        >
          <Avatar name={profile?.name} avatarUrl={profile?.avatar_url} size="md" />
        </Link>
      </header>

      <div className="animate-fade-in-up mt-6" style={{ animationDelay: '60ms' }}>
        <h1 className="text-headline-sm-mobile text-on-surface">
          {getGreeting()}
          {profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Assim está o seu progresso hoje.
        </p>
      </div>

      {loading && <DashboardSkeleton />}

      {!loading && activeGoals.length > 0 && (
        <div
          className="card-gradient-primary animate-scale-in mt-6 rounded-2xl p-6 text-on-primary shadow-xl"
          style={{ animationDelay: '100ms' }}
        >
          <div className="relative z-10">
            <p className="flex items-center gap-1.5 text-label-sm uppercase text-primary-fixed">
              <Sparkle size={13} weight="fill" className="animate-pulse-soft" />
              Guardado em metas ativas
            </p>
            <p className="mt-1 text-headline-md">
              <AnimatedCentsValue cents={totalSavedCents} />
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-label-sm">
              <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">
                {activeGoals.length} {activeGoals.length === 1 ? 'meta ativa' : 'metas ativas'}
              </span>
              {streakDays > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">
                  <Fire size={14} weight="fill" className="text-orange-300" />
                  {streakDays} {streakDays === 1 ? 'dia seguido' : 'dias seguidos'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {!loading && (
        <section className="mt-8">
          <h2 className="animate-fade-in-up text-body-lg font-semibold text-on-surface" style={{ animationDelay: '140ms' }}>
            Metas em Andamento
          </h2>

          {activeGoals.length === 0 && (
            <div className="animate-fade-in-up mt-6 flex flex-col items-center gap-3 py-8 text-center" style={{ animationDelay: '180ms' }}>
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed">
                <Sparkle size={28} weight="duotone" className="text-primary" />
              </span>
              <p className="text-body-md text-on-surface-variant">
                Nenhuma meta em andamento.<br />Crie a primeira!
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-4">
            {activeGoals.map((goal, index) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                savedCents={progressByGoal[goal.id]?.savedCents ?? 0}
                percent={progressByGoal[goal.id]?.percent ?? 0}
                style={{ animationDelay: `${160 + index * 80}ms` }}
              />
            ))}
          </div>
        </section>
      )}

      {completedGoals.length > 0 && (
        <section className="mt-10">
          <h2 className="animate-fade-in-up text-body-lg font-semibold text-on-surface">
            Metas Concluídas
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            {completedGoals.map((goal, index) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                savedCents={progressByGoal[goal.id]?.savedCents ?? 0}
                percent={progressByGoal[goal.id]?.percent ?? 100}
                style={{ animationDelay: `${index * 80}ms` }}
              />
            ))}
          </div>
        </section>
      )}

      <Link
        to="/goals/new"
        className="animate-scale-in fixed bottom-24 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-xl transition-all hover:scale-110 hover:shadow-2xl active:scale-95"
        style={{ animationDelay: '300ms' }}
        aria-label="Nova meta"
      >
        <Plus size={26} weight="bold" />
      </Link>
    </AppShell>
  )
}
