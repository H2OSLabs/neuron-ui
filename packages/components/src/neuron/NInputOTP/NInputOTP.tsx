import { useState, useRef, useCallback } from 'react'
import { cn } from '../../lib/utils'
import type { NInputOTPProps } from './NInputOTP.types'

function NInputOTP({ length = 6, onComplete, className }: NInputOTPProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = useCallback(
    (index: number, char: string) => {
      if (char.length > 1) return

      const newValues = [...values]
      newValues[index] = char
      setValues(newValues)

      if (char && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }

      const combined = newValues.join('')
      if (combined.length === length && !newValues.includes('')) {
        onComplete?.(combined)
      }
    },
    [values, length, onComplete],
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !values[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    },
    [values],
  )

  return (
    <div
      data-neuron-component="NInputOTP"
      className={cn('flex items-center gap-2', className)}
    >
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={values[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background text-center text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  )
}

export { NInputOTP }
