import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NResizable } from './NResizable'

describe('NResizable', () => {
  it('renders with data-neuron-component attribute', () => {
    render(<NResizable>Content</NResizable>)
    const el = screen.getByText('Content').closest('[data-neuron-component]')
    expect(el).toHaveAttribute('data-neuron-component', 'NResizable')
  })

  it('renders children content', () => {
    render(<NResizable>Resizable content</NResizable>)
    expect(screen.getByText('Resizable content')).toBeInTheDocument()
  })

  it('defaults to horizontal direction', () => {
    render(<NResizable>Content</NResizable>)
    const el = screen.getByText('Content').closest('[data-neuron-component]')
    expect(el).toHaveAttribute('data-neuron-direction', 'horizontal')
  })

  it('applies vertical direction', () => {
    render(<NResizable direction="vertical">Content</NResizable>)
    const el = screen.getByText('Content').closest('[data-neuron-component]')
    expect(el).toHaveAttribute('data-neuron-direction', 'vertical')
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    render(<NResizable ref={ref}>Content</NResizable>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
