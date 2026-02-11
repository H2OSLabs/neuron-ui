export type NAlertVariant = 'info' | 'warning' | 'error' | 'success'

export interface NAlertProps {
  /** Alert title */
  title?: string
  /** Alert description (required) */
  description: string
  /** Alert variant */
  variant?: NAlertVariant
  /** Additional CSS class names */
  className?: string
}
