import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NPopover } from './NPopover'

describe('NPopover', () => {
  it('renders with data-neuron-component attribute', () => {
    render(
      <NPopover triggerLabel="Click">
        <p>Content</p>
      </NPopover>,
    )
    const el = screen.getByText('Click').closest('[data-neuron-component]')
    expect(el).toHaveAttribute('data-neuron-component', 'NPopover')
  })

  it('renders trigger button with label', () => {
    render(
      <NPopover triggerLabel="Open Popover">
        <p>Content</p>
      </NPopover>,
    )
    expect(screen.getByText('Open Popover')).toBeInTheDocument()
  })

  it('uses default trigger label', () => {
    render(
      <NPopover>
        <p>Content</p>
      </NPopover>,
    )
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('renders trigger as a button', () => {
    render(
      <NPopover triggerLabel="Click">
        <p>Content</p>
      </NPopover>,
    )
    expect(screen.getByRole('button', { name: /Click/i })).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    render(
      <NPopover ref={ref}>
        <p>Content</p>
      </NPopover>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
