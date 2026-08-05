const COLORS = ['#416352', '#aacfba', '#c6ebd5', '#e8b567', '#2c4d3d']

interface ConfettiProps {
  fire: boolean
}

/** Pequena explosão de confete em CSS puro, para celebrar metas concluídas. */
export function Confetti({ fire }: ConfettiProps) {
  if (!fire) return null

  const pieces = Array.from({ length: 18 }, (_, i) => i)

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((i) => {
        const left = 5 + ((i * 53) % 90)
        const delay = (i % 6) * 60
        const color = COLORS[i % COLORS.length]
        const size = 6 + (i % 3) * 2
        return (
          <span
            key={i}
            className="animate-confetti absolute top-0 rounded-sm"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              backgroundColor: color,
              animationDelay: `${delay}ms`,
            }}
          />
        )
      })}
    </div>
  )
}
