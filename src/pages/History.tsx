import { ArrowUp, Flag } from '@phosphor-icons/react'
import { AppShell } from '../components/AppShell'
import { Avatar } from '../components/Avatar'
import { useMySpace } from '../hooks/useMySpace'
import { useHistory } from '../hooks/useHistory'
import { formatCentsToBRL } from '../lib/deposits'

function formatDateLabel(dateStr: string) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  if (isSameDay(date, today)) return 'Hoje'
  if (isSameDay(date, yesterday)) return 'Ontem'
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
}

export function History() {
  const { spaceId } = useMySpace()
  const { events, loading } = useHistory(spaceId)

  const groups = new Map<string, typeof events>()
  for (const event of events) {
    const label = formatDateLabel(event.date)
    if (!groups.has(label)) groups.set(label, [])
    groups.get(label)!.push(event)
  }

  let rowIndex = 0

  return (
    <AppShell>
      <h1 className="text-headline-sm-mobile text-on-surface">Histórico</h1>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Cada passinho conta. Acompanhe a jornada.
      </p>

      {loading && <p className="mt-4 text-body-md text-on-surface-variant">Carregando…</p>}

      {!loading && events.length === 0 && (
        <p className="mt-4 text-body-md text-on-surface-variant">
          Nenhuma atividade registrada ainda.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-6">
        {Array.from(groups.entries()).map(([label, groupEvents]) => (
          <div key={label}>
            <h3 className="text-label-sm uppercase text-primary">{label}</h3>
            <div className="mt-2 flex flex-col gap-3">
              {groupEvents.map((event) => {
                const delay = rowIndex++ * 50
                return (
                  <div
                    key={event.id}
                    style={{ animationDelay: `${delay}ms` }}
                    className="animate-fade-in-up card-elevated card-elevated-hover flex items-center gap-3 p-4"
                  >
                    <div className="relative shrink-0">
                      <Avatar name={event.actorName} avatarUrl={event.actorAvatarUrl} size="sm" />
                      <span
                        className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full ${
                          event.type === 'deposit'
                            ? 'bg-primary text-on-primary'
                            : 'bg-secondary text-on-secondary'
                        }`}
                      >
                        {event.type === 'deposit' ? (
                          <ArrowUp size={10} weight="bold" />
                        ) : (
                          <Flag size={10} weight="fill" />
                        )}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-md text-on-surface">
                        {event.type === 'deposit' ? (
                          <>
                            <span className="font-semibold">{event.actorName}</span> depositou{' '}
                            <span className="font-semibold text-primary">
                              {formatCentsToBRL(event.amountCents ?? 0)}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="font-semibold">{event.actorName}</span> criou a meta{' '}
                            {event.goalName}
                          </>
                        )}
                      </p>
                      <p className="text-label-sm text-on-surface-variant">
                        {new Date(event.date).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' · '}
                        {event.goalName}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  )
}
