export interface NSidebarProps {
  /** Whether the sidebar is collapsed */
  collapsed?: boolean
  /** Width of the sidebar when expanded (CSS value) */
  width?: string
  /** Width of the sidebar when collapsed (CSS value) */
  collapsedWidth?: string
  /** Callback when collapse state is toggled */
  onCollapsedChange?: (collapsed: boolean) => void
  /** Additional CSS class names */
  className?: string
  /** Sidebar content (navigation items, etc.) */
  children?: React.ReactNode
}
