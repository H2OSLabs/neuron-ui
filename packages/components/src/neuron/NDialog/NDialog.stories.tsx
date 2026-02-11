import type { Meta, StoryObj } from '@storybook/react'
import { NDialog } from './NDialog'

const meta: Meta<typeof NDialog> = {
  title: 'P1-Container/NDialog',
  component: NDialog,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NDialog>

export const Default: Story = {
  args: {
    title: 'Dialog Title',
    trigger: <button>Open Dialog</button>,
    children: <p>This is the dialog content.</p>,
  },
}

export const WithDescription: Story = {
  args: {
    title: 'Confirm Action',
    description: 'Are you sure you want to proceed with this action?',
    trigger: <button>Open Dialog</button>,
    children: <p>Additional details about the action.</p>,
    footer: (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button>Cancel</button>
        <button>Confirm</button>
      </div>
    ),
  },
}
