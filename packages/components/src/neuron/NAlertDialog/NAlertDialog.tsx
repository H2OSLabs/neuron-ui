import { forwardRef } from 'react'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '../../ui/alert-dialog'
import { cn } from '../../lib/utils'
import type { NAlertDialogProps } from './NAlertDialog.types'

const NAlertDialog = forwardRef<HTMLDivElement, NAlertDialogProps>(
  (
    {
      title,
      description,
      confirmLabel = 'Continue',
      cancelLabel = 'Cancel',
      open,
      onOpenChange,
      onConfirm,
      onCancel,
      destructive = false,
      className,
      trigger,
      ...props
    },
    ref,
  ) => {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
        <AlertDialogContent
          ref={ref}
          data-neuron-component="NAlertDialog"
          className={cn(className)}
          {...props}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancel}>
              {cancelLabel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirm}
              className={cn(
                destructive &&
                  'bg-destructive text-destructive-foreground hover:bg-destructive/90',
              )}
            >
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  },
)
NAlertDialog.displayName = 'NAlertDialog'

export { NAlertDialog }
