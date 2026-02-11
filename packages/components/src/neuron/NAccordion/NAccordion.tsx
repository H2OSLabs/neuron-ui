import { forwardRef } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../ui/accordion'
import { cn } from '../../lib/utils'
import type { NAccordionProps } from './NAccordion.types'

const NAccordion = forwardRef<HTMLDivElement, NAccordionProps>(
  ({ items, className, ...props }, ref) => {
    return (
      <Accordion
        ref={ref}
        type="single"
        collapsible
        data-neuron-component="NAccordion"
        className={cn('w-full', className)}
        {...props}
      >
        {items.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger>{item.title}</AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    )
  },
)
NAccordion.displayName = 'NAccordion'

export { NAccordion }
