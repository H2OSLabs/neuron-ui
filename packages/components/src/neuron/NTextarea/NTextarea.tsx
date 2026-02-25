import { forwardRef } from 'react'
import { Textarea } from '../../ui/textarea'
import { cn } from '../../lib/utils'
import type { NTextareaProps } from './NTextarea.types'

const NTextarea = forwardRef<HTMLTextAreaElement, NTextareaProps>(
  (
    {
      placeholder,
      value,
      defaultValue,
      rows = 3,
      disabled = false,
      invalid = false,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div data-neuron-component="NTextarea">
        <Textarea
          ref={ref}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          rows={rows}
          disabled={disabled}
          aria-invalid={invalid}
          className={cn(
            invalid && 'border-error focus-visible:ring-error',
            className,
          )}
          {...props}
        />
      </div>
    )
  },
)
NTextarea.displayName = 'NTextarea'

export { NTextarea }
