const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim())
}

export function isPositiveIntegerString(value: string): boolean {
  return /^\d+$/.test(value.trim()) && parseInt(value, 10) > 0
}

/** Aceita "10", "10,50", "10.50", "R$ 10,50" etc. Rejeita vazio, negativo ou não numérico. */
export function isValidCurrencyInput(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  const normalized = trimmed.replace(/[^\d,.-]/g, '').replace(',', '.')
  if (normalized === '' || normalized === '-') return false
  const amount = Number(normalized)
  return Number.isFinite(amount) && amount > 0
}
