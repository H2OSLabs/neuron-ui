import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NSidebar } from './NSidebar'

describe('NSidebar', () => {
  it('renders with data-neuron-component attribute', () => {
    render(
      <NSidebar>
        <span>Nav content</span>
      </NSidebar>,
    )
    const sidebar = screen.getByText('Nav content').closest('[data-neuron-component]')
    expect(sidebar).toHaveAttribute('data-neuron-component', 'NSidebar')
  })

  it('renders children content', () => {
    render(
      <NSidebar>
        <span>Sidebar items</span>
      </NSidebar>,
    )
    expect(screen.getByText('Sidebar items')).toBeInTheDocument()
  })

  it('applies collapsed data attribute when collapsed', () => {
    render(
      <NSidebar collapsed>
        <span>Content</span>
      </NSidebar>,
    )
    const sidebar = screen.getByText('Content').closest('[data-neuron-component]')
    expect(sidebar).toHaveAttribute('data-neuron-collapsed', 'true')
  })

  it('applies expanded width by default', () => {
    render(
      <NSidebar>
        <span>Content</span>
      </NSidebar>,
    )
    const sidebar = screen.getByText('Content').closest('[data-neuron-component]')
    expect(sidebar).toHaveStyle({ width: '256px' })
  })

  it('applies collapsed width when collapsed', () => {
    render(
      <NSidebar collapsed>
        <span>Content</span>
      </NSidebar>,
    )
    const sidebar = screen.getByText('Content').closest('[data-neuron-component]')
    expect(sidebar).toHaveStyle({ width: '64px' })
  })

  it('renders collapse toggle button', () => {
    render(
      <NSidebar>
        <span>Content</span>
      </NSidebar>,
    )
    expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument()
  })
})
