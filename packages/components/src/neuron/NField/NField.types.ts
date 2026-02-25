import type { ReactNode } from 'react'

export interface NFieldProps {
  /** Field label text */
  label: string
  /** Whether the field is required */
  required?: boolean
  /** Error message to display */
  error?: string
  /** Child input element(s) */
  children?: ReactNode
  /** Additional CSS class names */
  className?: string
}
