export interface NResizableProps {
  /** Resize direction */
  direction?: 'horizontal' | 'vertical'
  /** Additional CSS class names */
  className?: string
  /** Resizable content */
  children?: React.ReactNode
}
