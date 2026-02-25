import type { Meta, StoryObj } from '@storybook/react'
import { NDataTable } from './NDataTable'

const meta: Meta<typeof NDataTable> = {
  title: 'P3-Display/NDataTable',
  component: NDataTable,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NDataTable>

const sampleColumns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
]

const sampleData = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'Viewer' },
]

export const Default: Story = {
  args: {
    columns: sampleColumns,
    data: sampleData,
  },
}

export const Empty: Story = {
  args: {
    columns: sampleColumns,
    data: [],
  },
}

export const SingleRow: Story = {
  args: {
    columns: sampleColumns,
    data: [sampleData[0]],
  },
}
