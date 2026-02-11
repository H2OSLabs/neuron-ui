export type NButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
export type NButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon'

export interface NButtonProps {
  /** Button label text */
  label?: string
  /** Button variant */
  variant?: NButtonVariant
  /** Button size: xs(20px), sm(24px), md(32px), lg(36px), xl(48px), icon(32px circle) */
  size?: NButtonSize
  /** Icon name (from lucide-react icon registry) */
  icon?: string
  /** Icon position relative to label */
  iconPosition?: 'left' | 'right'
  /** Whether the button is disabled */
  disabled?: boolean
  /** onClick binding key for Page Schema */
  onClick?: string
  /** Additional CSS class names */
  className?: string
  /** Children content */
  children?: React.ReactNode
}
