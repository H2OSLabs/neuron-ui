export interface NSliderProps {
  /** Current value */
  value?: number
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
  /** Step increment */
  step?: number
  /** Whether the slider is disabled */
  disabled?: boolean
  /** Callback when value changes */
  onValueChange?: (value: number[]) => void
  /** Additional CSS class names */
  className?: string
}
