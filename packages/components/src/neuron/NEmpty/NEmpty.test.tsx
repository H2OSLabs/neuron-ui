import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NEmpty } from './NEmpty'

describe('NEmpty', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NEmpty />)
    expect(container.firstChild).toHaveAttribute(
      'data-neuron-component',
      'NEmpty',
    )
  })

  it('renders default title', () => {
    render(<NEmpty />)
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  it('renders custom title', () => {
    render(<NEmpty title="Nothing here" />)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<NEmpty description="Try adding some items" />)
    expect(screen.getByText('Try adding some items')).toBeInTheDocument()
  })

  it('renders action button when actionLabel provided', () => {
    render(<NEmpty actionLabel="Add Item" />)
    expect(screen.getByText('Add Item')).toBeInTheDocument()
  })

  it('does not render action button when no actionLabel', () => {
    render(<NEmpty />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<NEmpty className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
