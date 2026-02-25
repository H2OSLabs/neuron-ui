import { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import type { NToastProps } from './NToast.types'

const variantStyles: Record<string, string> = {
  default: 'border-border bg-background text-foreground',
  success: 'border-green-500/50 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100',
  error: 'border-red-500/50 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100',
  warning: 'border-yellow-500/50 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100',
}

const NToast = forwardRef<HTMLDivElement, NToastProps>(
  (
    {
      title,
      description,
      variant = 'default',
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        role="status"
        data-neuron-component="NToast"
        data-neuron-variant={variant}
        className={cn(
          'rounded-md border px-4 py-3 shadow-sm',
          variantStyles[variant] || variantStyles.default,
          className,
        )}
        {...props}
      >
        <p className="text-sm font-semibold">{title}</p>
        {description && (
          <p className="mt-1 text-sm opacity-80">{description}</p>
        )}
      </div>
    )
  },
)
NToast.displayName = 'NToast'

export { NToast }
