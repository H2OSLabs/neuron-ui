import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NDrawer } from './NDrawer'

describe('NDrawer', () => {
  it('renders with data-neuron-component attribute when open', () => {
    render(<NDrawer title="Drawer" open />)
    const drawer = screen.getByRole('dialog')
    expect(drawer).toHaveAttribute('data-neuron-component', 'NDrawer')
  })

  it('renders title text when open', () => {
    render(<NDrawer title="My Drawer" open />)
    expect(screen.getByText('My Drawer')).toBeInTheDocument()
  })

  it('renders children content when open', () => {
    render(
      <NDrawer title="Drawer" open>
        <p>Drawer content</p>
      </NDrawer>,
    )
    expect(screen.getByText('Drawer content')).toBeInTheDocument()
  })
})
