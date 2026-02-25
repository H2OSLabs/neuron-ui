import { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import type { NCalendarProps } from './NCalendar.types'

const NCalendar = forwardRef<HTMLDivElement, NCalendarProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-neuron-component="NCalendar"
        className={cn(
          'rounded-lg border bg-background p-4 text-sm',
          className,
        )}
        {...props}
      >
        <div className="text-center font-medium text-muted-foreground">
          Calendar placeholder
        </div>
      </div>
    )
  },
)
NCalendar.displayName = 'NCalendar'

export { NCalendar }
