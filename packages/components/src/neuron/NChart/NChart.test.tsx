import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NChart } from './NChart'

describe('NChart', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NChart />)
    expect(container.firstChild).toHaveAttribute(
      'data-neuron-component',
      'NChart',
    )
  })

  it('defaults to bar chart type', () => {
    const { container } = render(<NChart />)
    expect(container.firstChild).toHaveAttribute('data-neuron-variant', 'bar')
    expect(screen.getByText('Bar chart')).toBeInTheDocument()
  })

  it('renders line chart type', () => {
    const { container } = render(<NChart type="line" />)
    expect(container.firstChild).toHaveAttribute('data-neuron-variant', 'line')
    expect(screen.getByText('Line chart')).toBeInTheDocument()
  })

  it('renders pie chart type', () => {
    const { container } = render(<NChart type="pie" />)
    expect(container.firstChild).toHaveAttribute('data-neuron-variant', 'pie')
    expect(screen.getByText('Pie chart')).toBeInTheDocument()
  })

  it('shows data point count when data provided', () => {
    const data = [
      { name: 'A', value: 10 },
      { name: 'B', value: 20 },
    ]
    render(<NChart data={data} />)
    expect(screen.getByText('Bar chart (2 points)')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<NChart className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    render(<NChart ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
