export type NCardVariant = 'default' | 'cover-left' | 'cover-top' | 'profile' | 'notification'

export interface NCardProps {
  /** Card title text */
  title?: string
  /** Card description text */
  description?: string
  /** Card layout variant */
  variant?: NCardVariant
  /** Additional CSS class names */
  className?: string
  /** Children content rendered in CardContent */
  children?: React.ReactNode
  /** Footer content */
  footer?: React.ReactNode
}
