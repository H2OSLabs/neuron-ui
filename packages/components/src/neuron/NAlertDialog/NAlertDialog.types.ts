export interface NAlertDialogProps {
  /** Alert dialog title text */
  title: string
  /** Alert dialog description text */
  description: string
  /** Label for the confirm/action button */
  confirmLabel?: string
  /** Label for the cancel button */
  cancelLabel?: string
  /** Whether the dialog is open (controlled mode) */
  open?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Callback when confirm is clicked */
  onConfirm?: () => void
  /** Callback when cancel is clicked */
  onCancel?: () => void
  /** Whether the confirm action is destructive */
  destructive?: boolean
  /** Additional CSS class names */
  className?: string
  /** Trigger element that opens the alert dialog */
  trigger?: React.ReactNode
}
