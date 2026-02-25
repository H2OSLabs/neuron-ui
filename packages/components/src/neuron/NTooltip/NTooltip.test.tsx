import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NTooltip } from './NTooltip'

describe('NTooltip', () => {
  it('renders with data-neuron-component attribute', () => {
    render(
      <NTooltip content="Tooltip text">
        <button>Hover me</button>
      </NTooltip>,
    )
    const el = screen.getByText('Hover me').closest('[data-neuron-component]')
    expect(el).toHaveAttribute('data-neuron-component', 'NTooltip')
  })

  it('renders trigger children', () => {
    render(
      <NTooltip content="Tooltip text">
        <button>Hover me</button>
      </NTooltip>,
    )
    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    render(
      <NTooltip ref={ref} content="Test">
        <button>Hover</button>
      </NTooltip>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
