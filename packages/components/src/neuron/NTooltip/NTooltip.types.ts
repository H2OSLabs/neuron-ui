export interface NTooltipProps {
  /** Tooltip content text */
  content: string
  /** Side to display the tooltip */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Additional CSS class names */
  className?: string
  /** Trigger element */
  children?: React.ReactNode
}
