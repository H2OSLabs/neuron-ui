export interface NSelectOption {
  value: string
  label: string
}

export interface NSelectProps {
  /** List of selectable options */
  options: NSelectOption[]
  /** Placeholder text when no value is selected */
  placeholder?: string
  /** Currently selected value */
  value?: string
  /** Callback when value changes */
  onValueChange?: (value: string) => void
  /** Additional CSS class names */
  className?: string
}
