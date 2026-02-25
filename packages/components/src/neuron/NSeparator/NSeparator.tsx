import { Separator } from '../../ui/separator'
import { cn } from '../../lib/utils'
import type { NSeparatorProps } from './NSeparator.types'

function NSeparator({ orientation = 'horizontal', className }: NSeparatorProps) {
  return (
    <Separator
      orientation={orientation}
      data-neuron-component="NSeparator"
      className={cn('bg-gray-08', className)}
    />
  )
}

export { NSeparator }
