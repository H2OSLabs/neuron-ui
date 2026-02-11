export interface NRadioGroupOption {
  value: string
  label: string
  disabled?: boolean
}

export interface NRadioGroupProps {
  /** List of radio options */
  options: NRadioGroupOption[]
  /** Currently selected value */
  value?: string
  /** Callback when value changes */
  onValueChange?: (value: string) => void
  /** Additional CSS class names */
  className?: string
}
