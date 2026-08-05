import logoIcon from '../assets/logo-icon.png'

interface LogoProps {
  variant?: 'full' | 'icon'
  size?: 'md' | 'lg'
  withBackground?: boolean
  className?: string
}

const iconSizeClasses: Record<NonNullable<LogoProps['size']>, string> = {
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
}

const bgSizeClasses: Record<NonNullable<LogoProps['size']>, string> = {
  md: 'h-11 w-11',
  lg: 'h-14 w-14',
}

const wordmarkSizeClasses: Record<NonNullable<LogoProps['size']>, string> = {
  md: 'text-headline-sm-mobile',
  lg: 'text-headline-sm',
}

export function Logo({ variant = 'full', size = 'md', withBackground = false, className = '' }: LogoProps) {
  const iconImg = (
    <img
      src={logoIcon}
      alt={variant === 'icon' ? 'Gerenciador de Metas' : ''}
      className={`${iconSizeClasses[size]} ${withBackground ? '' : className}`}
    />
  )

  const wrappedIcon = withBackground ? (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-white shadow-sm ${bgSizeClasses[size]} ${variant === 'icon' ? className : ''}`}>
      {iconImg}
    </span>
  ) : (
    iconImg
  )

  if (variant === 'icon') {
    return wrappedIcon
  }

  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      <span className="shrink-0">{wrappedIcon}</span>
      <span className={`${wordmarkSizeClasses[size]} leading-tight text-on-surface`}>
        Gerenciador de Metas
      </span>
    </div>
  )
}
