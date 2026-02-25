import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NBadge } from './NBadge'

describe('NBadge', () => {
  it('renders with data-neuron-component attribute', () => {
    render(<NBadge label="Status" />)
    expect(screen.getByText('Status')).toHaveAttribute('data-neuron-component', 'NBadge')
  })

  it('renders label text', () => {
    render(<NBadge label="Active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies size data attribute', () => {
    render(<NBadge label="Small" size="sm" />)
    expect(screen.getByText('Small')).toHaveAttribute('data-neuron-size', 'sm')
  })

  it('applies variant data attribute', () => {
    render(<NBadge label="Test" variant="destructive" />)
    expect(screen.getByText('Test')).toHaveAttribute('data-neuron-variant', 'destructive')
  })

  it('applies custom className', () => {
    render(<NBadge label="Test" className="custom-class" />)
    expect(screen.getByText('Test')).toHaveClass('custom-class')
  })
})
