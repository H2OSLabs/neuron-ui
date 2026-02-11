import { forwardRef } from 'react'
import { Progress } from '../../ui/progress'
import { cn } from '../../lib/utils'
import type { NProgressProps } from './NProgress.types'

const NProgress = forwardRef<HTMLDivElement, NProgressProps>(
  ({ value, max = 100, className, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))

    return (
      <Progress
        ref={ref}
        value={percentage}
        data-neuron-component="NProgress"
        className={cn(className)}
        {...props}
      />
    )
  },
)
NProgress.displayName = 'NProgress'

export { NProgress }
