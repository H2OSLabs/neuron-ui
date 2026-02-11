export interface NMenubarMenuItem {
  /** Menu item label */
  label: string
}

export interface NMenubarMenu {
  /** Menu trigger label */
  label: string
  /** Menu items */
  items: NMenubarMenuItem[]
}

export interface NMenubarProps {
  /** Array of menus with their items */
  menus: NMenubarMenu[]
  /** Additional CSS class names */
  className?: string
}
