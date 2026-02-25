export interface NCommandItem {
  /** Item display label */
  label: string
  /** Item value */
  value: string
}

export interface NCommandProps {
  /** Search input placeholder */
  placeholder?: string
  /** Command items */
  items?: NCommandItem[]
  /** Additional CSS class names */
  className?: string
}
