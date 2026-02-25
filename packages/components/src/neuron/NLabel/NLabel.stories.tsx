import type { Meta, StoryObj } from '@storybook/react'
import { NLabel } from './NLabel'

const meta: Meta<typeof NLabel> = {
  title: 'P0-Core/NLabel',
  component: NLabel,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NLabel>

export const Default: Story = {
  args: { label: 'Username' },
}

export const Required: Story = {
  args: { label: 'Email', required: true },
}
