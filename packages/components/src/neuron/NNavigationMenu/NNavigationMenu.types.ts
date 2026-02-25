export interface NNavigationMenuItemConfig {
  /** Navigation item label */
  label: string
  /** Navigation link href */
  href?: string
}

export interface NNavigationMenuProps {
  /** Navigation menu items */
  items: NNavigationMenuItemConfig[]
  /** Additional CSS class names */
  className?: string
}
