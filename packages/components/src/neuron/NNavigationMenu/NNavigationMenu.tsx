import { forwardRef } from 'react'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '../../ui/navigation-menu'
import { cn } from '../../lib/utils'
import type { NNavigationMenuProps } from './NNavigationMenu.types'

const NNavigationMenu = forwardRef<HTMLElement, NNavigationMenuProps>(
  (
    {
      items,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <NavigationMenu
        ref={ref}
        data-neuron-component="NNavigationMenu"
        className={cn(className)}
        {...props}
      >
        <NavigationMenuList>
          {items.map((item) => (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuLink
                href={item.href || '#'}
                className={navigationMenuTriggerStyle()}
              >
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    )
  },
)
NNavigationMenu.displayName = 'NNavigationMenu'

export { NNavigationMenu }
