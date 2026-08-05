import { useRef } from 'react'
import { Camera, Spinner } from '@phosphor-icons/react'
import { Avatar } from './Avatar'

interface EditableAvatarProps {
  name: string | undefined
  avatarUrl: string | null | undefined
  size?: 'md' | 'lg' | 'xl'
  uploading: boolean
  onSelectFile: (file: File) => void
}

export function EditableAvatar({
  name,
  avatarUrl,
  size = 'lg',
  uploading,
  onSelectFile,
}: EditableAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={uploading}
      className="group relative shrink-0 rounded-full transition-transform active:scale-95"
      aria-label="Trocar foto de perfil"
    >
      <Avatar name={name} avatarUrl={avatarUrl} size={size} />
      <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/35">
        {uploading ? (
          <Spinner size={20} className="animate-spin text-white" weight="bold" />
        ) : (
          <Camera
            size={20}
            weight="fill"
            className="text-white opacity-0 transition-opacity group-hover:opacity-100"
          />
        )}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onSelectFile(file)
          e.target.value = ''
        }}
      />
    </button>
  )
}
