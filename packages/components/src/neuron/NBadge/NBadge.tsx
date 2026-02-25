import { Badge } from '../../ui/badge'
import { cn } from '../../lib/utils'
import type { NBadgeProps, NBadgeColor } from './NBadge.types'

const colorClasses: Record<NBadgeColor, string> = {
  pink: 'bg-accent-pink text-gray-01 border-transparent',
  'pink-light': 'bg-accent-pink-light text-gray-01 border-transparent',
  yellow: 'bg-accent-yellow text-gray-01 border-transparent',
  'yellow-bright': 'bg-accent-yellow-bright text-gray-01 border-transparent',
  lime: 'bg-accent-lime text-gray-01 border-transparent',
  'lime-light': 'bg-accent-lime-light text-gray-01 border-transparent',
  green: 'bg-accent-green text-gray-01 border-transparent',
  blue: 'bg-accent-blue text-gray-01 border-transparent',
  purple: 'bg-accent-purple text-gray-01 border-transparent',
  lavender: 'bg-accent-lavender text-gray-01 border-transparent',
}

function NBadge({ label, variant = 'default', size = 'md', color, className }: NBadgeProps) {
  return (
    <Badge
      variant={color ? undefined : variant}
      data-neuron-component="NBadge"
      data-neuron-variant={variant}
      data-neuron-size={size}
      className={cn(
        size === 'sm' && 'h-4 px-1.5 text-[10px]',
        size === 'md' && 'h-6 px-2.5 text-xs',
        color && colorClasses[color],
        className,
      )}
    >
      {label}
    </Badge>
  )
}

export { NBadge }
