import { useState } from 'react'
import { useDialogA11y } from '../hooks/useDialogA11y'

interface ShareLinkDialogProps {
  open: boolean
  title: string
  description: string
  link: string
  onClose: () => void
}

export function ShareLinkDialog({ open, title, description, link, onClose }: ShareLinkDialogProps) {
  const [copied, setCopied] = useState(false)
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator
  const panelRef = useDialogA11y(open, onClose)

  if (!open) return null

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Alguns navegadores bloqueiam a Clipboard API fora de HTTPS/contexto seguro;
      // o link continua visível e selecionável manualmente no campo abaixo.
    }
  }

  async function handleShare() {
    try {
      await navigator.share({ title, url: link })
    } catch {
      // Usuário cancelou o compartilhamento nativo; nada a fazer.
    }
  }

  return (
    <div className="animate-backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 px-4">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
        tabIndex={-1}
        className="animate-modal-in card-elevated w-full max-w-sm rounded-2xl p-6 focus:outline-none"
      >
        <h3 id="share-dialog-title" className="text-headline-sm-mobile text-on-surface">
          {title}
        </h3>
        <p className="mt-2 text-body-md text-on-surface-variant">{description}</p>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-outline-variant/50 bg-surface-container-low px-4 py-3">
          <input
            readOnly
            value={link}
            onFocus={(e) => e.target.select()}
            className="min-w-0 flex-1 truncate bg-transparent text-body-md text-on-surface focus:outline-none"
          />
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full bg-primary px-4 py-2.5 text-label-md font-medium text-on-primary shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-95"
          >
            {copied ? 'Link copiado!' : 'Copiar link'}
          </button>
          {canShare && (
            <button
              type="button"
              onClick={handleShare}
              className="rounded-full border border-primary/50 px-4 py-2.5 text-label-md font-medium text-primary transition-all hover:bg-primary/5 active:scale-95"
            >
              Compartilhar
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2.5 text-label-md text-on-surface-variant transition-transform hover:bg-surface-container active:scale-95"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
