import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Fire } from '@phosphor-icons/react'
import { AppShell } from '../components/AppShell'
import { GoalCard } from '../components/GoalCard'
import { Logo } from '../components/Logo'
import { Avatar } from '../components/Avatar'
import { AnimatedCentsValue } from '../components/AnimatedNumber'
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
      <header className="flex items-center justify-between gap-4">
        <Logo variant="full" size="lg" withBackground />
        <Link
          to="/profile"
          aria-label="Meu perfil"
          className="transition-transform active:scale-95"
        >
          <Avatar name={profile?.name} avatarUrl={profile?.avatar_url} size="md" />
        </Link>
      </header>

      <h1 className="mt-6 text-headline-sm-mobile text-on-surface">
        {getGreeting()}
        {profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}
      </h1>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Assim está o seu progresso hoje.
      </p>

      {!loading && activeGoals.length > 0 && (
        <div className="card-gradient-primary animate-fade-in-up mt-6 overflow-hidden rounded-lg p-6 text-on-primary shadow-lg">
          <p className="text-label-sm uppercase text-primary-fixed">Guardado em metas ativas</p>
          <p className="mt-1 text-headline-md">
            <AnimatedCentsValue cents={totalSavedCents} />
          </p>
          <div className="mt-4 flex items-center gap-4 text-label-sm">
            <span className="rounded-full bg-white/15 px-3 py-1">
              {activeGoals.length} {activeGoals.length === 1 ? 'meta ativa' : 'metas ativas'}
            </span>
            {streakDays > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
                <Fire size={14} weight="fill" />
                {streakDays} {streakDays === 1 ? 'dia seguido' : 'dias seguidos'}
              </span>
            )}
          </div>
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-body-lg font-semibold text-on-surface">Metas em Andamento</h2>

        {!loading && activeGoals.length === 0 && (
          <p className="mt-4 text-body-md text-on-surface-variant">
            Nenhuma meta em andamento. Crie a primeira!
          </p>
        )}

        <div className="mt-4 flex flex-col gap-4">
          {activeGoals.map((goal, index) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              savedCents={progressByGoal[goal.id]?.savedCents ?? 0}
              percent={progressByGoal[goal.id]?.percent ?? 0}
              style={{ animationDelay: `${index * 70}ms` }}
            />
          ))}
        </div>
      </section>

      {completedGoals.length > 0 && (
        <section className="mt-10">
          <h2 className="text-body-lg font-semibold text-on-surface">Metas Concluídas</h2>
          <div className="mt-4 flex flex-col gap-4">
            {completedGoals.map((goal, index) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                savedCents={progressByGoal[goal.id]?.savedCents ?? 0}
                percent={progressByGoal[goal.id]?.percent ?? 100}
                style={{ animationDelay: `${index * 70}ms` }}
              />
            ))}
          </div>
        </section>
      )}

      <Link
        to="/goals/new"
        className="fixed bottom-24 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Nova meta"
      >
        <Plus size={26} weight="bold" />
      </Link>
    </AppShell>
  )
}
