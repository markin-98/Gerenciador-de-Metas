import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="mx-auto min-h-screen max-w-[1100px] bg-surface pb-24">
      <div className="px-5 py-7 sm:px-6 sm:py-8">{children}</div>
      <BottomNav />
    </div>
  )
}
