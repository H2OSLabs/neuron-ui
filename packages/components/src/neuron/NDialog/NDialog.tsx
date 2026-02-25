import { forwardRef } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog'
import { cn } from '../../lib/utils'
import type { NDialogProps } from './NDialog.types'

const NDialog = forwardRef<HTMLDivElement, NDialogProps>(
  (
    {
      title,
      description,
      open,
      onOpenChange,
      className,
      children,
      trigger,
      footer,
      ...props
    },
    ref,
  ) => {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent
          ref={ref}
          data-neuron-component="NDialog"
          className={cn('p-5', className)}
          {...props}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {children}
          {footer && <DialogFooter>{footer}</DialogFooter>}
        </DialogContent>
      </Dialog>
    )
  },
)
NDialog.displayName = 'NDialog'

export { NDialog }
