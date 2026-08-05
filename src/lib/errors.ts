/** Traduz erros comuns do Supabase (Auth e Postgres/PostgREST) para mensagens em português. */
export function translateSupabaseError(error: unknown): string {
  const message = extractMessage(error)
  const lower = message.toLowerCase()

  if (lower.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos.'
  }
  if (lower.includes('email address') && lower.includes('invalid')) {
    return 'Esse e-mail não é válido. Verifique se digitou corretamente.'
  }
  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return 'Já existe uma conta com esse e-mail. Tente entrar em vez de cadastrar.'
  }
  if (lower.includes('password should be at least') || lower.includes('password is too short')) {
    return 'A senha precisa ter pelo menos 6 caracteres.'
  }
  if (lower.includes('weak password') || lower.includes('should contain')) {
    return 'Senha muito fraca. Use letras, números e pelo menos 6 caracteres.'
  }
  if (lower.includes('email not confirmed')) {
    return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.'
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Muitas tentativas seguidas. Aguarde um momento e tente novamente.'
  }
  if (lower.includes('duplicate key value') || lower.includes('23505')) {
    return 'Esse item já existe.'
  }
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'Não foi possível conectar. Verifique sua internet e tente novamente.'
  }

  return message || 'Algo deu errado. Tente novamente.'
}

function extractMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message?: unknown }).message
    if (typeof msg === 'string') return msg
  }
  return ''
}
