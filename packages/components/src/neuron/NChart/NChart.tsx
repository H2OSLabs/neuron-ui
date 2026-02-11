import { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import type { NChartProps } from './NChart.types'

const NChart = forwardRef<HTMLDivElement, NChartProps>(
  ({ type = 'bar', data = [], className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-neuron-component="NChart"
        data-neuron-variant={type}
        className={cn(
          'flex h-64 w-full items-center justify-center rounded-lg border bg-background p-4',
          className,
        )}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3v18h18" />
            <path d="M7 16l4-8 4 4 4-6" />
          </svg>
          <span className="text-sm">
            {type.charAt(0).toUpperCase() + type.slice(1)} chart
            {data.length > 0 ? ` (${data.length} points)` : ''}
          </span>
          <span className="text-xs">Recharts integration coming soon</span>
        </div>
      </div>
    )
  },
)
NChart.displayName = 'NChart'

export { NChart }
