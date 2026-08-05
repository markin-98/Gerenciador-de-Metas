import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Logo } from '../components/Logo'
import { FieldError } from '../components/FieldError'
import { translateSupabaseError } from '../lib/errors'
import { isValidEmail } from '../lib/validation'

interface FormErrors {
  email?: string
  password?: string
}

export function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate(): FormErrors {
    const errors: FormErrors = {}
    if (!email.trim()) {
      errors.email = 'Informe seu e-mail.'
    } else if (!isValidEmail(email)) {
      errors.email = 'Informe um e-mail válido.'
    }
    if (!password) {
      errors.password = 'Informe sua senha.'
    }
    return errors
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError('')

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    try {
      await signIn(email, password)
      navigate(redirect || '/')
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-6">
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-primary-fixed/30 blur-3xl" />

      <div className="animate-fade-in-up relative w-full max-w-sm">
        <div className="card-elevated rounded-2xl p-8">
          <div className="flex justify-center">
            <Logo variant="icon" size="lg" withBackground />
          </div>
          <h1 className="mt-5 text-center text-headline-sm-mobile text-on-surface">Bem-vindo de volta</h1>
          <p className="mt-1 text-center text-body-md text-on-surface-variant">Entre na sua conta para continuar.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col gap-4">
            <div>
              <label className="text-label-md text-on-surface-variant">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                aria-invalid={Boolean(fieldErrors.email)}
                className={inputClass(fieldErrors.email)}
              />
              <FieldError message={fieldErrors.email} />
            </div>
            <div>
              <label className="text-label-md text-on-surface-variant">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                aria-invalid={Boolean(fieldErrors.password)}
                className={inputClass(fieldErrors.password)}
              />
              <FieldError message={fieldErrors.password} />
            </div>

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
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <p className="mt-6 text-center text-body-md text-on-surface-variant">
            Não tem conta?{' '}
            <Link
              to={redirect ? `/signup?redirect=${encodeURIComponent(redirect)}` : '/signup'}
              className="font-semibold text-primary transition-colors hover:text-primary-container"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
