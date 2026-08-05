import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ArrowClockwise, Warning } from '@phosphor-icons/react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro não tratado na interface:', error, info.componentStack)
  }

  handleReload = () => {
    this.setState({ error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface px-6">
          <div className="card-elevated w-full max-w-sm p-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error-container text-on-error-container">
              <Warning size={26} weight="fill" />
            </span>
            <h1 className="mt-4 text-headline-sm-mobile text-on-surface">Algo deu errado</h1>
            <p className="mt-2 text-body-md text-on-surface-variant">
              Encontramos um erro inesperado nesta tela. Você pode tentar voltar ao início.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-label-md text-on-primary transition-transform active:scale-95"
            >
              <ArrowClockwise size={18} weight="bold" />
              Voltar ao início
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
