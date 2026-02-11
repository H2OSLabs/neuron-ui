export type NTextSize = 'display' | 'heading' | 'subheading' | 'section' | 'body-lg' | 'body' | 'caption'
export type NTextWeight = 'normal' | 'medium' | 'semibold' | 'bold'
export type NTextAs = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
export type NTextColor = 'default' | 'muted' | 'accent' | 'error' | 'success' | 'warning'

export interface NTextProps {
  /** Text content */
  text?: string
  /** Text size (maps to font-size token) */
  size?: NTextSize
  /** Font weight */
  weight?: NTextWeight
  /** HTML element to render as */
  as?: NTextAs
  /** Text color preset */
  color?: NTextColor
  /** Enable text truncation */
  truncate?: boolean
  /** Max number of lines (multi-line truncation) */
  maxLines?: number
  /** Children content (overrides text prop) */
  children?: React.ReactNode
  /** Additional CSS class names */
  className?: string
}
