export interface NBreadcrumbItem {
  /** Display label for the breadcrumb segment */
  label: string
  /** Optional link href; last item typically has no href */
  href?: string
}

export interface NBreadcrumbProps {
  /** Array of breadcrumb items in order */
  items: NBreadcrumbItem[]
  /** Separator character between items */
  separator?: string
  /** Additional CSS class names */
  className?: string
}
