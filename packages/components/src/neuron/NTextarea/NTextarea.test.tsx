import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NTextarea } from './NTextarea'

describe('NTextarea', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NTextarea />)
    expect(container.querySelector('[data-neuron-component]')).toHaveAttribute(
      'data-neuron-component',
      'NTextarea',
    )
  })

  it('renders placeholder text', () => {
    render(<NTextarea placeholder="Enter description" />)
    expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument()
  })

  it('renders as a textarea element', () => {
    render(<NTextarea placeholder="test" />)
    expect(screen.getByPlaceholderText('test').tagName).toBe('TEXTAREA')
  })

  it('can be disabled', () => {
    render(<NTextarea placeholder="test" disabled />)
    expect(screen.getByPlaceholderText('test')).toBeDisabled()
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLTextAreaElement>
    render(<NTextarea ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })
})
