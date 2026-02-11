export interface NDialogProps {
  /** Dialog title text */
  title: string
  /** Dialog description text */
  description?: string
  /** Whether the dialog is open (controlled mode) */
  open?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Additional CSS class names */
  className?: string
  /** Dialog body content */
  children?: React.ReactNode
  /** Trigger element that opens the dialog */
  trigger?: React.ReactNode
  /** Footer content */
  footer?: React.ReactNode
}
