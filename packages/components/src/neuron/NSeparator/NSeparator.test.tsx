import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { NSeparator } from './NSeparator'

describe('NSeparator', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NSeparator />)
    expect(container.querySelector('[data-neuron-component]')).toHaveAttribute(
      'data-neuron-component',
      'NSeparator',
    )
  })

  it('renders as horizontal by default', () => {
    const { container } = render(<NSeparator />)
    expect(container.querySelector('[data-orientation="horizontal"]')).toBeInTheDocument()
  })

  it('renders as vertical', () => {
    const { container } = render(<NSeparator orientation="vertical" />)
    expect(container.querySelector('[data-orientation="vertical"]')).toBeInTheDocument()
  })
})
