import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NCard } from './NCard'

describe('NCard', () => {
  it('renders with data-neuron-component attribute', () => {
    render(<NCard title="Test Card" />)
    const card = screen.getByText('Test Card').closest('[data-neuron-component]')
    expect(card).toHaveAttribute('data-neuron-component', 'NCard')
  })

  it('renders title text', () => {
    render(<NCard title="My Card" />)
    expect(screen.getByText('My Card')).toBeInTheDocument()
  })

  it('renders description text', () => {
    render(<NCard title="Card" description="A description" />)
    expect(screen.getByText('A description')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(<NCard>Card body content</NCard>)
    expect(screen.getByText('Card body content')).toBeInTheDocument()
  })

  it('renders footer content', () => {
    render(<NCard footer={<button>Action</button>} />)
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('applies variant data attribute', () => {
    render(<NCard title="Test" variant="notification" />)
    const card = screen.getByText('Test').closest('[data-neuron-component]')
    expect(card).toHaveAttribute('data-neuron-variant', 'notification')
  })
})
