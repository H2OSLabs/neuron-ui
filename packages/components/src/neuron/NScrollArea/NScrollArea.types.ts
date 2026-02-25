export type NScrollAreaOrientation = 'horizontal' | 'vertical' | 'both'

export interface NScrollAreaProps {
  /** Scroll direction */
  orientation?: NScrollAreaOrientation
  /** Maximum height constraint (CSS value, e.g. '300px') */
  maxHeight?: string
  /** Maximum width constraint (CSS value, e.g. '400px') */
  maxWidth?: string
  /** Additional CSS class names */
  className?: string
  /** Scrollable content */
  children?: React.ReactNode
}
