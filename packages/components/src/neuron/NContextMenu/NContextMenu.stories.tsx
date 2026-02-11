import type { Meta, StoryObj } from '@storybook/react'
import { NContextMenu } from './NContextMenu'

const meta: Meta<typeof NContextMenu> = {
  title: 'P3-Display/NContextMenu',
  component: NContextMenu,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NContextMenu>

export const Default: Story = {
  args: {
    items: [
      { label: 'Copy' },
      { label: 'Cut' },
      { label: 'Paste' },
      { label: 'Delete' },
    ],
  },
}

export const WithCustomTrigger: Story = {
  args: {
    items: [{ label: 'Edit' }, { label: 'Remove' }],
    children: (
      <div style={{ padding: '24px', border: '1px solid #ccc', borderRadius: '8px' }}>
        Right-click on this card
      </div>
    ),
  },
}
