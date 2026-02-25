export interface NToggleGroupItem {
  /** Item value */
  value: string
  /** Item display label */
  label: string
}

export interface NToggleGroupProps {
  /** Toggle group items */
  items: NToggleGroupItem[]
  /** Selection type: single or multiple */
  type?: 'single' | 'multiple'
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Additional CSS class names */
  className?: string
}
