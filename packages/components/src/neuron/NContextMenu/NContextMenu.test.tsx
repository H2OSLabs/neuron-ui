import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NContextMenu } from './NContextMenu'

const items = [{ label: 'Copy' }, { label: 'Paste' }]

describe('NContextMenu', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NContextMenu items={items} />)
    expect(container.firstChild).toHaveAttribute(
      'data-neuron-component',
      'NContextMenu',
    )
  })

  it('renders default trigger area', () => {
    render(<NContextMenu items={items} />)
    expect(screen.getByText('Right-click here')).toBeInTheDocument()
  })

  it('renders children as trigger', () => {
    render(
      <NContextMenu items={items}>
        <span>Custom trigger</span>
      </NContextMenu>,
    )
    expect(screen.getByText('Custom trigger')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <NContextMenu items={items} className="custom-class" />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
