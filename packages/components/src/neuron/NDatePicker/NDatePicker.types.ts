export interface NDatePickerProps {
  /** Date value in ISO format (YYYY-MM-DD) */
  value?: string
  /** Placeholder text */
  placeholder?: string
  /** Whether the date picker is disabled */
  disabled?: boolean
  /** Callback when value changes */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  /** Additional CSS class names */
  className?: string
}
