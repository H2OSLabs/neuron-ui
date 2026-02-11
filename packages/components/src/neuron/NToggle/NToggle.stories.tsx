import type { Meta, StoryObj } from '@storybook/react'
import { NToggle } from './NToggle'

const meta: Meta<typeof NToggle> = {
  title: 'P4-Auxiliary/NToggle',
  component: NToggle,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NToggle>

export const Default: Story = {
  args: { children: 'Bold' },
}

export const Pressed: Story = {
  args: { children: 'Bold', pressed: true },
}

export const Disabled: Story = {
  args: { children: 'Bold', disabled: true },
}
