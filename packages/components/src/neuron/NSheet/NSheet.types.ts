export type NSheetSide = 'left' | 'right' | 'top' | 'bottom'

export interface NSheetProps {
  /** Sheet title text */
  title?: string
  /** Sheet description text */
  description?: string
  /** Which side the sheet slides in from */
  side?: NSheetSide
  /** Whether the sheet is open (controlled mode) */
  open?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Additional CSS class names */
  className?: string
  /** Sheet body content */
  children?: React.ReactNode
  /** Trigger element that opens the sheet */
  trigger?: React.ReactNode
}
