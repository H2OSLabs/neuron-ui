export interface NAccordionItem {
  /** Unique item identifier */
  id: string
  /** Item title */
  title: string
  /** Item content */
  content: string
}

export interface NAccordionProps {
  /** Accordion items */
  items: NAccordionItem[]
  /** Additional CSS class names */
  className?: string
}
