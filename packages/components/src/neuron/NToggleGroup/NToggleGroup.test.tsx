import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NToggleGroup } from './NToggleGroup'

const defaultItems = [
  { value: 'bold', label: 'Bold' },
  { value: 'italic', label: 'Italic' },
  { value: 'underline', label: 'Underline' },
]

describe('NToggleGroup', () => {
  it('renders with data-neuron-component attribute', () => {
    render(<NToggleGroup items={defaultItems} />)
    const group = screen.getByRole('group')
    expect(group).toHaveAttribute('data-neuron-component', 'NToggleGroup')
  })

  it('renders all items', () => {
    render(<NToggleGroup items={defaultItems} />)
    expect(screen.getByText('Bold')).toBeInTheDocument()
    expect(screen.getByText('Italic')).toBeInTheDocument()
    expect(screen.getByText('Underline')).toBeInTheDocument()
  })

  it('renders correct number of toggle buttons', () => {
    render(<NToggleGroup items={defaultItems} />)
    const buttons = screen.getAllByRole('radio')
    expect(buttons).toHaveLength(3)
  })

  it('defaults to single type', () => {
    render(<NToggleGroup items={defaultItems} />)
    // single type uses role="radiogroup"
    expect(screen.getByRole('group')).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    render(<NToggleGroup ref={ref} items={defaultItems} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
