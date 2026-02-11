import { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import type { NSidebarProps } from './NSidebar.types'

const NSidebar = forwardRef<HTMLElement, NSidebarProps>(
  (
    {
      collapsed = false,
      width = '256px',
      collapsedWidth = '64px',
      onCollapsedChange,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <aside
        ref={ref}
        data-neuron-component="NSidebar"
        data-neuron-collapsed={collapsed}
        className={cn(
          'flex h-full flex-col border-r bg-background transition-[width] duration-200 ease-in-out',
          className,
        )}
        style={{ width: collapsed ? collapsedWidth : width }}
        {...props}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
        <div className="border-t p-2">
          <button
            type="button"
            onClick={() => onCollapsedChange?.(!collapsed)}
            className="flex w-full items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                'transition-transform duration-200',
                collapsed && 'rotate-180',
              )}
            >
              <path d="m11 17-5-5 5-5" />
              <path d="m18 17-5-5 5-5" />
            </svg>
          </button>
        </div>
      </aside>
    )
  },
)
NSidebar.displayName = 'NSidebar'

export { NSidebar }
