import { useEffect, useState } from 'react'

interface ProgressBarProps {
  percent: number
  className?: string
  thick?: boolean
}

export function ProgressBar({ percent, className = '', thick = false }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent))
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setWidth(clamped))
    return () => cancelAnimationFrame(raf)
  }, [clamped])

  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-primary-fixed/60 ${thick ? 'h-4' : 'h-2.5'} ${className}`}
    >
      <div
        className="relative h-full overflow-hidden rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${width}%`,
          background: clamped === 100
            ? 'linear-gradient(90deg, #416352, #2c8a5a)'
            : 'linear-gradient(90deg, #416352, #5a9c7a)',
        }}
      >
        <div className="animate-shimmer absolute inset-0" />
      </div>
    </div>
  )
}
