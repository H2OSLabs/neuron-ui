import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NInputGroup } from './NInputGroup'

describe('NInputGroup', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NInputGroup>input</NInputGroup>)
    expect(container.querySelector('[data-neuron-component]')).toHaveAttribute(
      'data-neuron-component',
      'NInputGroup',
    )
  })

  it('renders label text', () => {
    render(<NInputGroup label="Username">input</NInputGroup>)
    expect(screen.getByText('Username')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(<NInputGroup><input placeholder="test" /></NInputGroup>)
    expect(screen.getByPlaceholderText('test')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    render(<NInputGroup icon="@">input</NInputGroup>)
    expect(screen.getByText('@')).toBeInTheDocument()
  })
})
