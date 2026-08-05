import { useCountUp } from '../hooks/useCountUp'
import { formatCentsToBRL } from '../lib/deposits'

export function AnimatedCentsValue({ cents }: { cents: number }) {
  const animatedCents = useCountUp(cents)
  return <>{formatCentsToBRL(animatedCents)}</>
}
