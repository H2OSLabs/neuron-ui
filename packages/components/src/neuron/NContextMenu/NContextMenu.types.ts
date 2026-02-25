export interface NContextMenuItem {
  /** Menu item label */
  label: string
}

export interface NContextMenuProps {
  /** Context menu items */
  items: NContextMenuItem[]
  /** Additional CSS class names */
  className?: string
  /** Children content (right-click target) */
  children?: React.ReactNode
}
