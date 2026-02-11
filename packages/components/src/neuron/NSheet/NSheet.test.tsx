import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NSheet } from './NSheet'

describe('NSheet', () => {
  it('renders with data-neuron-component attribute when open', () => {
    render(<NSheet title="Sheet" open />)
    const sheet = screen.getByRole('dialog')
    expect(sheet).toHaveAttribute('data-neuron-component', 'NSheet')
  })

  it('renders title text when open', () => {
    render(<NSheet title="My Sheet" open />)
    expect(screen.getByText('My Sheet')).toBeInTheDocument()
  })

  it('renders children content when open', () => {
    render(
      <NSheet title="Sheet" open>
        <p>Sheet content here</p>
      </NSheet>,
    )
    expect(screen.getByText('Sheet content here')).toBeInTheDocument()
  })

  it('applies side data attribute', () => {
    render(<NSheet title="Sheet" side="left" open />)
    const sheet = screen.getByRole('dialog')
    expect(sheet).toHaveAttribute('data-neuron-side', 'left')
  })
})
