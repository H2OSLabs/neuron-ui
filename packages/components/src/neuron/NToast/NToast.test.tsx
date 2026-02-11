import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NToast } from './NToast'

describe('NToast', () => {
  it('renders with data-neuron-component attribute', () => {
    render(<NToast title="Test" />)
    const el = screen.getByRole('status')
    expect(el).toHaveAttribute('data-neuron-component', 'NToast')
  })

  it('renders title text', () => {
    render(<NToast title="Success!" />)
    expect(screen.getByText('Success!')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<NToast title="Title" description="Some details" />)
    expect(screen.getByText('Some details')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    render(<NToast title="Title" />)
    const el = screen.getByRole('status')
    expect(el.querySelectorAll('p')).toHaveLength(1)
  })

  it('applies variant data attribute', () => {
    render(<NToast title="Error" variant="error" />)
    expect(screen.getByRole('status')).toHaveAttribute('data-neuron-variant', 'error')
  })

  it('defaults to default variant', () => {
    render(<NToast title="Test" />)
    expect(screen.getByRole('status')).toHaveAttribute('data-neuron-variant', 'default')
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    render(<NToast ref={ref} title="Test" />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
