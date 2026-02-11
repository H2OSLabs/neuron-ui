import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NAvatar } from './NAvatar'

describe('NAvatar', () => {
  it('renders with data-neuron-component attribute', () => {
    render(<NAvatar fallback="JD" />)
    expect(screen.getByText('JD').closest('[data-neuron-component]')).toHaveAttribute(
      'data-neuron-component',
      'NAvatar',
    )
  })

  it('renders fallback text', () => {
    render(<NAvatar fallback="AB" />)
    expect(screen.getByText('AB')).toBeInTheDocument()
  })

  it('applies size data attribute', () => {
    const { container } = render(<NAvatar fallback="T" size="lg" />)
    expect(container.querySelector('[data-neuron-component]')).toHaveAttribute('data-neuron-size', 'lg')
  })
})
