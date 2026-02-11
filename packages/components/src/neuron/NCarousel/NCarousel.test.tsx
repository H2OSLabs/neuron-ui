import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NCarousel } from './NCarousel'

describe('NCarousel', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NCarousel />)
    expect(container.firstChild).toHaveAttribute(
      'data-neuron-component',
      'NCarousel',
    )
  })

  it('renders items', () => {
    render(<NCarousel items={['Slide 1', 'Slide 2', 'Slide 3']} />)
    expect(screen.getByText('Slide 1')).toBeInTheDocument()
    expect(screen.getByText('Slide 2')).toBeInTheDocument()
    expect(screen.getByText('Slide 3')).toBeInTheDocument()
  })

  it('renders empty state when no items', () => {
    render(<NCarousel />)
    expect(screen.getByText('No items')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<NCarousel className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    render(<NCarousel ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
