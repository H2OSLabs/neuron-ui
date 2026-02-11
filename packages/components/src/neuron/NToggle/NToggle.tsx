import { forwardRef } from 'react'
import { Toggle } from '../../ui/toggle'
import { cn } from '../../lib/utils'
import type { NToggleProps } from './NToggle.types'

const NToggle = forwardRef<HTMLButtonElement, NToggleProps>(
  (
    {
      pressed,
      disabled = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <Toggle
        ref={ref}
        pressed={pressed}
        disabled={disabled}
        data-neuron-component="NToggle"
        className={cn(className)}
        {...props}
      >
        {children}
      </Toggle>
    )
  },
)
NToggle.displayName = 'NToggle'

export { NToggle }
