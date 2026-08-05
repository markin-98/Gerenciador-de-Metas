interface AvatarProps {
  name: string | undefined
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-8 w-8 text-label-sm',
  md: 'h-11 w-11 text-body-md',
  lg: 'h-14 w-14 text-headline-sm',
  xl: 'h-20 w-20 text-headline-md',
}

export function Avatar({ name, avatarUrl, size = 'md', className = '' }: AvatarProps) {
  const initial = (name ?? '?').charAt(0).toUpperCase()

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? 'Avatar'}
        className={`shrink-0 rounded-full border-2 border-surface-container-lowest object-cover ${sizeClasses[size]} ${className}`}
      />
    )
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-primary-container font-semibold text-on-primary-container ${sizeClasses[size]} ${className}`}
    >
      {initial}
    </div>
  )
}
