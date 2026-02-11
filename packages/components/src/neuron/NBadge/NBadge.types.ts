export type NBadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'
export type NBadgeSize = 'sm' | 'md'
export type NBadgeColor =
  | 'pink'
  | 'pink-light'
  | 'yellow'
  | 'yellow-bright'
  | 'lime'
  | 'lime-light'
  | 'green'
  | 'blue'
  | 'purple'
  | 'lavender'

export interface NBadgeProps {
  /** Badge text content */
  label: string
  /** Badge variant */
  variant?: NBadgeVariant
  /** Badge size: sm(16px), md(24px) */
  size?: NBadgeSize
  /** Accent color for the badge background */
  color?: NBadgeColor
  /** Additional CSS class names */
  className?: string
}
