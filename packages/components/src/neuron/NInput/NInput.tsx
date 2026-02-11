import { forwardRef } from 'react'
import { Input } from '../../ui/input'
import { cn } from '../../lib/utils'
import type { NInputProps, NInputSize } from './NInput.types'

const sizeClasses: Record<NInputSize, string> = {
  sm: 'h-6 text-xs px-2',
  md: 'h-8 text-sm px-3',
  lg: 'h-9 text-sm px-4',
}

const NInput = forwardRef<HTMLInputElement, NInputProps>(
  (
    {
      placeholder,
      value,
      defaultValue,
      type = 'text',
      size = 'md',
      disabled = false,
      invalid = false,
      errorMessage,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div data-neuron-component="NInput" data-neuron-size={size}>
        <Input
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          aria-invalid={invalid}
          className={cn(
            sizeClasses[size],
            invalid && 'border-error focus-visible:ring-error',
            className,
          )}
          {...props}
        />
        {invalid && errorMessage && (
          <p className="mt-1 text-xs text-error">{errorMessage}</p>
        )}
      </div>
    )
  },
)
NInput.displayName = 'NInput'

export { NInput }
