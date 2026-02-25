import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NCommand } from './NCommand'

// cmdk uses scrollIntoView which is not available in jsdom
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {}
})

const defaultItems = [
  { label: 'Calendar', value: 'calendar' },
  { label: 'Search', value: 'search' },
  { label: 'Settings', value: 'settings' },
]

describe('NCommand', () => {
  it('renders with data-neuron-component attribute', () => {
    render(<NCommand items={defaultItems} />)
    const el = document.querySelector('[data-neuron-component="NCommand"]')
    expect(el).toBeInTheDocument()
  })

  it('renders placeholder text', () => {
    render(<NCommand placeholder="Search commands..." items={defaultItems} />)
    expect(screen.getByPlaceholderText('Search commands...')).toBeInTheDocument()
  })

  it('renders all items', () => {
    render(<NCommand items={defaultItems} />)
    expect(screen.getByText('Calendar')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders with default placeholder', () => {
    render(<NCommand items={[]} />)
    expect(screen.getByPlaceholderText('Type a command or search...')).toBeInTheDocument()
  })

  it('renders empty state when no items', () => {
    render(<NCommand items={[]} />)
    expect(screen.getByText('No results found.')).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    render(<NCommand ref={ref} items={defaultItems} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
