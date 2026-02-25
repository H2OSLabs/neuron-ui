import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { NProgress } from './NProgress'

describe('NProgress', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NProgress value={50} />)
    expect(container.firstChild).toHaveAttribute(
      'data-neuron-component',
      'NProgress',
    )
  })

  it('renders with progressbar role', () => {
    const { getByRole } = render(<NProgress value={50} />)
    expect(getByRole('progressbar')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <NProgress value={50} className="custom-class" />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    render(<NProgress ref={ref} value={50} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
