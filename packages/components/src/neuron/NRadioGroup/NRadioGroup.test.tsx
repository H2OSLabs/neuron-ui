import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NRadioGroup } from './NRadioGroup'

const options = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
]

describe('NRadioGroup', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NRadioGroup options={options} />)
    expect(container.querySelector('[data-neuron-component]')).toHaveAttribute(
      'data-neuron-component',
      'NRadioGroup',
    )
  })

  it('renders all option labels', () => {
    render(<NRadioGroup options={options} />)
    expect(screen.getByText('Small')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Large')).toBeInTheDocument()
  })

  it('renders radio inputs', () => {
    render(<NRadioGroup options={options} />)
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })
})
