import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NButton } from './NButton'

describe('NButton', () => {
  it('renders with data-neuron-component attribute', () => {
    render(<NButton label="Click me" />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('data-neuron-component', 'NButton')
  })

  it('renders label text', () => {
    render(<NButton label="Submit" />)
    expect(screen.getByText('Submit')).toBeInTheDocument()
  })

  it('renders children over label', () => {
    render(<NButton label="ignored">Custom Content</NButton>)
    expect(screen.getByText('Custom Content')).toBeInTheDocument()
  })

  it('applies variant data attribute', () => {
    render(<NButton label="Test" variant="destructive" />)
    expect(screen.getByRole('button')).toHaveAttribute('data-neuron-variant', 'destructive')
  })

  it('applies size data attribute', () => {
    render(<NButton label="Test" size="lg" />)
    expect(screen.getByRole('button')).toHaveAttribute('data-neuron-size', 'lg')
  })

  it('can be disabled', () => {
    render(<NButton label="Test" disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLButtonElement>
    render(<NButton ref={ref} label="Test" />)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})
