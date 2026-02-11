import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NAccordion } from './NAccordion'

const items = [
  { id: '1', title: 'Section 1', content: 'Content 1' },
  { id: '2', title: 'Section 2', content: 'Content 2' },
]

describe('NAccordion', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NAccordion items={items} />)
    expect(container.firstChild).toHaveAttribute(
      'data-neuron-component',
      'NAccordion',
    )
  })

  it('renders all item titles', () => {
    render(<NAccordion items={items} />)
    expect(screen.getByText('Section 1')).toBeInTheDocument()
    expect(screen.getByText('Section 2')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <NAccordion items={items} className="custom-class" />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    render(<NAccordion ref={ref} items={items} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
