import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NSwitch } from './NSwitch'

describe('NSwitch', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NSwitch />)
    expect(container.querySelector('[data-neuron-component]')).toHaveAttribute(
      'data-neuron-component',
      'NSwitch',
    )
  })

  it('renders label text', () => {
    render(<NSwitch label="Dark mode" />)
    expect(screen.getByText('Dark mode')).toBeInTheDocument()
  })

  it('renders switch role', () => {
    render(<NSwitch label="Toggle" />)
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('can be disabled', () => {
    render(<NSwitch label="Disabled" disabled />)
    expect(screen.getByRole('switch')).toBeDisabled()
  })
})
