export interface NTextareaProps {
  /** Placeholder text */
  placeholder?: string
  /** Textarea value */
  value?: string
  /** Default value */
  defaultValue?: string
  /** Number of visible text rows */
  rows?: number
  /** Whether the textarea is disabled */
  disabled?: boolean
  /** Whether the textarea has an invalid state */
  invalid?: boolean
  /** onChange handler */
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  /** Additional CSS class names */
  className?: string
}
