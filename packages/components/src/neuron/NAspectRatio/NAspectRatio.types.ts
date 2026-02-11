export interface NAspectRatioProps {
  /** Aspect ratio as a decimal (e.g. 16/9 = 1.778) */
  ratio?: number
  /** Additional CSS class names */
  className?: string
  /** Children content (typically an image or video) */
  children?: React.ReactNode
}
