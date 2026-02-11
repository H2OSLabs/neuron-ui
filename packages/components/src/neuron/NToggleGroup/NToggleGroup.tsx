import { forwardRef } from 'react'
import { ToggleGroup, ToggleGroupItem } from '../../ui/toggle-group'
import { cn } from '../../lib/utils'
import type { NToggleGroupProps } from './NToggleGroup.types'

const NToggleGroup = forwardRef<HTMLDivElement, NToggleGroupProps>(
  (
    {
      items,
      type = 'single',
      orientation = 'horizontal',
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <ToggleGroup
        ref={ref}
        type={type}
        orientation={orientation}
        data-neuron-component="NToggleGroup"
        className={cn(
          orientation === 'vertical' && 'flex-col',
          className,
        )}
        {...props}
      >
        {items.map((item) => (
          <ToggleGroupItem key={item.value} value={item.value}>
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    )
  },
)
NToggleGroup.displayName = 'NToggleGroup'

export { NToggleGroup }
