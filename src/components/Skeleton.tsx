interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} />
}

export function GoalCardSkeleton() {
  return (
    <div className="card-elevated animate-fade-in-up flex flex-col gap-3 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-8" />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="animate-fade-in-up skeleton h-44 rounded-lg" />
      <div className="mt-4">
        <Skeleton className="h-5 w-44" />
        <div className="mt-4 flex flex-col gap-4">
          <GoalCardSkeleton />
          <GoalCardSkeleton />
        </div>
      </div>
    </div>
  )
}

export function HistorySkeleton() {
  return (
    <div className="mt-6 flex flex-col gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-fade-in-up card-elevated flex items-center gap-3 p-4" style={{ animationDelay: `${i * 80}ms` }}>
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="mt-1.5 h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
