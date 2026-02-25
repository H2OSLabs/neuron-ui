import type { Meta, StoryObj } from '@storybook/react'
import { NChart } from './NChart'

const meta: Meta<typeof NChart> = {
  title: 'P3-Display/NChart',
  component: NChart,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['bar', 'line', 'pie'],
    },
  },
}

export default meta
type Story = StoryObj<typeof NChart>

const sampleData = [
  { name: 'Jan', value: 100 },
  { name: 'Feb', value: 200 },
  { name: 'Mar', value: 150 },
  { name: 'Apr', value: 300 },
  { name: 'May', value: 250 },
]

export const Bar: Story = {
  args: {
    type: 'bar',
    data: sampleData,
  },
}

export const Line: Story = {
  args: {
    type: 'line',
    data: sampleData,
  },
}

export const Pie: Story = {
  args: {
    type: 'pie',
    data: sampleData,
  },
}

export const Empty: Story = {
  args: {
    type: 'bar',
  },
}

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <NChart type="bar" data={sampleData} />
      <NChart type="line" data={sampleData} />
      <NChart type="pie" data={sampleData} />
    </div>
  ),
}
