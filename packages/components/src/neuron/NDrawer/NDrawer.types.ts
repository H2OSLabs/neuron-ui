export interface NDrawerProps {
  /** Drawer title text */
  title?: string
  /** Whether the drawer is open (controlled mode) */
  open?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Additional CSS class names */
  className?: string
  /** Drawer body content */
  children?: React.ReactNode
  /** Trigger element that opens the drawer */
  trigger?: React.ReactNode
}
