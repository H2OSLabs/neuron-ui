import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { NCalendar } from './NCalendar'

describe('NCalendar', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NCalendar />)
    expect(container.firstChild).toHaveAttribute(
      'data-neuron-component',
      'NCalendar',
    )
  })

  it('renders placeholder text', () => {
    const { getByText } = render(<NCalendar />)
    expect(getByText('Calendar placeholder')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<NCalendar className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    render(<NCalendar ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
