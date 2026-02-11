import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NKbd } from './NKbd'

describe('NKbd', () => {
  it('renders with data-neuron-component attribute', () => {
    render(<NKbd keys="Ctrl" />)
    const el = document.querySelector('[data-neuron-component="NKbd"]')
    expect(el).toBeInTheDocument()
  })

  it('renders a single key', () => {
    render(<NKbd keys="Enter" />)
    expect(screen.getByText('Enter')).toBeInTheDocument()
  })

  it('renders multiple keys', () => {
    render(<NKbd keys={['Ctrl', 'K']} />)
    expect(screen.getByText('Ctrl')).toBeInTheDocument()
    expect(screen.getByText('K')).toBeInTheDocument()
  })

  it('renders plus separator between keys', () => {
    render(<NKbd keys={['Ctrl', 'K']} />)
    expect(screen.getByText('+')).toBeInTheDocument()
  })

  it('does not render separator for single key', () => {
    render(<NKbd keys="Ctrl" />)
    expect(screen.queryByText('+')).toBeNull()
  })

  it('uses kbd HTML element', () => {
    render(<NKbd keys="Ctrl" />)
    const el = document.querySelector('kbd')
    expect(el).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLElement>
    render(<NKbd ref={ref} keys="Ctrl" />)
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })
})
