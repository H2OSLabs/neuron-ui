import type { Meta, StoryObj } from '@storybook/react'
import { NBadge } from './NBadge'

const meta: Meta<typeof NBadge> = {
  title: 'P0-Core/NBadge',
  component: NBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
    color: {
      control: 'select',
      options: ['pink', 'pink-light', 'yellow', 'yellow-bright', 'lime', 'lime-light', 'green', 'blue', 'purple', 'lavender'],
    },
  },
}

export default meta
type Story = StoryObj<typeof NBadge>

export const Default: Story = {
  args: { label: 'Badge' },
}

export const AccentColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <NBadge label="Pink" color="pink" />
      <NBadge label="Yellow" color="yellow" />
      <NBadge label="Lime" color="lime" />
      <NBadge label="Green" color="green" />
      <NBadge label="Blue" color="blue" />
      <NBadge label="Purple" color="purple" />
      <NBadge label="Lavender" color="lavender" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <NBadge label="Small" size="sm" />
      <NBadge label="Medium" size="md" />
    </div>
  ),
}
