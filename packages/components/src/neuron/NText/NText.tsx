import { cn } from '../../lib/utils'
import type { NTextProps, NTextSize, NTextWeight, NTextColor } from './NText.types'

const sizeClasses: Record<NTextSize, string> = {
  display: 'text-[48px] leading-[1.2]',
  heading: 'text-[36px] leading-[1.3]',
  subheading: 'text-[28px] leading-[1.3]',
  section: 'text-[24px] leading-[1.4]',
  'body-lg': 'text-[18px] leading-[1.6]',
  body: 'text-[14px] leading-[1.6]',
  caption: 'text-[12px] leading-[1.5]',
}

const weightClasses: Record<NTextWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

const colorClasses: Record<NTextColor, string> = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  accent: 'text-gray-03',
  error: 'text-error',
  success: 'text-success',
  warning: 'text-warning',
}

function NText({
  text,
  size = 'body',
  weight = 'normal',
  as: Component = 'p',
  color = 'default',
  truncate = false,
  maxLines,
  children,
  className,
}: NTextProps) {
  return (
    <Component
      data-neuron-component="NText"
      data-neuron-size={size}
      className={cn(
        sizeClasses[size],
        weightClasses[weight],
        colorClasses[color],
        truncate && 'truncate',
        maxLines && `line-clamp-${maxLines}`,
        className,
      )}
    >
      {children || text}
    </Component>
  )
}

export { NText }
