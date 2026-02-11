import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NToggle } from './NToggle'

describe('NToggle', () => {
  it('renders with data-neuron-component attribute', () => {
    render(<NToggle>Bold</NToggle>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('data-neuron-component', 'NToggle')
  })

  it('renders children content', () => {
    render(<NToggle>Bold</NToggle>)
    expect(screen.getByText('Bold')).toBeInTheDocument()
  })

  it('can be disabled', () => {
    render(<NToggle disabled>Bold</NToggle>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('supports pressed state', () => {
    render(<NToggle pressed>Bold</NToggle>)
    expect(screen.getByRole('button')).toHaveAttribute('data-state', 'on')
  })

  it('defaults to unpressed state', () => {
    render(<NToggle>Bold</NToggle>)
    expect(screen.getByRole('button')).toHaveAttribute('data-state', 'off')
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLButtonElement>
    render(<NToggle ref={ref}>Bold</NToggle>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})
