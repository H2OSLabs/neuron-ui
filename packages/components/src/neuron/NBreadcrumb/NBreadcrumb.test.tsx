import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NBreadcrumb } from './NBreadcrumb'

const sampleItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Widget' },
]

describe('NBreadcrumb', () => {
  it('renders with data-neuron-component attribute', () => {
    render(<NBreadcrumb items={sampleItems} />)
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveAttribute('data-neuron-component', 'NBreadcrumb')
  })

  it('renders all breadcrumb labels', () => {
    render(<NBreadcrumb items={sampleItems} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Widget')).toBeInTheDocument()
  })

  it('renders links for items with href', () => {
    render(<NBreadcrumb items={sampleItems} />)
    const homeLink = screen.getByText('Home')
    expect(homeLink.tagName).toBe('A')
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('renders last item as text without link', () => {
    render(<NBreadcrumb items={sampleItems} />)
    const lastItem = screen.getByText('Widget')
    expect(lastItem.tagName).toBe('SPAN')
    expect(lastItem).toHaveAttribute('aria-current', 'page')
  })

  it('renders separators between items', () => {
    const { container } = render(<NBreadcrumb items={sampleItems} />)
    const separators = container.querySelectorAll('[aria-hidden="true"]')
    expect(separators).toHaveLength(2)
  })
})
