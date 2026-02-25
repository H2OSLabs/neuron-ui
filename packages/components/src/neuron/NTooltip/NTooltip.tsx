import { forwardRef } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../ui/tooltip'
import { cn } from '../../lib/utils'
import type { NTooltipProps } from './NTooltip.types'

const NTooltip = forwardRef<HTMLDivElement, NTooltipProps>(
  (
    {
      content,
      side = 'top',
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        data-neuron-component="NTooltip"
        className={cn('inline-flex', className)}
        {...props}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>{children}</span>
            </TooltipTrigger>
            <TooltipContent side={side}>
              <p>{content}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  },
)
NTooltip.displayName = 'NTooltip'

export { NTooltip }
