import { NavLink } from 'react-router-dom'
import { House, ClockCounterClockwise, PlusCircle, Trophy, UserCircle } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

const items: { key: string; label: string; path: string; icon: Icon }[] = [
  { key: 'home', label: 'Início', path: '/', icon: House },
  { key: 'history', label: 'Histórico', path: '/history', icon: ClockCounterClockwise },
  { key: 'new', label: 'Novo', path: '/goals/new', icon: PlusCircle },
  { key: 'achievements', label: 'Conquistas', path: '/achievements', icon: Trophy },
  { key: 'profile', label: 'Perfil', path: '/profile', icon: UserCircle },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant bg-surface-container-lowest">
      <div className="mx-auto flex max-w-[1100px] items-center justify-around px-2 py-2">
        {items.map((item) => {
          const IconComponent = item.icon
          return (
            <NavLink
              key={item.key}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-label-sm transition-colors ${
                  isActive ? 'text-primary' : 'text-on-surface-variant'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <IconComponent size={22} weight={isActive ? 'fill' : 'regular'} />
                  {item.label}
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
