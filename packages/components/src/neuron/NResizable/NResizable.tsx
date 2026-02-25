import { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import type { NResizableProps } from './NResizable.types'

const directionStyles: Record<string, string> = {
  horizontal: 'resize-x',
  vertical: 'resize-y',
}

const NResizable = forwardRef<HTMLDivElement, NResizableProps>(
  (
    {
      direction = 'horizontal',
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        data-neuron-component="NResizable"
        data-neuron-direction={direction}
        className={cn(
          'overflow-auto rounded-md border',
          directionStyles[direction] || directionStyles.horizontal,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)
NResizable.displayName = 'NResizable'

export { NResizable }
