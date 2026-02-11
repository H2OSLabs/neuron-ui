import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NField } from './NField'

describe('NField', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NField label="Name">input</NField>)
    expect(container.querySelector('[data-neuron-component="NField"]')).toHaveAttribute(
      'data-neuron-component',
      'NField',
    )
  })

  it('renders label text', () => {
    render(<NField label="Email">input</NField>)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders required indicator', () => {
    render(<NField label="Username" required>input</NField>)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders error message', () => {
    render(<NField label="Password" error="Too short">input</NField>)
    expect(screen.getByText('Too short')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <NField label="Name">
        <input placeholder="Enter name" />
      </NField>,
    )
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument()
  })
})
