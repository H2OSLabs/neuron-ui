import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import type { NInputGroupProps } from './NInputGroup.types'

function NInputGroup({ label, icon, className, children }: NInputGroupProps) {
  return (
    <div data-neuron-component="NInputGroup" className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium leading-none text-gray-02">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 flex items-center text-muted-foreground">
            {icon}
          </span>
        )}
        <div className={cn('w-full', icon && '[&_input]:pl-9')}>
          {children}
        </div>
      </div>
    </div>
  )
}

export { NInputGroup }
