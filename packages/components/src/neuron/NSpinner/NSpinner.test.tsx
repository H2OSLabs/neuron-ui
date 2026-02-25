import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NSpinner } from './NSpinner'

describe('NSpinner', () => {
  it('renders with data-neuron-component attribute', () => {
    render(<NSpinner />)
    expect(screen.getByRole('status')).toHaveAttribute('data-neuron-component', 'NSpinner')
  })

  it('has accessible loading text', () => {
    render(<NSpinner />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('applies size data attribute', () => {
    render(<NSpinner size="lg" />)
    expect(screen.getByRole('status')).toHaveAttribute('data-neuron-size', 'lg')
  })
})
