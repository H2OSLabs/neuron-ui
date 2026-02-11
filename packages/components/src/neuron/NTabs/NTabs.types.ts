export interface NTabItem {
  /** Unique tab identifier */
  id: string
  /** Tab label displayed in the trigger */
  label: string
}

export interface NTabsProps {
  /** Array of tab definitions */
  tabs: NTabItem[]
  /** Default active tab id */
  defaultValue?: string
  /** Controlled active tab id */
  value?: string
  /** Callback when active tab changes */
  onValueChange?: (value: string) => void
  /** Additional CSS class names */
  className?: string
  /** Tab content rendered as children (use TabsContent with matching value) */
  children?: React.ReactNode
}
