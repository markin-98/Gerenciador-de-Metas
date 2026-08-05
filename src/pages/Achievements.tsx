import { Trophy, Medal, Star, Diamond, Rocket, Crown, Lock, UsersThree, Sparkle } from '@phosphor-icons/react'
import { AppShell } from '../components/AppShell'
import { ProgressBar } from '../components/ProgressBar'
import { Skeleton } from '../components/Skeleton'
import { useMySpace } from '../hooks/useMySpace'
import { useAchievements } from '../hooks/useAchievements'

const MEDAL_ICONS = [Trophy, Medal, Star, Diamond, Rocket, Crown]
const MEDAL_GRADIENTS = [
  'from-[#c6ebd5] to-[#8ac4a0]',
  'from-[#ffe4b5] to-[#f0b860]',
  'from-[#d6e4ff] to-[#8aadf0]',
  'from-[#ffd6e0] to-[#e88aa8]',
]

export function Achievements() {
  const { spaceId } = useMySpace()
  const { achievements, goals, sharedAchievements, loading } = useAchievements(spaceId)

  const earnedGoalIds = new Set(achievements.map((a) => a.goal_id))
  const totalGoals = goals.length
  const ownEarnedCount = goals.filter((g) => earnedGoalIds.has(g.id)).length
  const percent = totalGoals > 0 ? Math.round((ownEarnedCount / totalGoals) * 100) : 0

  const galleryItems = [
    ...goals.map((goal, index) => ({
      goal,
      earned: earnedGoalIds.has(goal.id),
      shared: false,
      key: goal.id,
      index,
    })),
    ...sharedAchievements.map((sa, index) => ({
      goal: sa.goal,
      earned: true,
      shared: true,
      key: sa.achievement.id,
      index: goals.length + index,
    })),
  ]

  return (
    <AppShell>
      <div className="animate-fade-in-up flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-fixed">
          <Trophy size={18} weight="fill" className="text-primary" />
        </span>
        <h1 className="text-headline-sm-mobile text-on-surface">Minhas Conquistas</h1>
      </div>

      <div
        className="card-gradient-primary animate-scale-in mt-6 rounded-2xl p-6 text-on-primary shadow-xl"
        style={{ animationDelay: '60ms' }}
      >
        <div className="relative z-10">
          <p className="flex items-center gap-1.5 text-label-sm uppercase text-primary-fixed">
            <Sparkle size={13} weight="fill" className="animate-pulse-soft" />
            Progresso Total
          </p>
          <p className="mt-1 text-headline-md">
            {ownEarnedCount}
            <span className="text-body-lg text-primary-fixed"> / {totalGoals || 0} metas</span>
          </p>
          <div className="mt-4">
            <ProgressBar percent={percent} thick />
          </div>
          <p className="mt-2 text-label-sm text-primary-fixed">
            {percent === 100 && totalGoals > 0
              ? 'Você desbloqueou tudo!'
              : `${percent}% do seu mural de troféus completo`}
          </p>
          {sharedAchievements.length > 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-label-sm text-primary-fixed">
              <UsersThree size={14} weight="fill" />+{sharedAchievements.length}{' '}
              {sharedAchievements.length === 1
                ? 'conquista ajudando outra pessoa'
                : 'conquistas ajudando outras pessoas'}
            </p>
          )}
        </div>
      </div>

      {loading && (
        <div className="mt-8 grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card-elevated flex flex-col items-center gap-3 p-5">
              <Skeleton className="h-14 w-14 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      )}

      {!loading && galleryItems.length === 0 && (
        <div className="animate-fade-in-up mt-8 flex flex-col items-center gap-3 py-8 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed">
            <Trophy size={28} weight="duotone" className="text-primary" />
          </span>
          <p className="text-body-md text-on-surface-variant">Ainda não há metas criadas.</p>
        </div>
      )}

      {!loading && galleryItems.length > 0 && (
        <>
          <h2 className="animate-fade-in-up mt-8 text-body-lg font-semibold text-on-surface" style={{ animationDelay: '120ms' }}>
            Galeria de Troféus
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {galleryItems.map(({ goal, earned, shared, key, index }) => {
              const MedalIcon = MEDAL_ICONS[index % MEDAL_ICONS.length]
              const gradient = MEDAL_GRADIENTS[index % MEDAL_GRADIENTS.length]
              return (
                <div
                  key={key}
                  style={{ animationDelay: `${140 + index * 70}ms` }}
                  className={`animate-fade-in-up card-elevated relative flex flex-col items-center gap-2.5 rounded-2xl p-5 text-center transition-all ${
                    earned ? 'card-elevated-hover' : 'opacity-50 grayscale'
                  }`}
                >
                  {shared && (
                    <span
                      title="Meta de outra pessoa que você ajudou"
                      className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"
                    >
                      <UsersThree size={13} weight="fill" />
                    </span>
                  )}
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-full transition-transform ${
                      earned
                        ? `bg-gradient-to-br ${gradient} shadow-md hover:scale-110`
                        : 'bg-surface-container'
                    }`}
                  >
                    {earned ? (
                      <MedalIcon size={26} weight="fill" className="text-on-primary-fixed-variant" />
                    ) : (
                      <Lock size={22} className="text-on-surface-variant" />
                    )}
                  </span>
                  <p className="text-label-md font-semibold text-on-surface">{goal.name}</p>
                  <p className="text-label-sm text-on-surface-variant">
                    {earned && goal.completed_at
                      ? `Concluído em ${new Date(goal.completed_at).toLocaleDateString('pt-BR')}`
                      : goal.status === 'active'
                        ? 'Em andamento'
                        : 'Bloqueado'}
                  </p>
                </div>
              )
            })}
          </div>
        </>
      )}
    </AppShell>
  )
}
