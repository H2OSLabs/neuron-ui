import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NText } from './NText'

describe('NText', () => {
  it('renders with data-neuron-component attribute', () => {
    render(<NText text="Hello" />)
    expect(screen.getByText('Hello')).toHaveAttribute('data-neuron-component', 'NText')
  })

  it('renders text content', () => {
    render(<NText text="Hello World" />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('renders children over text prop', () => {
    render(<NText text="ignored">Custom Children</NText>)
    expect(screen.getByText('Custom Children')).toBeInTheDocument()
  })

  it('renders as different HTML elements', () => {
    const { container } = render(<NText text="Heading" as="h1" />)
    expect(container.querySelector('h1')).toBeInTheDocument()
  })

  it('applies size data attribute', () => {
    render(<NText text="Test" size="heading" />)
    expect(screen.getByText('Test')).toHaveAttribute('data-neuron-size', 'heading')
  })
})
