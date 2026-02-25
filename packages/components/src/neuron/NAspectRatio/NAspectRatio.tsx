import { forwardRef } from 'react'
import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio'
import { cn } from '../../lib/utils'
import type { NAspectRatioProps } from './NAspectRatio.types'

const NAspectRatio = forwardRef<HTMLDivElement, NAspectRatioProps>(
  ({ ratio = 16 / 9, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-neuron-component="NAspectRatio"
        className={cn('overflow-hidden rounded-xl', className)}
        {...props}
      >
        <AspectRatioPrimitive.Root ratio={ratio}>
          {children}
        </AspectRatioPrimitive.Root>
      </div>
    )
  },
)
NAspectRatio.displayName = 'NAspectRatio'

export { NAspectRatio }
