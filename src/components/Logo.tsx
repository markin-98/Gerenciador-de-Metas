import logoIcon from '../assets/logo-icon.png'

interface LogoProps {
  variant?: 'full' | 'icon'
  size?: 'md' | 'lg'
  className?: string
}

const iconSizeClasses: Record<NonNullable<LogoProps['size']>, string> = {
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
}

const wordmarkSizeClasses: Record<NonNullable<LogoProps['size']>, string> = {
  md: 'text-headline-sm-mobile',
  lg: 'text-headline-sm',
}

export function Logo({ variant = 'full', size = 'md', className = '' }: LogoProps) {
  if (variant === 'icon') {
    return (
      <img
        src={logoIcon}
        alt="Gerenciador de Metas"
        className={`${iconSizeClasses[size]} ${className}`}
      />
    )
  }

  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      <img src={logoIcon} alt="" className={`shrink-0 ${iconSizeClasses[size]}`} />
      <span className={`truncate ${wordmarkSizeClasses[size]} leading-none text-on-surface`}>
        Gerenciador de Metas
      </span>
    </div>
  )
}
