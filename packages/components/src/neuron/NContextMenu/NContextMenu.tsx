import { forwardRef } from 'react'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from '../../ui/context-menu'
import { cn } from '../../lib/utils'
import type { NContextMenuProps } from './NContextMenu.types'

const NContextMenu = forwardRef<HTMLDivElement, NContextMenuProps>(
  ({ items, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-neuron-component="NContextMenu"
        className={cn(className)}
        {...props}
      >
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="cursor-context-menu">
              {children || (
                <div className="flex h-32 w-full items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                  Right-click here
                </div>
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            {items.map((item, index) => (
              <ContextMenuItem key={index}>{item.label}</ContextMenuItem>
            ))}
          </ContextMenuContent>
        </ContextMenu>
      </div>
    )
  },
)
NContextMenu.displayName = 'NContextMenu'

export { NContextMenu }
