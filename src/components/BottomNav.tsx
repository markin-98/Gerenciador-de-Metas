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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant/50 bg-surface-container-lowest/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1100px] items-center justify-around px-2 py-1.5">
        {items.map((item) => {
          const IconComponent = item.icon
          return (
            <NavLink
              key={item.key}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'text-primary'
                    : 'text-on-surface-variant active:scale-95'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="animate-scale-in absolute -top-1.5 left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-primary" />
                  )}
                  <span className={`rounded-lg px-3 py-0.5 transition-colors duration-200 ${isActive ? 'bg-primary-fixed' : ''}`}>
                    <IconComponent size={21} weight={isActive ? 'fill' : 'regular'} />
                  </span>
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
