import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NHoverCard } from './NHoverCard'

describe('NHoverCard', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NHoverCard triggerText="Hover me" />)
    expect(container.firstChild).toHaveAttribute(
      'data-neuron-component',
      'NHoverCard',
    )
  })

  it('renders trigger text', () => {
    render(<NHoverCard triggerText="Hover me" />)
    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <NHoverCard triggerText="Hover" className="custom-class" />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    render(<NHoverCard ref={ref} triggerText="Hover" />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
