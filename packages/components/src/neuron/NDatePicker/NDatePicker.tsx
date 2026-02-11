import { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import type { NDatePickerProps } from './NDatePicker.types'

const NDatePicker = forwardRef<HTMLInputElement, NDatePickerProps>(
  (
    {
      value,
      placeholder,
      disabled = false,
      onChange,
      className,
    },
    ref,
  ) => {
    return (
      <div data-neuron-component="NDatePicker">
        <input
          ref={ref}
          type="date"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
          className={cn(
            'flex h-8 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
        />
      </div>
    )
  },
)
NDatePicker.displayName = 'NDatePicker'

export { NDatePicker }
