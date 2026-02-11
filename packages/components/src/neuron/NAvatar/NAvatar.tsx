import { Avatar, AvatarImage, AvatarFallback } from '../../ui/avatar'
import { cn } from '../../lib/utils'
import type { NAvatarProps, NAvatarSize, NAvatarStatus } from './NAvatar.types'

const sizeClasses: Record<NAvatarSize, string> = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
}

const statusColors: Record<NAvatarStatus, string> = {
  online: 'bg-success',
  offline: 'bg-gray-07',
  busy: 'bg-error',
  away: 'bg-warning',
}

function NAvatar({
  src,
  alt = '',
  fallback,
  size = 'md',
  shape = 'circle',
  status,
  className,
}: NAvatarProps) {
  return (
    <div className="relative inline-flex" data-neuron-component="NAvatar" data-neuron-size={size}>
      <Avatar
        className={cn(
          sizeClasses[size],
          shape === 'square' && 'rounded-lg',
          className,
        )}
      >
        {src && <AvatarImage src={src} alt={alt} />}
        <AvatarFallback className={shape === 'square' ? 'rounded-lg' : undefined}>
          {fallback || alt?.charAt(0)?.toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full border-2 border-background',
            statusColors[status],
            size === 'sm' && 'h-2 w-2',
            size === 'md' && 'h-3 w-3',
            size === 'lg' && 'h-4 w-4',
          )}
        />
      )}
    </div>
  )
}

export { NAvatar }
