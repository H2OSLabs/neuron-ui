import { forwardRef } from 'react'
import { Button } from '../../ui/button'
import { cn } from '../../lib/utils'
import type { NPaginationProps } from './NPagination.types'

const NPagination = forwardRef<HTMLElement, NPaginationProps>(
  ({ currentPage, totalPages, className, ...props }, ref) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    return (
      <nav
        ref={ref}
        role="navigation"
        aria-label="Pagination"
        data-neuron-component="NPagination"
        className={cn('flex items-center gap-1', className)}
        {...props}
      >
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          aria-label="Previous page"
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
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Button>
        {pages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            size="sm"
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          aria-label="Next page"
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
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Button>
      </nav>
    )
  },
)
NPagination.displayName = 'NPagination'

export { NPagination }
