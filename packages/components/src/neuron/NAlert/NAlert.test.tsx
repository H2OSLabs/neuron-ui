import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NAlert } from './NAlert'

describe('NAlert', () => {
  it('renders with data-neuron-component attribute', () => {
    render(<NAlert description="Test alert" />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('data-neuron-component', 'NAlert')
  })

  it('renders description', () => {
    render(<NAlert description="Something happened" />)
    expect(screen.getByText('Something happened')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(<NAlert title="Warning" description="Be careful" />)
    expect(screen.getByText('Warning')).toBeInTheDocument()
    expect(screen.getByText('Be careful')).toBeInTheDocument()
  })

  it('applies variant data attribute', () => {
    render(<NAlert description="Error occurred" variant="error" />)
    expect(screen.getByRole('alert')).toHaveAttribute(
      'data-neuron-variant',
      'error',
    )
  })

  it('defaults to info variant', () => {
    render(<NAlert description="Info message" />)
    expect(screen.getByRole('alert')).toHaveAttribute(
      'data-neuron-variant',
      'info',
    )
  })

  it('applies custom className', () => {
    render(<NAlert description="Test" className="custom-class" />)
    expect(screen.getByRole('alert')).toHaveClass('custom-class')
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    render(<NAlert ref={ref} description="Test" />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
