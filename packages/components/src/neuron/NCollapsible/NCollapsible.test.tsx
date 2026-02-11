import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NCollapsible } from './NCollapsible'

describe('NCollapsible', () => {
  it('renders with data-neuron-component attribute', () => {
    render(
      <NCollapsible title="Section">
        <p>Content</p>
      </NCollapsible>,
    )
    const collapsible = screen.getByText('Section').closest('[data-neuron-component]')
    expect(collapsible).toHaveAttribute('data-neuron-component', 'NCollapsible')
  })

  it('renders title text', () => {
    render(
      <NCollapsible title="My Section">
        <p>Content</p>
      </NCollapsible>,
    )
    expect(screen.getByText('My Section')).toBeInTheDocument()
  })

  it('renders children content when defaultOpen', () => {
    render(
      <NCollapsible title="Section" defaultOpen>
        <p>Visible content</p>
      </NCollapsible>,
    )
    expect(screen.getByText('Visible content')).toBeInTheDocument()
  })

  it('hides content by default when not defaultOpen', () => {
    render(
      <NCollapsible title="Section">
        <p>Hidden content</p>
      </NCollapsible>,
    )
    const content = screen.queryByText('Hidden content')
    // Radix Collapsible removes content from DOM when closed
    expect(content).toBeNull()
  })

  it('renders trigger as a button', () => {
    render(
      <NCollapsible title="Click Me">
        <p>Content</p>
      </NCollapsible>,
    )
    expect(screen.getByRole('button', { name: /Click Me/i })).toBeInTheDocument()
  })
})
