import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NAspectRatio } from './NAspectRatio'

describe('NAspectRatio', () => {
  it('renders with data-neuron-component attribute', () => {
    render(
      <NAspectRatio>
        <img src="test.jpg" alt="test" />
      </NAspectRatio>,
    )
    const wrapper = screen.getByAltText('test').closest('[data-neuron-component]')
    expect(wrapper).toHaveAttribute('data-neuron-component', 'NAspectRatio')
  })

  it('renders children content', () => {
    render(
      <NAspectRatio>
        <span>Aspect content</span>
      </NAspectRatio>,
    )
    expect(screen.getByText('Aspect content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <NAspectRatio className="custom-class">
        <span>Content</span>
      </NAspectRatio>,
    )
    const wrapper = screen.getByText('Content').closest('[data-neuron-component]')
    expect(wrapper).toHaveClass('custom-class')
  })
})
