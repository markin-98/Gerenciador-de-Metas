import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const MAX_SIZE_BYTES = 5 * 1024 * 1024

export function useAvatarUpload() {
  const { user, updateProfile } = useAuth()
  const [uploading, setUploading] = useState(false)

  async function uploadAvatar(file: File) {
    if (!user) throw new Error('Não autenticado.')
    if (!file.type.startsWith('image/')) {
      throw new Error('Escolha um arquivo de imagem (JPG, PNG, etc.).')
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new Error('A imagem deve ter no máximo 5MB.')
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, cacheControl: '3600' })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const avatarUrl = `${data.publicUrl}?t=${Date.now()}`

      await updateProfile({ avatar_url: avatarUrl })
    } finally {
      setUploading(false)
    }
  }

  return { uploadAvatar, uploading }
}
