import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { NSkeleton } from './NSkeleton'

describe('NSkeleton', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NSkeleton />)
    expect(container.firstChild).toHaveAttribute(
      'data-neuron-component',
      'NSkeleton',
    )
  })

  it('applies width and height styles', () => {
    const { container } = render(
      <NSkeleton width="200px" height="20px" />,
    )
    const el = container.firstChild as HTMLElement
    expect(el.style.width).toBe('200px')
    expect(el.style.height).toBe('20px')
  })

  it('applies rounded-full class when rounded is true', () => {
    const { container } = render(<NSkeleton rounded />)
    expect(container.firstChild).toHaveClass('rounded-full')
  })

  it('does not apply rounded-full class by default', () => {
    const { container } = render(<NSkeleton />)
    expect(container.firstChild).not.toHaveClass('rounded-full')
  })

  it('applies custom className', () => {
    const { container } = render(<NSkeleton className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    render(<NSkeleton ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
