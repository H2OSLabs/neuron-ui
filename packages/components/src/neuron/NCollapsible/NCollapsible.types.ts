export interface NCollapsibleProps {
  /** Title text shown in the trigger */
  title: string
  /** Whether the collapsible is open by default */
  defaultOpen?: boolean
  /** Controlled open state */
  open?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Additional CSS class names */
  className?: string
  /** Collapsible content */
  children?: React.ReactNode
}
