import { forwardRef } from 'react'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../../ui/sheet'
import { cn } from '../../lib/utils'
import type { NSheetProps } from './NSheet.types'

const NSheet = forwardRef<HTMLDivElement, NSheetProps>(
  (
    {
      title,
      description,
      side = 'right',
      open,
      onOpenChange,
      className,
      children,
      trigger,
      ...props
    },
    ref,
  ) => {
    const isSideSheet = side === 'left' || side === 'right'

    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
        <SheetContent
          ref={ref}
          side={side}
          data-neuron-component="NSheet"
          data-neuron-side={side}
          className={cn(isSideSheet && 'w-[396px] sm:max-w-[396px]', className)}
          {...props}
        >
          {(title || description) && (
            <SheetHeader>
              {title && <SheetTitle>{title}</SheetTitle>}
              {description && (
                <SheetDescription>{description}</SheetDescription>
              )}
            </SheetHeader>
          )}
          {children}
        </SheetContent>
      </Sheet>
    )
  },
)
NSheet.displayName = 'NSheet'

export { NSheet }
