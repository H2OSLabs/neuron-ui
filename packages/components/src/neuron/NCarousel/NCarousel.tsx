import { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import type { NCarouselProps } from './NCarousel.types'

const NCarousel = forwardRef<HTMLDivElement, NCarouselProps>(
  ({ items = [], className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-neuron-component="NCarousel"
        className={cn(
          'flex gap-4 overflow-x-auto scroll-smooth rounded-lg border bg-background p-4',
          className,
        )}
        {...props}
      >
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={index}
              className="flex h-32 min-w-[200px] shrink-0 items-center justify-center rounded-md border bg-muted text-sm"
            >
              {item}
            </div>
          ))
        ) : (
          <div className="flex h-32 w-full items-center justify-center text-sm text-muted-foreground">
            No items
          </div>
        )}
      </div>
    )
  },
)
NCarousel.displayName = 'NCarousel'

export { NCarousel }
