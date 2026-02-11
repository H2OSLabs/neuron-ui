import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NDropdownMenu } from './NDropdownMenu'

const items = [
  { label: 'Edit' },
  { label: 'Delete', disabled: true },
]

describe('NDropdownMenu', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NDropdownMenu items={items} />)
    expect(container.firstChild).toHaveAttribute(
      'data-neuron-component',
      'NDropdownMenu',
    )
  })

  it('renders trigger button with default label', () => {
    render(<NDropdownMenu items={items} />)
    expect(screen.getByText('Menu')).toBeInTheDocument()
  })

  it('renders trigger button with custom label', () => {
    render(<NDropdownMenu items={items} triggerLabel="Actions" />)
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <NDropdownMenu items={items} className="custom-class" />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
