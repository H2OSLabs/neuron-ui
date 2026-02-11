import { forwardRef } from 'react'
import { Button } from '../../ui/button'
import { cn } from '../../lib/utils'
import type { NEmptyProps } from './NEmpty.types'

const NEmpty = forwardRef<HTMLDivElement, NEmptyProps>(
  (
    {
      title = 'No data',
      description,
      actionLabel,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        data-neuron-component="NEmpty"
        className={cn(
          'flex flex-col items-center justify-center gap-3 py-12 text-center',
          className,
        )}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground/50"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground/70">{description}</p>
          )}
        </div>
        {actionLabel && (
          <Button
            variant="outline"
            size="sm"
            style={{ width: 136, height: 32 }}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    )
  },
)
NEmpty.displayName = 'NEmpty'

export { NEmpty }
