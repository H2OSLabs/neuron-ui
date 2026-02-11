import { cn } from '../../lib/utils'
import type { NSpinnerProps, NSpinnerSize } from './NSpinner.types'

const sizeClasses: Record<NSpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
}

function NSpinner({ size = 'md', className }: NSpinnerProps) {
  return (
    <div
      role="status"
      data-neuron-component="NSpinner"
      data-neuron-size={size}
      className={cn(
        'inline-block animate-spin rounded-full border-solid border-gray-08 border-t-gray-01',
        sizeClasses[size],
        className,
      )}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export { NSpinner }
