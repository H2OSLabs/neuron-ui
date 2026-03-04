import { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import type { NResizableProps } from './NResizable.types'

const directionStyles: Record<string, string> = {
  horizontal: 'flex flex-row items-center gap-4',
  vertical: 'flex flex-col gap-4',
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
