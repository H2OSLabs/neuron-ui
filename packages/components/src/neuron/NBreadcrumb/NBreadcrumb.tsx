import { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import type { NBreadcrumbProps } from './NBreadcrumb.types'

const NBreadcrumb = forwardRef<HTMLElement, NBreadcrumbProps>(
  ({ items, separator = '/', className, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        data-neuron-component="NBreadcrumb"
        className={cn(className)}
        {...props}
      >
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            return (
              <li key={index} className="flex items-center gap-1.5">
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className="text-muted-foreground/50"
                  >
                    {separator}
                  </span>
                )}
                {item.href && !isLast ? (
                  <a
                    href={item.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span
                    className={cn(isLast && 'font-medium text-foreground')}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  },
)
NBreadcrumb.displayName = 'NBreadcrumb'

export { NBreadcrumb }
