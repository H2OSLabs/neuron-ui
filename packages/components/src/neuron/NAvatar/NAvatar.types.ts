export type NAvatarSize = 'sm' | 'md' | 'lg'
export type NAvatarShape = 'circle' | 'square'
export type NAvatarStatus = 'online' | 'offline' | 'busy' | 'away'

export interface NAvatarProps {
  /** Image source URL */
  src?: string
  /** Alt text for the image */
  alt?: string
  /** Fallback text (typically initials) */
  fallback?: string
  /** Avatar size: sm(24px), md(40px), lg(64px) */
  size?: NAvatarSize
  /** Avatar shape */
  shape?: NAvatarShape
  /** Online status indicator */
  status?: NAvatarStatus
  /** Additional CSS class names */
  className?: string
}
