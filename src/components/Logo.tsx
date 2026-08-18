import logoIcon from '../assets/logo-icon.png'

interface LogoProps {
  variant?: 'full' | 'icon'
  size?: 'md' | 'lg'
  withBackground?: boolean
  className?: string
}

const iconSizeClasses: Record<NonNullable<LogoProps['size']>, string> = {
  md: 'h-9 w-9',
  lg: 'h-11 w-11',
}

const bgSizeClasses: Record<NonNullable<LogoProps['size']>, string> = {
  md: 'h-11 w-11',
  lg: 'h-13 w-13',
}

export function Logo({ variant = 'full', size = 'md', withBackground = false, className = '' }: LogoProps) {
  const icon = (
    <img
      src={logoIcon}
      alt={variant === 'icon' ? 'Gerenciador de Metas' : ''}
      className={iconSizeClasses[size]}
    />
  )

  const wrappedIcon = withBackground ? (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-white shadow-sm ${bgSizeClasses[size]}`}>
      {icon}
    </span>
  ) : (
    <span className="shrink-0">{icon}</span>
  )

  if (variant === 'icon') {
    return <span className={className}>{wrappedIcon}</span>
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {wrappedIcon}
      <span className="whitespace-nowrap text-[15px] font-semibold leading-tight text-on-surface sm:text-[17px]" style={{ fontFamily: 'var(--font-display)' }}>
        Gerenciador de Metas
      </span>
    </div>
  )
}
