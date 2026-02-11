import type { Meta, StoryObj } from '@storybook/react'
import { NButton } from './NButton'

const meta: Meta<typeof NButton> = {
  title: 'P0-Core/NButton',
  component: NButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'icon'],
    },
  },
}

export default meta
type Story = StoryObj<typeof NButton>

export const Default: Story = {
  args: { label: 'Button' },
}

export const Destructive: Story = {
  args: { label: 'Delete', variant: 'destructive' },
}

export const Outline: Story = {
  args: { label: 'Outline', variant: 'outline' },
}

export const Secondary: Story = {
  args: { label: 'Secondary', variant: 'secondary' },
}

export const Ghost: Story = {
  args: { label: 'Ghost', variant: 'ghost' },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <NButton label="XS" size="xs" />
      <NButton label="SM" size="sm" />
      <NButton label="MD" size="md" />
      <NButton label="LG" size="lg" />
      <NButton label="XL" size="xl" />
    </div>
  ),
}

export const Disabled: Story = {
  args: { label: 'Disabled', disabled: true },
}
