import { forwardRef } from 'react'
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '../../ui/hover-card'
import { cn } from '../../lib/utils'
import type { NHoverCardProps } from './NHoverCard.types'

const NHoverCard = forwardRef<HTMLDivElement, NHoverCardProps>(
  ({ triggerText, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-neuron-component="NHoverCard"
        className={cn(className)}
        {...props}
      >
        <HoverCard>
          <HoverCardTrigger asChild>
            <span className="cursor-pointer text-sm font-medium underline decoration-dotted underline-offset-4">
              {triggerText}
            </span>
          </HoverCardTrigger>
          <HoverCardContent>
            {children || (
              <p className="text-sm text-muted-foreground">
                Hover card content
              </p>
            )}
          </HoverCardContent>
        </HoverCard>
      </div>
    )
  },
)
NHoverCard.displayName = 'NHoverCard'

export { NHoverCard }
