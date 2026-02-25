export interface NCheckboxProps {
  /** Label text displayed next to the checkbox */
  label?: string
  /** Whether the checkbox is checked */
  checked?: boolean
  /** Whether the checkbox is disabled */
  disabled?: boolean
  /** Callback when checked state changes */
  onCheckedChange?: (checked: boolean) => void
  /** Additional CSS class names */
  className?: string
}
