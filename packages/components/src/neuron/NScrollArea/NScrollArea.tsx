import { forwardRef } from 'react'
import { ScrollArea, ScrollBar } from '../../ui/scroll-area'
import { cn } from '../../lib/utils'
import type { NScrollAreaProps } from './NScrollArea.types'

const NScrollArea = forwardRef<HTMLDivElement, NScrollAreaProps>(
  (
    {
      orientation = 'vertical',
      maxHeight,
      maxWidth,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <ScrollArea
        ref={ref}
        data-neuron-component="NScrollArea"
        data-neuron-orientation={orientation}
        className={cn(className)}
        style={{ maxHeight, maxWidth }}
        {...props}
      >
        {children}
        {(orientation === 'horizontal' || orientation === 'both') && (
          <ScrollBar orientation="horizontal" />
        )}
        {orientation === 'both' && <ScrollBar orientation="vertical" />}
      </ScrollArea>
    )
  },
)
NScrollArea.displayName = 'NScrollArea'

export { NScrollArea }
