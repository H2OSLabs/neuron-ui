import { forwardRef } from 'react'
import { Skeleton } from '../../ui/skeleton'
import { cn } from '../../lib/utils'
import type { NSkeletonProps } from './NSkeleton.types'

const NSkeleton = forwardRef<HTMLDivElement, NSkeletonProps>(
  ({ width, height, rounded = false, className, ...props }, ref) => {
    return (
      <Skeleton
        ref={ref}
        data-neuron-component="NSkeleton"
        className={cn(rounded && 'rounded-full', className)}
        style={{
          width: width || undefined,
          height: height || undefined,
        }}
        {...props}
      />
    )
  },
)
NSkeleton.displayName = 'NSkeleton'

export { NSkeleton }
