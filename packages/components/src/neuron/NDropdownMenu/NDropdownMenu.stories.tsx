import type { Meta, StoryObj } from '@storybook/react'
import { NDropdownMenu } from './NDropdownMenu'

const meta: Meta<typeof NDropdownMenu> = {
  title: 'P3-Display/NDropdownMenu',
  component: NDropdownMenu,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NDropdownMenu>

export const Default: Story = {
  args: {
    items: [
      { label: 'Edit' },
      { label: 'Duplicate' },
      { label: 'Delete' },
    ],
    triggerLabel: 'Actions',
  },
}

export const WithDisabledItems: Story = {
  args: {
    items: [
      { label: 'Edit' },
      { label: 'Delete', disabled: true },
    ],
    triggerLabel: 'Options',
  },
}
