import { forwardRef } from 'react'
import { Button, type ButtonProps } from '../../ui/button'
import { cn } from '../../lib/utils'
import type { NButtonProps } from './NButton.types'

const sizeMap: Record<string, ButtonProps['size']> = {
  xs: 'sm',
  sm: 'sm',
  md: 'default',
  lg: 'lg',
  xl: 'xl',
  icon: 'icon',
}

const NButton = forwardRef<HTMLButtonElement, NButtonProps>(
  (
    {
      label,
      variant = 'default',
      size = 'md',
      disabled = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={sizeMap[size] || 'default'}
        disabled={disabled}
        data-neuron-component="NButton"
        data-neuron-variant={variant}
        data-neuron-size={size}
        className={cn(className)}
        {...props}
      >
        {children || label}
      </Button>
    )
  },
)
NButton.displayName = 'NButton'

export { NButton }
