import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { NDatePicker } from './NDatePicker'

describe('NDatePicker', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NDatePicker />)
    expect(container.querySelector('[data-neuron-component]')).toHaveAttribute(
      'data-neuron-component',
      'NDatePicker',
    )
  })

  it('renders a date input', () => {
    const { container } = render(<NDatePicker />)
    const input = container.querySelector('input[type="date"]')
    expect(input).toBeInTheDocument()
  })

  it('can be disabled', () => {
    const { container } = render(<NDatePicker disabled />)
    const input = container.querySelector('input[type="date"]')
    expect(input).toBeDisabled()
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLInputElement>
    render(<NDatePicker ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
