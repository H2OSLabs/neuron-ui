export interface NToggleProps {
  /** Whether the toggle is pressed */
  pressed?: boolean
  /** Whether the toggle is disabled */
  disabled?: boolean
  /** Additional CSS class names */
  className?: string
  /** Toggle content */
  children?: React.ReactNode
}
