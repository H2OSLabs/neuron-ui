import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NNavigationMenu } from './NNavigationMenu'

const defaultItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

describe('NNavigationMenu', () => {
  it('renders with data-neuron-component attribute', () => {
    render(<NNavigationMenu items={defaultItems} />)
    const el = document.querySelector('[data-neuron-component="NNavigationMenu"]')
    expect(el).toBeInTheDocument()
  })

  it('renders all navigation items', () => {
    render(<NNavigationMenu items={defaultItems} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('renders links with correct href', () => {
    render(<NNavigationMenu items={defaultItems} />)
    const homeLink = screen.getByText('Home').closest('a')
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('uses # as default href', () => {
    render(<NNavigationMenu items={[{ label: 'No Link' }]} />)
    const link = screen.getByText('No Link').closest('a')
    expect(link).toHaveAttribute('href', '#')
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLElement>
    render(<NNavigationMenu ref={ref} items={defaultItems} />)
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })
})
