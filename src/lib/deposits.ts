/** Máximo de depósitos permitido por meta (evita metas com milhares de linhas). */
export const MAX_DEPOSITS_PER_GOAL = 500

/**
 * Gera a sequência de depósitos para uma meta do tipo "Desafio por Depósitos":
 * valores crescentes de R$1 em R$1, de startReais até endReais (ambos inteiros,
 * em reais — ex: 1 até 250 gera 250 depósitos de R$1, R$2, ..., R$250).
 */
export function generateChallengeSequence(startReais: number, endReais: number): number[] {
  if (!Number.isInteger(startReais) || !Number.isInteger(endReais)) {
    throw new Error('Os valores do desafio devem ser números inteiros de reais.')
  }
  if (startReais <= 0) {
    throw new Error('O valor inicial deve ser maior que zero.')
  }
  if (endReais < startReais) {
    throw new Error('O valor final deve ser maior ou igual ao valor inicial.')
  }
  if (endReais - startReais + 1 > MAX_DEPOSITS_PER_GOAL) {
    throw new Error(
      `Isso geraria ${endReais - startReais + 1} depósitos; o máximo permitido é ${MAX_DEPOSITS_PER_GOAL}.`
    )
  }
  const sequence: number[] = []
  for (let reais = startReais; reais <= endReais; reais++) {
    sequence.push(reais * 100)
  }
  return sequence
}

/**
 * Verifica se é matematicamente viável distribuir totalAmountCents em N depósitos
 * estritamente crescentes de pelo menos R$1 em R$1 (mesmo padrão do Desafio):
 * a parte em reais inteiros do total deve ser >= N(N+1)/2.
 */
export function isTargetViable(totalAmountCents: number, depositsCount: number): boolean {
  const totalReaisWhole = Math.floor(totalAmountCents / 100)
  const minimum = (depositsCount * (depositsCount + 1)) / 2
  return totalReaisWhole >= minimum
}

/**
 * Gera a sequência crescente de N depósitos cuja soma é exatamente totalAmountCents,
 * para a meta do tipo "Meta por Valor Total".
 *
 * Usa o mesmo passo de R$1 em R$1 do "Desafio por Depósitos" (não 1 centavo), para
 * que os dois métodos produzam a mesma sequência quando o total e a quantidade
 * coincidem com o caso clássico 1, 2, 3, ..., N. base = floor((totalReais -
 * N*(N-1)/2) / N); sequência base, base+1, ...; resíduo em reais distribuído nos
 * últimos depósitos (+R$1 cada). Se o valor total tiver centavos, o resto (0 a 99
 * centavos) é somado apenas ao último depósito.
 */
export function generateTargetSequence(
  totalAmountCents: number,
  depositsCount: number
): number[] {
  if (depositsCount <= 0) {
    throw new Error('Quantidade de depósitos deve ser maior que zero.')
  }
  if (depositsCount > MAX_DEPOSITS_PER_GOAL) {
    throw new Error(`O máximo de depósitos permitido por meta é ${MAX_DEPOSITS_PER_GOAL}.`)
  }
  if (!isTargetViable(totalAmountCents, depositsCount)) {
    throw new Error(
      'Combinação de valor e quantidade de depósitos inviável: o valor total é insuficiente.'
    )
  }

  const n = depositsCount
  const totalReaisWhole = Math.floor(totalAmountCents / 100)
  const centsRemainder = totalAmountCents - totalReaisWhole * 100

  const baseReais = Math.floor((totalReaisWhole - (n * (n - 1)) / 2) / n)

  const reaisSequence: number[] = []
  for (let i = 0; i < n; i++) {
    reaisSequence.push(baseReais + i)
  }

  const sumBeforeResidue = reaisSequence.reduce((sum, v) => sum + v, 0)
  let residue = totalReaisWhole - sumBeforeResidue

  let i = reaisSequence.length - 1
  while (residue > 0 && i >= 0) {
    reaisSequence[i] += 1
    residue -= 1
    i -= 1
  }

  const sequence = reaisSequence.map((reais) => reais * 100)
  if (centsRemainder > 0) {
    sequence[sequence.length - 1] += centsRemainder
  }

  return sequence
}

export function formatCentsToBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function parseBRLToCents(value: string): number {
  const normalized = value.replace(/[^\d,.-]/g, '').replace(',', '.')
  const amount = parseFloat(normalized)
  if (Number.isNaN(amount)) return 0
  return Math.round(amount * 100)
}

/**
 * Calcula o progresso a partir do valor total oficial da meta (goal.total_amount_cents),
 * não da soma dos depósitos carregados — evita divergência caso a listagem de depósitos
 * esteja paginada/incompleta.
 */
export function calculateProgress(
  deposits: { amount_cents: number; status: string }[],
  totalAmountCents: number
) {
  const savedCents = deposits
    .filter((d) => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount_cents, 0)
  const remainingCents = totalAmountCents - savedCents
  const percent =
    totalAmountCents > 0 ? Math.round((savedCents / totalAmountCents) * 100) : 0
  return { totalCents: totalAmountCents, savedCents, remainingCents, percent }
}

/** Rótulo compacto do valor de um depósito, para caber no botão circular da grade. */
export function formatDepositLabel(amountCents: number): string {
  const reais = amountCents / 100
  if (Number.isInteger(reais)) {
    return reais.toLocaleString('pt-BR')
  }
  return reais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
