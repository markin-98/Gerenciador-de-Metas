import { useDialogA11y } from '../hooks/useDialogA11y'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const panelRef = useDialogA11y(open, onCancel)

  if (!open) return null

  return (
    <div className="animate-backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 px-4">
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        tabIndex={-1}
        className="animate-modal-in card-elevated w-full max-w-sm p-6 focus:outline-none"
      >
        <h3 id="confirm-dialog-title" className="text-headline-sm-mobile text-on-surface">
          {title}
        </h3>
        <p className="mt-2 text-body-md text-on-surface-variant">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-label-md text-on-surface-variant transition-transform hover:bg-surface-container active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-error px-4 py-2 text-label-md text-on-error transition-transform hover:opacity-90 active:scale-95"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
