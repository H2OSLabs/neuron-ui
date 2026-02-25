export interface NInputOTPProps {
  /** Number of OTP digits */
  length?: number
  /** Callback when OTP value changes */
  onComplete?: (value: string) => void
  /** Additional CSS class names */
  className?: string
}
