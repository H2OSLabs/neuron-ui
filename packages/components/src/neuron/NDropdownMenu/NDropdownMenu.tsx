import { forwardRef } from 'react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../../ui/dropdown-menu'
import { Button } from '../../ui/button'
import { cn } from '../../lib/utils'
import type { NDropdownMenuProps } from './NDropdownMenu.types'

const NDropdownMenu = forwardRef<HTMLDivElement, NDropdownMenuProps>(
  ({ items, triggerLabel = 'Menu', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-neuron-component="NDropdownMenu"
        className={cn(className)}
        {...props}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{triggerLabel}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {items.map((item, index) => (
              <DropdownMenuItem key={index} disabled={item.disabled}>
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  },
)
NDropdownMenu.displayName = 'NDropdownMenu'

export { NDropdownMenu }
