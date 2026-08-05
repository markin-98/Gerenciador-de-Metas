import { useEffect, useRef, useState } from 'react'
import { CheckCircle } from '@phosphor-icons/react'
import type { Deposit } from '../types/database'
import { formatCentsToBRL, formatDepositLabel } from '../lib/deposits'

interface DepositGridProps {
  deposits: Deposit[]
  onDepositClick: (deposit: Deposit) => void
}

export function DepositGrid({ deposits, onDepositClick }: DepositGridProps) {
  const previousStatuses = useRef<Record<string, string>>({})
  const [justCompleted, setJustCompleted] = useState<Set<string>>(new Set())

  useEffect(() => {
    const newlyCompleted: string[] = []
    for (const deposit of deposits) {
      const prev = previousStatuses.current[deposit.id]
      if (prev === 'pending' && deposit.status === 'completed') {
        newlyCompleted.push(deposit.id)
      }
      previousStatuses.current[deposit.id] = deposit.status
    }
    if (newlyCompleted.length > 0) {
      setJustCompleted((prev) => new Set([...prev, ...newlyCompleted]))
      setTimeout(() => {
        setJustCompleted((prev) => {
          const next = new Set(prev)
          for (const id of newlyCompleted) next.delete(id)
          return next
        })
      }, 450)
    }
  }, [deposits])

  return (
    <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
      {deposits.map((deposit) => {
        const isCompleted = deposit.status === 'completed'
        return (
          <button
            key={deposit.id}
            type="button"
            title={formatCentsToBRL(deposit.amount_cents)}
            onClick={() => onDepositClick(deposit)}
            className={`relative flex aspect-square items-center justify-center rounded-full p-1 text-center text-label-sm font-semibold leading-none transition-all active:scale-95 ${
              justCompleted.has(deposit.id) ? 'animate-pop' : ''
            } ${
              isCompleted
                ? 'bg-primary text-on-primary shadow-md shadow-primary/20 ring-2 ring-primary ring-offset-2 ring-offset-surface-container-lowest'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:shadow-sm'
            }`}
          >
            {formatDepositLabel(deposit.amount_cents)}
            {isCompleted && (
              <CheckCircle
                size={16}
                weight="fill"
                className="absolute -right-1 -top-1 rounded-full bg-surface-container-lowest text-primary"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
