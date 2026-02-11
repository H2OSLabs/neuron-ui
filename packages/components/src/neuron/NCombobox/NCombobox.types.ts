export interface NComboboxOption {
  value: string
  label: string
}

export interface NComboboxProps {
  /** List of selectable options */
  options: NComboboxOption[]
  /** Placeholder text when no value is selected */
  placeholder?: string
  /** Currently selected value */
  value?: string
  /** Whether multiple selection is enabled */
  multiple?: boolean
  /** Whether the search input is enabled */
  searchable?: boolean
  /** Callback when value changes */
  onValueChange?: (value: string) => void
  /** Additional CSS class names */
  className?: string
}
