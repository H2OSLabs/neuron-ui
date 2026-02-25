import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NPagination } from './NPagination'

describe('NPagination', () => {
  it('renders with data-neuron-component attribute', () => {
    render(<NPagination currentPage={1} totalPages={5} />)
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveAttribute('data-neuron-component', 'NPagination')
  })

  it('renders page number buttons', () => {
    render(<NPagination currentPage={1} totalPages={3} />)
    expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Page 2')).toBeInTheDocument()
    expect(screen.getByLabelText('Page 3')).toBeInTheDocument()
  })

  it('marks current page with aria-current', () => {
    render(<NPagination currentPage={2} totalPages={3} />)
    expect(screen.getByLabelText('Page 2')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('disables previous button on first page', () => {
    render(<NPagination currentPage={1} totalPages={3} />)
    expect(screen.getByLabelText('Previous page')).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(<NPagination currentPage={3} totalPages={3} />)
    expect(screen.getByLabelText('Next page')).toBeDisabled()
  })

  it('applies custom className', () => {
    render(
      <NPagination
        currentPage={1}
        totalPages={3}
        className="custom-class"
      />,
    )
    expect(screen.getByRole('navigation')).toHaveClass('custom-class')
  })
})
