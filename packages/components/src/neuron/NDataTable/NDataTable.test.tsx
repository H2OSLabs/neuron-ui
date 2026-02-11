import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NDataTable } from './NDataTable'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'age', label: 'Age' },
]

const data = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
]

describe('NDataTable', () => {
  it('renders with data-neuron-component attribute', () => {
    const { container } = render(<NDataTable columns={columns} data={data} />)
    expect(container.firstChild).toHaveAttribute(
      'data-neuron-component',
      'NDataTable',
    )
  })

  it('renders column headers', () => {
    render(<NDataTable columns={columns} data={data} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()
  })

  it('renders data rows', () => {
    render(<NDataTable columns={columns} data={data} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
  })

  it('renders empty table when no data', () => {
    render(<NDataTable columns={columns} data={[]} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <NDataTable columns={columns} data={data} className="custom-class" />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
