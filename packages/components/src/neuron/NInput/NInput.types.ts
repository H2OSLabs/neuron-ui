export type NInputSize = 'sm' | 'md' | 'lg'

export interface NInputProps {
  /** Input placeholder text */
  placeholder?: string
  /** Input value */
  value?: string
  /** Default value */
  defaultValue?: string
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  /** Input size: sm(24px), md(32px), lg(36px) */
  size?: NInputSize
  /** Whether the input is disabled */
  disabled?: boolean
  /** Whether the input has an invalid state */
  invalid?: boolean
  /** Error message to display */
  errorMessage?: string
  /** onChange binding key for Page Schema */
  onChange?: string
  /** Additional CSS class names */
  className?: string
}
