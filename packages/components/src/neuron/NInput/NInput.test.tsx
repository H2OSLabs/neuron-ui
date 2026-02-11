import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NInput } from './NInput'

describe('NInput', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NInput placeholder="Type..." />)
    expect(container.querySelector('[data-neuron-component]')).toHaveAttribute(
      'data-neuron-component',
      'NInput',
    )
  })

  it('renders placeholder', () => {
    render(<NInput placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('shows error message when invalid', () => {
    render(<NInput invalid errorMessage="Required field" />)
    expect(screen.getByText('Required field')).toBeInTheDocument()
  })

  it('can be disabled', () => {
    render(<NInput placeholder="test" disabled />)
    expect(screen.getByPlaceholderText('test')).toBeDisabled()
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLInputElement>
    render(<NInput ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
