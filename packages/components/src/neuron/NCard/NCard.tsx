import { forwardRef } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../ui/card'
import { cn } from '../../lib/utils'
import type { NCardProps } from './NCard.types'

const NCard = forwardRef<HTMLDivElement, NCardProps>(
  (
    {
      title,
      description,
      variant = 'default',
      className,
      children,
      footer,
      ...props
    },
    ref,
  ) => {
    return (
      <Card
        ref={ref}
        data-neuron-component="NCard"
        data-neuron-variant={variant}
        className={cn(
          variant === 'cover-left' && 'flex flex-row overflow-hidden',
          variant === 'cover-top' && 'overflow-hidden',
          variant === 'profile' && 'text-center',
          variant === 'notification' && 'border-l-4 border-l-primary',
          className,
        )}
        {...props}
      >
        {(title || description) && (
          <CardHeader className={cn(variant === 'profile' && 'items-center')}>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        {children && <CardContent>{children}</CardContent>}
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    )
  },
)
NCard.displayName = 'NCard'

export { NCard }
