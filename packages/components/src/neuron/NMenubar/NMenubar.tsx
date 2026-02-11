import { forwardRef } from 'react'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '../../ui/menubar'
import { cn } from '../../lib/utils'
import type { NMenubarProps } from './NMenubar.types'

const NMenubar = forwardRef<HTMLDivElement, NMenubarProps>(
  (
    {
      menus,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <Menubar
        ref={ref}
        data-neuron-component="NMenubar"
        className={cn(className)}
        {...props}
      >
        {menus.map((menu) => (
          <MenubarMenu key={menu.label}>
            <MenubarTrigger>{menu.label}</MenubarTrigger>
            <MenubarContent>
              {menu.items.map((item) => (
                <MenubarItem key={item.label}>{item.label}</MenubarItem>
              ))}
            </MenubarContent>
          </MenubarMenu>
        ))}
      </Menubar>
    )
  },
)
NMenubar.displayName = 'NMenubar'

export { NMenubar }
