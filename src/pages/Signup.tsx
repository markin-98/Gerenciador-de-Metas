import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Logo } from '../components/Logo'
import { FieldError } from '../components/FieldError'
import { translateSupabaseError } from '../lib/errors'
import { isValidEmail } from '../lib/validation'

interface FormErrors {
  name?: string
  email?: string
  password?: string
}

export function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')
  const loginHref = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  function validate(): FormErrors {
    const errors: FormErrors = {}
    if (!name.trim()) {
      errors.name = 'Informe seu nome.'
    }
    if (!email.trim()) {
      errors.email = 'Informe seu e-mail.'
    } else if (!isValidEmail(email)) {
      errors.email = 'Informe um e-mail válido.'
    }
    if (!password) {
      errors.password = 'Crie uma senha.'
    } else if (password.length < 6) {
      errors.password = 'A senha precisa ter pelo menos 6 caracteres.'
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
      await signUp(email, password, name.trim())
      setDone(true)
    } catch (err) {
      setFormError(translateSupabaseError(err))
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6">
        <div className="animate-fade-in-up card-elevated w-full max-w-sm p-8 text-center">
          <h1 className="text-headline-sm text-on-surface">Cadastro realizado!</h1>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Verifique seu e-mail para confirmar a conta e depois faça login.
          </p>
          <button
            type="button"
            onClick={() => navigate(loginHref)}
            className="mt-6 rounded-full bg-primary px-4 py-3 text-label-md text-on-primary transition-transform active:scale-95"
          >
            Ir para o login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6">
      <div className="animate-fade-in-up card-elevated w-full max-w-sm p-8">
        <Logo variant="icon" />
        <h1 className="mt-3 text-headline-sm text-on-surface">Criar conta</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Comece a organizar suas metas financeiras.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-label-md text-on-surface-variant">Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={Boolean(fieldErrors.name)}
              className={`mt-1 w-full rounded-md border bg-transparent px-3 py-2 text-body-md focus:outline-none ${
                fieldErrors.name
                  ? 'border-error focus:border-error'
                  : 'border-outline-variant focus:border-primary'
              }`}
            />
            <FieldError message={fieldErrors.name} />
          </div>
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
            {loading ? 'Criando…' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-6 text-center text-body-md text-on-surface-variant">
          Já tem conta?{' '}
          <Link to={loginHref} className="text-primary font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
