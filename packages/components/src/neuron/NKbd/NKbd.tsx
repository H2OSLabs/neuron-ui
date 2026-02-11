import { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import type { NKbdProps } from './NKbd.types'

const NKbd = forwardRef<HTMLElement, NKbdProps>(
  (
    {
      keys,
      className,
      ...props
    },
    ref,
  ) => {
    const keyArray = Array.isArray(keys) ? keys : [keys]

    return (
      <kbd
        ref={ref}
        data-neuron-component="NKbd"
        className={cn(
          'inline-flex items-center gap-1 font-mono text-xs',
          className,
        )}
        {...props}
      >
        {keyArray.map((key, index) => (
          <span key={index}>
            {index > 0 && (
              <span className="mx-0.5 text-muted-foreground">+</span>
            )}
            <span className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground shadow-sm">
              {key}
            </span>
          </span>
        ))}
      </kbd>
    )
  },
)
NKbd.displayName = 'NKbd'

export { NKbd }
