import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NSlider } from './NSlider'

describe('NSlider', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NSlider />)
    expect(container.querySelector('[data-neuron-component]')).toHaveAttribute(
      'data-neuron-component',
      'NSlider',
    )
  })

  it('renders slider role', () => {
    render(<NSlider />)
    expect(screen.getByRole('slider')).toBeInTheDocument()
  })

  it('renders with custom min/max', () => {
    render(<NSlider min={10} max={50} value={25} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuemin', '10')
    expect(slider).toHaveAttribute('aria-valuemax', '50')
  })
})
