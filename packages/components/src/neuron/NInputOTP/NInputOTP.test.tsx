import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NInputOTP } from './NInputOTP'

describe('NInputOTP', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NInputOTP />)
    expect(container.querySelector('[data-neuron-component]')).toHaveAttribute(
      'data-neuron-component',
      'NInputOTP',
    )
  })

  it('renders correct number of inputs (default 6)', () => {
    const { container } = render(<NInputOTP />)
    const inputs = container.querySelectorAll('input')
    expect(inputs).toHaveLength(6)
  })

  it('renders custom number of inputs', () => {
    const { container } = render(<NInputOTP length={4} />)
    const inputs = container.querySelectorAll('input')
    expect(inputs).toHaveLength(4)
  })

  it('renders inputs with aria-labels', () => {
    render(<NInputOTP length={4} />)
    expect(screen.getByLabelText('OTP digit 1')).toBeInTheDocument()
    expect(screen.getByLabelText('OTP digit 4')).toBeInTheDocument()
  })
})
