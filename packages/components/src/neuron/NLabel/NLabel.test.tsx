import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NLabel } from './NLabel'

describe('NLabel', () => {
  it('renders with data-neuron-component attribute', () => {
    render(<NLabel label="Username" />)
    expect(screen.getByText('Username')).toHaveAttribute('data-neuron-component', 'NLabel')
  })

  it('renders label text', () => {
    render(<NLabel label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('shows required indicator', () => {
    render(<NLabel label="Name" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('links to input via htmlFor', () => {
    render(<NLabel label="Email" htmlFor="email-input" />)
    expect(screen.getByText('Email')).toHaveAttribute('for', 'email-input')
  })
})
