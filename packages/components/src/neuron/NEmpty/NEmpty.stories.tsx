import type { Meta, StoryObj } from '@storybook/react'
import { NEmpty } from './NEmpty'

const meta: Meta<typeof NEmpty> = {
  title: 'P3-Display/NEmpty',
  component: NEmpty,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NEmpty>

export const Default: Story = {}

export const WithDescription: Story = {
  args: {
    title: 'No results found',
    description: 'Try adjusting your search or filter criteria.',
  },
}

export const WithAction: Story = {
  args: {
    title: 'No items yet',
    description: 'Get started by creating your first item.',
    actionLabel: 'Create Item',
  },
}
