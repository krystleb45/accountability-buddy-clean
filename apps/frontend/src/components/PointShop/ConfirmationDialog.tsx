import React, { useEffect, useRef } from "react"

interface ConfirmationDialogProps {
  isOpen: boolean
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}) => {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && panelRef.current) panelRef.current.focus()
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      /* Backdrop as an interactive element */
      role="button"
      tabIndex={0}
      aria-label="Close confirmation dialog"
      className={`
        fixed inset-0 z-50 flex items-center justify-center bg-black/50
      `}
      onClick={onCancel}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onCancel()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-dialog-label"
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg"
        ref={panelRef}
      >
        <h2
          id="confirmation-dialog-label"
          className="mb-4 text-lg font-semibold"
        >
          Confirmation
        </h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            tabIndex={0} // Move tabIndex here
            className={`
              rounded bg-gray-200 px-4 py-2 transition
              hover:bg-gray-300
            `}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`
              rounded bg-green-600 px-4 py-2 text-white transition
              hover:bg-green-700
            `}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationDialog
