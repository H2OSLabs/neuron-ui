import { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import type { NAlertProps, NAlertVariant } from './NAlert.types'

const variantStyles: Record<NAlertVariant, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-900 [&>svg]:text-blue-600',
  warning:
    'border-yellow-200 bg-yellow-50 text-yellow-900 [&>svg]:text-yellow-600',
  error: 'border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-600',
  success:
    'border-green-200 bg-green-50 text-green-900 [&>svg]:text-green-600',
}

const variantIcons: Record<NAlertVariant, string> = {
  info: 'M12 16v-4m0-4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  warning: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z',
  error: 'M12 8v4m0 4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  success: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Zm-6-3-5.5 5.5L8 12',
}

const NAlert = forwardRef<HTMLDivElement, NAlertProps>(
  ({ title, description, variant = 'info', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        data-neuron-component="NAlert"
        data-neuron-variant={variant}
        className={cn(
          'relative flex gap-3 rounded-lg border p-4',
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 shrink-0"
        >
          <path d={variantIcons[variant]} />
        </svg>
        <div className="space-y-1">
          {title && <p className="text-sm font-medium leading-none">{title}</p>}
          <p className="text-sm opacity-90">{description}</p>
        </div>
      </div>
    )
  },
)
NAlert.displayName = 'NAlert'

export { NAlert }
