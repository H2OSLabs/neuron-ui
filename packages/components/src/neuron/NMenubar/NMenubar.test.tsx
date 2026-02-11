import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NMenubar } from './NMenubar'

const defaultMenus = [
  {
    label: 'File',
    items: [{ label: 'New' }, { label: 'Open' }],
  },
  {
    label: 'Edit',
    items: [{ label: 'Undo' }, { label: 'Redo' }],
  },
]

describe('NMenubar', () => {
  it('renders with data-neuron-component attribute', () => {
    render(<NMenubar menus={defaultMenus} />)
    const el = screen.getByRole('menubar')
    expect(el).toHaveAttribute('data-neuron-component', 'NMenubar')
  })

  it('renders all menu triggers', () => {
    render(<NMenubar menus={defaultMenus} />)
    expect(screen.getByText('File')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })

  it('renders correct number of menu triggers', () => {
    render(<NMenubar menus={defaultMenus} />)
    const triggers = screen.getAllByRole('menuitem')
    expect(triggers).toHaveLength(2)
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    render(<NMenubar ref={ref} menus={defaultMenus} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
