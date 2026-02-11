export interface NDropdownMenuItem {
  /** Menu item label */
  label: string
  /** onClick binding key for Page Schema */
  onClick?: string
  /** Whether the item is disabled */
  disabled?: boolean
}

export interface NDropdownMenuProps {
  /** Menu items */
  items: NDropdownMenuItem[]
  /** Trigger button label */
  triggerLabel?: string
  /** Additional CSS class names */
  className?: string
}
