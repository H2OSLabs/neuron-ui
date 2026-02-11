import type { ReactNode } from 'react'

export interface NInputGroupProps {
  /** Label displayed above the input */
  label?: string
  /** Icon name from lucide-react (rendered as leading addon) */
  icon?: string
  /** Additional CSS class names */
  className?: string
  /** Child input element(s) */
  children?: ReactNode
}
