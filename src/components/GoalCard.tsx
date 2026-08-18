import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Target, PiggyBank, Trophy } from '@phosphor-icons/react'
import { formatCentsToBRL } from '../lib/deposits'
import { ProgressBar } from './ProgressBar'
import type { Goal } from '../types/database'

interface GoalCardProps {
  goal: Goal
  savedCents: number
  percent: number
  style?: CSSProperties
}

export function GoalCard({ goal, savedCents, percent, style }: GoalCardProps) {
  const remainingCents = goal.total_amount_cents - savedCents
  const isCompleted = goal.status === 'completed'
  const TypeIcon = goal.type === 'challenge' ? Target : PiggyBank

  return (
    <Link
      to={`/goals/${goal.id}`}
      style={style}
      className="animate-fade-in-up card-elevated card-elevated-hover flex flex-col gap-3 p-6 transition-all active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-fixed">
            <TypeIcon size={18} weight="duotone" className="text-primary" />
          </span>
          <h3 className="text-body-lg font-semibold text-on-surface">{goal.name}</h3>
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

      <div className="flex items-baseline justify-between text-label-md text-on-surface-variant">
        <span className="text-body-md font-semibold text-on-surface">{formatCentsToBRL(savedCents)}</span>
        <span>de {formatCentsToBRL(goal.total_amount_cents)}</span>
      </div>

      <ProgressBar percent={percent} />

      <div className="flex items-center justify-between text-label-sm">
        <span className="text-on-surface-variant">
          {isCompleted ? 'Meta batida!' : `Faltam ${formatCentsToBRL(remainingCents)}`}
        </span>
        <span className="font-semibold text-primary">{percent}%</span>
      </div>
    </Link>
  )
}
