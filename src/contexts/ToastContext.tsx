import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle, WarningCircle, Info, type Icon } from '@phosphor-icons/react'

interface Toast {
  id: number
  message: string
  variant: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  showToast: (message: string, variant?: Toast['variant']) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const ICONS: Record<Toast['variant'], Icon> = {
  success: CheckCircle,
  error: WarningCircle,
  info: Info,
}

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, variant: Toast['variant'] = 'info') => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
        {toasts.map((toast) => {
          const IconComponent = ICONS[toast.variant]
          return (
            <div
              key={toast.id}
              className={`animate-toast-in card-elevated flex items-center gap-3 border-l-4 px-4 py-3 text-body-md shadow-lg ${
                toast.variant === 'success'
                  ? 'border-l-primary bg-surface-container-lowest text-on-surface'
                  : toast.variant === 'error'
                    ? 'border-l-error bg-surface-container-lowest text-on-surface'
                    : 'border-l-outline bg-surface-container-lowest text-on-surface'
              }`}
            >
              <IconComponent
                size={20}
                weight="fill"
                className={
                  toast.variant === 'success'
                    ? 'text-primary'
                    : toast.variant === 'error'
                      ? 'text-error'
                      : 'text-on-surface-variant'
                }
              />
              <span className="min-w-0 flex-1">{toast.message}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider')
  return ctx
}
