import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NTabs, NTabsContent } from './NTabs'

const sampleTabs = [
  { id: 'tab1', label: 'Tab One' },
  { id: 'tab2', label: 'Tab Two' },
]

describe('NTabs', () => {
  it('renders with data-neuron-component attribute', () => {
    render(<NTabs tabs={sampleTabs} />)
    const tabsRoot = screen.getByText('Tab One').closest('[data-neuron-component]')
    expect(tabsRoot).toHaveAttribute('data-neuron-component', 'NTabs')
  })

  it('renders tab labels', () => {
    render(<NTabs tabs={sampleTabs} />)
    expect(screen.getByText('Tab One')).toBeInTheDocument()
    expect(screen.getByText('Tab Two')).toBeInTheDocument()
  })

  it('renders tab content', () => {
    render(
      <NTabs tabs={sampleTabs} defaultValue="tab1">
        <NTabsContent value="tab1">Content for tab 1</NTabsContent>
        <NTabsContent value="tab2">Content for tab 2</NTabsContent>
      </NTabs>,
    )
    expect(screen.getByText('Content for tab 1')).toBeInTheDocument()
  })

  it('renders all tab triggers as tab role', () => {
    render(<NTabs tabs={sampleTabs} />)
    const triggers = screen.getAllByRole('tab')
    expect(triggers).toHaveLength(2)
  })
})
