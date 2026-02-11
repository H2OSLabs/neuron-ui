import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NCombobox } from './NCombobox'

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
]

describe('NCombobox', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NCombobox options={options} />)
    expect(container.querySelector('[data-neuron-component]')).toHaveAttribute(
      'data-neuron-component',
      'NCombobox',
    )
  })

  it('renders placeholder text', () => {
    render(<NCombobox options={options} placeholder="Pick a fruit" />)
    expect(screen.getByText('Pick a fruit')).toBeInTheDocument()
  })

  it('renders combobox trigger button', () => {
    render(<NCombobox options={options} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows selected value label', () => {
    render(<NCombobox options={options} value="banana" />)
    expect(screen.getByText('Banana')).toBeInTheDocument()
  })
})
