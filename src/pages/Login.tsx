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

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6">
      <div className="animate-fade-in-up card-elevated w-full max-w-sm p-8">
        <Logo />
        <p className="mt-4 text-body-md text-on-surface-variant">Entre na sua conta.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-label-md text-on-surface-variant">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              className={`mt-1 w-full rounded-md border bg-transparent px-3 py-2 text-body-md focus:outline-none ${
                fieldErrors.email
                  ? 'border-error focus:border-error'
                  : 'border-outline-variant focus:border-primary'
              }`}
            />
            <FieldError message={fieldErrors.email} />
          </div>
          <div>
            <label className="text-label-md text-on-surface-variant">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              className={`mt-1 w-full rounded-md border bg-transparent px-3 py-2 text-body-md focus:outline-none ${
                fieldErrors.password
                  ? 'border-error focus:border-error'
                  : 'border-outline-variant focus:border-primary'
              }`}
            />
            <FieldError message={fieldErrors.password} />
          </div>

          {formError && <p className="text-label-md text-error">{formError}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-primary px-4 py-3 text-label-md text-on-primary transition-transform active:scale-95 disabled:opacity-60"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-body-md text-on-surface-variant">
          Não tem conta?{' '}
          <Link
            to={redirect ? `/signup?redirect=${encodeURIComponent(redirect)}` : '/signup'}
            className="text-primary font-medium"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}
