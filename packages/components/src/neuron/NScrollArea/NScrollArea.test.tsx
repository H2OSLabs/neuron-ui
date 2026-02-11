import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NScrollArea } from './NScrollArea'

describe('NScrollArea', () => {
  it('renders with data-neuron-component attribute', () => {
    render(
      <NScrollArea>
        <p>Scrollable content</p>
      </NScrollArea>,
    )
    const area = screen.getByText('Scrollable content').closest('[data-neuron-component]')
    expect(area).toHaveAttribute('data-neuron-component', 'NScrollArea')
  })

  it('renders children content', () => {
    render(
      <NScrollArea>
        <span>Content inside scroll area</span>
      </NScrollArea>,
    )
    expect(screen.getByText('Content inside scroll area')).toBeInTheDocument()
  })

  it('applies orientation data attribute', () => {
    render(
      <NScrollArea orientation="horizontal">
        <span>Content</span>
      </NScrollArea>,
    )
    const area = screen.getByText('Content').closest('[data-neuron-component]')
    expect(area).toHaveAttribute('data-neuron-orientation', 'horizontal')
  })

  it('applies maxHeight style', () => {
    render(
      <NScrollArea maxHeight="200px">
        <span>Content</span>
      </NScrollArea>,
    )
    const area = screen.getByText('Content').closest('[data-neuron-component]')
    expect(area).toHaveStyle({ maxHeight: '200px' })
  })
})
