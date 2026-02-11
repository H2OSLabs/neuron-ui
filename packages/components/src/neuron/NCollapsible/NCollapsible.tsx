import { forwardRef } from 'react'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '../../ui/collapsible'
import { cn } from '../../lib/utils'
import type { NCollapsibleProps } from './NCollapsible.types'

const NCollapsible = forwardRef<HTMLDivElement, NCollapsibleProps>(
  (
    {
      title,
      defaultOpen = false,
      open,
      onOpenChange,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <Collapsible
        ref={ref}
        defaultOpen={defaultOpen}
        open={open}
        onOpenChange={onOpenChange}
        data-neuron-component="NCollapsible"
        className={cn('space-y-2', className)}
        {...props}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {title}
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
              className="transition-transform duration-200 [[data-state=open]_&]:rotate-180"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2">
          {children}
        </CollapsibleContent>
      </Collapsible>
    )
  },
)
NCollapsible.displayName = 'NCollapsible'

export { NCollapsible }
