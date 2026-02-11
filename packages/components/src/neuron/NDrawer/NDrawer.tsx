import { forwardRef } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog'
import { cn } from '../../lib/utils'
import type { NDrawerProps } from './NDrawer.types'

const NDrawer = forwardRef<HTMLDivElement, NDrawerProps>(
  (
    {
      title,
      open,
      onOpenChange,
      className,
      children,
      trigger,
      ...props
    },
    ref,
  ) => {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent
          ref={ref}
          data-neuron-component="NDrawer"
          className={cn(
            'fixed bottom-0 left-0 right-0 top-auto translate-x-0 translate-y-0 rounded-t-xl rounded-b-none max-w-full w-full',
            className,
          )}
          {...props}
        >
          <div className="mx-auto mt-1 mb-4 h-1.5 w-12 rounded-full bg-muted" />
          {title && (
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
          )}
          {children}
        </DialogContent>
      </Dialog>
    )
  },
)
NDrawer.displayName = 'NDrawer'

export { NDrawer }
