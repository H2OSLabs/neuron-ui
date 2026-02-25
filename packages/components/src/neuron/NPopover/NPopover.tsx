import { forwardRef } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover'
import { Button } from '../../ui/button'
import { cn } from '../../lib/utils'
import type { NPopoverProps } from './NPopover.types'

const NPopover = forwardRef<HTMLDivElement, NPopoverProps>(
  (
    {
      triggerLabel = 'Open',
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        data-neuron-component="NPopover"
        className={cn('inline-flex', className)}
        {...props}
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">{triggerLabel}</Button>
          </PopoverTrigger>
          <PopoverContent>
            {children}
          </PopoverContent>
        </Popover>
      </div>
    )
  },
)
NPopover.displayName = 'NPopover'

export { NPopover }
