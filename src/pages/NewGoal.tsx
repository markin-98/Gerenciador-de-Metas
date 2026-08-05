import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Target, PiggyBank, Sparkle } from '@phosphor-icons/react'
import { AppShell } from '../components/AppShell'
import { FieldError } from '../components/FieldError'
import { useAuth } from '../contexts/AuthContext'
import { useMySpace } from '../hooks/useMySpace'
import { useGoals } from '../hooks/useGoals'
import { MAX_DEPOSITS_PER_GOAL, isTargetViable, parseBRLToCents } from '../lib/deposits'
import { translateSupabaseError } from '../lib/errors'
import { isPositiveIntegerString, isValidCurrencyInput } from '../lib/validation'

type GoalTypeOption = 'challenge' | 'target'

interface FormErrors {
  name?: string
  startAmount?: string
  endAmount?: string
  totalAmount?: string
  depositsCount?: string
}

export function NewGoal() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { spaceId } = useMySpace()
  const { createChallengeGoal, createTargetGoal } = useGoals(spaceId)

  const [type, setType] = useState<GoalTypeOption>('challenge')
  const [name, setName] = useState('')
  const [startAmount, setStartAmount] = useState('')
  const [endAmount, setEndAmount] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [depositsCount, setDepositsCount] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate(): FormErrors {
    const errors: FormErrors = {}

    if (!name.trim()) {
      errors.name = 'Informe o nome da meta.'
    }

    if (type === 'challenge') {
      if (!startAmount.trim()) {
        errors.startAmount = 'Informe o valor inicial.'
      } else if (!isPositiveIntegerString(startAmount)) {
        errors.startAmount = 'Informe um número inteiro de reais, maior que zero.'
      }

      if (!endAmount.trim()) {
        errors.endAmount = 'Informe o valor final.'
      } else if (!isPositiveIntegerString(endAmount)) {
        errors.endAmount = 'Informe um número inteiro de reais, maior que zero.'
      }

      if (!errors.startAmount && !errors.endAmount) {
        const start = parseInt(startAmount, 10)
        const end = parseInt(endAmount, 10)
        if (end < start) {
          errors.endAmount = 'O valor final deve ser maior ou igual ao valor inicial.'
        } else if (end - start + 1 > MAX_DEPOSITS_PER_GOAL) {
          errors.endAmount = `Isso geraria ${end - start + 1} depósitos; o máximo permitido é ${MAX_DEPOSITS_PER_GOAL}.`
        }
      }
    } else {
      if (!totalAmount.trim()) {
        errors.totalAmount = 'Informe o valor desejado.'
      } else if (!isValidCurrencyInput(totalAmount)) {
        errors.totalAmount = 'Informe um valor válido, maior que zero.'
      }

      if (!depositsCount.trim()) {
        errors.depositsCount = 'Informe a quantidade de depósitos.'
      } else if (!isPositiveIntegerString(depositsCount)) {
        errors.depositsCount = 'Informe um número inteiro maior que zero.'
      } else if (parseInt(depositsCount, 10) > MAX_DEPOSITS_PER_GOAL) {
        errors.depositsCount = `O máximo de depósitos permitido por meta é ${MAX_DEPOSITS_PER_GOAL}.`
      }

      if (!errors.totalAmount && !errors.depositsCount) {
        const totalCents = parseBRLToCents(totalAmount)
        const count = parseInt(depositsCount, 10)
        if (!isTargetViable(totalCents, count)) {
          errors.depositsCount =
            'Combinação inviável: aumente o valor total ou reduza a quantidade de depósitos.'
        }
      }
    }

    return errors
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!user || !spaceId) return

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    try {
      if (type === 'challenge') {
        const start = parseInt(startAmount, 10)
        const end = parseInt(endAmount, 10)
        const goal = await createChallengeGoal(name.trim(), start, end, user.id)
        navigate(`/goals/${goal.id}`)
      } else {
        const totalCents = parseBRLToCents(totalAmount)
        const count = parseInt(depositsCount, 10)
        const goal = await createTargetGoal(name.trim(), totalCents, count, user.id)
        navigate(`/goals/${goal.id}`)
      }
    } catch (err) {
      setFormError(translateSupabaseError(err))
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (hasError: string | undefined) =>
    `mt-1 w-full rounded-xl border bg-surface-container-low px-4 py-3 text-body-md text-on-surface transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
      hasError
        ? 'border-error focus:ring-error/30'
        : 'border-outline-variant/50 focus:border-primary focus:ring-primary/20'
    }`

  return (
    <AppShell>
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-fixed">
            <Sparkle size={18} weight="fill" className="text-primary" />
          </span>
          <h1 className="text-headline-sm-mobile text-on-surface">Criar Nova Meta</h1>
        </div>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Defina seu próximo objetivo financeiro.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="animate-fade-in-up mt-7 flex flex-col gap-5" style={{ animationDelay: '80ms' }}>
        <div>
          <label className="text-label-md font-medium text-on-surface">Nome da Meta</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Viagem para o Japão"
            aria-invalid={Boolean(fieldErrors.name)}
            className={inputClass(fieldErrors.name)}
          />
          <FieldError message={fieldErrors.name} />
        </div>

        <div>
          <label className="text-label-md font-medium text-on-surface">Tipo de Meta</label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('challenge')}
              className={`card-elevated flex flex-col items-center gap-2 rounded-2xl px-4 py-4 text-label-md transition-all active:scale-[0.97] ${
                type === 'challenge'
                  ? 'border-primary bg-primary-fixed text-on-primary-fixed-variant ring-2 ring-primary shadow-md shadow-primary/10'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <Target size={24} weight={type === 'challenge' ? 'fill' : 'duotone'} className={type === 'challenge' ? 'text-primary' : ''} />
              <span>Desafio por Depósitos</span>
              {type === 'challenge' && <Check size={14} weight="bold" className="text-primary" />}
            </button>
            <button
              type="button"
              onClick={() => setType('target')}
              className={`card-elevated flex flex-col items-center gap-2 rounded-2xl px-4 py-4 text-label-md transition-all active:scale-[0.97] ${
                type === 'target'
                  ? 'border-primary bg-primary-fixed text-on-primary-fixed-variant ring-2 ring-primary shadow-md shadow-primary/10'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <PiggyBank size={24} weight={type === 'target' ? 'fill' : 'duotone'} className={type === 'target' ? 'text-primary' : ''} />
              <span>Meta por Valor Total</span>
              {type === 'target' && <Check size={14} weight="bold" className="text-primary" />}
            </button>
          </div>
        </div>

        {type === 'challenge' ? (
          <>
            <div>
              <label className="text-label-md font-medium text-on-surface">
                Valor Inicial do Depósito (R$, inteiro)
              </label>
              <input
                inputMode="numeric"
                value={startAmount}
                onChange={(e) => setStartAmount(e.target.value)}
                placeholder="Ex: 1"
                aria-invalid={Boolean(fieldErrors.startAmount)}
                className={inputClass(fieldErrors.startAmount)}
              />
              <FieldError message={fieldErrors.startAmount} />
            </div>
            <div>
              <label className="text-label-md font-medium text-on-surface">
                Valor Final do Depósito (R$, inteiro)
              </label>
              <input
                inputMode="numeric"
                value={endAmount}
                onChange={(e) => setEndAmount(e.target.value)}
                placeholder="Ex: 250"
                aria-invalid={Boolean(fieldErrors.endAmount)}
                className={inputClass(fieldErrors.endAmount)}
              />
              <FieldError message={fieldErrors.endAmount} />
            </div>
            <div className="rounded-xl bg-primary-fixed/40 px-4 py-3 text-label-sm text-on-primary-fixed-variant">
              Geramos automaticamente um depósito de R$1 em R$1 entre os dois valores. Ex: 1 até
              250 gera 250 depósitos (R$1, R$2, ..., R$250).
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="text-label-md font-medium text-on-surface">Valor Desejado (R$)</label>
              <input
                inputMode="decimal"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0,00"
                aria-invalid={Boolean(fieldErrors.totalAmount)}
                className={inputClass(fieldErrors.totalAmount)}
              />
              <FieldError message={fieldErrors.totalAmount} />
            </div>
            <div>
              <label className="text-label-md font-medium text-on-surface">
                Quantidade de Depósitos
              </label>
              <input
                inputMode="numeric"
                value={depositsCount}
                onChange={(e) => setDepositsCount(e.target.value)}
                placeholder="Ex: 30"
                aria-invalid={Boolean(fieldErrors.depositsCount)}
                className={inputClass(fieldErrors.depositsCount)}
              />
              <FieldError message={fieldErrors.depositsCount} />
            </div>
            <div className="rounded-xl bg-primary-fixed/40 px-4 py-3 text-label-sm text-on-primary-fixed-variant">
              Calculamos automaticamente uma sequência crescente de depósitos cuja soma bate
              exatamente com o valor desejado.
            </div>
          </>
        )}

        {formError && (
          <div className="animate-fade-in-up rounded-xl bg-error-container/50 px-4 py-3 text-label-md text-on-error-container">
            {formError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-primary px-4 py-3.5 text-label-md font-semibold text-on-primary shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? 'Criando…' : 'Criar Meta'}
        </button>
      </form>
    </AppShell>
  )
}
