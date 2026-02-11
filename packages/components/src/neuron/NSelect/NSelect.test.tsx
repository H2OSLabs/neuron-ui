import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NSelect } from './NSelect'

const options = [
  { value: 'red', label: 'Red' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
]

describe('NSelect', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NSelect options={options} />)
    expect(container.querySelector('[data-neuron-component]')).toHaveAttribute(
      'data-neuron-component',
      'NSelect',
    )
  })

  it('renders trigger button', () => {
    render(<NSelect options={options} placeholder="Choose color" />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    render(<NSelect options={options} placeholder="Choose color" />)
    expect(screen.getByText('Choose color')).toBeInTheDocument()
  })
})
