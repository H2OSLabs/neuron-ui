export interface NToastProps {
  /** Toast title text */
  title: string
  /** Optional description text */
  description?: string
  /** Toast variant */
  variant?: 'default' | 'success' | 'error' | 'warning'
  /** Additional CSS class names */
  className?: string
}
