import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NCheckbox } from './NCheckbox'

describe('NCheckbox', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NCheckbox />)
    expect(container.querySelector('[data-neuron-component]')).toHaveAttribute(
      'data-neuron-component',
      'NCheckbox',
    )
  })

  it('renders label text', () => {
    render(<NCheckbox label="Accept terms" />)
    expect(screen.getByText('Accept terms')).toBeInTheDocument()
  })

  it('renders checkbox role', () => {
    render(<NCheckbox label="Test" />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('can be disabled', () => {
    render(<NCheckbox label="Disabled" disabled />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })
})
