import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NDialog } from './NDialog'

describe('NDialog', () => {
  it('renders with data-neuron-component attribute when open', () => {
    render(<NDialog title="Test Dialog" open />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('data-neuron-component', 'NDialog')
  })

  it('renders title text when open', () => {
    render(<NDialog title="My Dialog" open />)
    expect(screen.getByText('My Dialog')).toBeInTheDocument()
  })

  it('renders description text when provided', () => {
    render(
      <NDialog title="Dialog" description="A helpful description" open />,
    )
    expect(screen.getByText('A helpful description')).toBeInTheDocument()
  })

  it('renders children content when open', () => {
    render(
      <NDialog title="Dialog" open>
        <p>Dialog body content</p>
      </NDialog>,
    )
    expect(screen.getByText('Dialog body content')).toBeInTheDocument()
  })
})
