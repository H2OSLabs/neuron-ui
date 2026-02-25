export interface NSwitchProps {
  /** Label text displayed next to the switch */
  label?: string
  /** Whether the switch is checked */
  checked?: boolean
  /** Whether the switch is disabled */
  disabled?: boolean
  /** Callback when checked state changes */
  onCheckedChange?: (checked: boolean) => void
  /** Additional CSS class names */
  className?: string
}
