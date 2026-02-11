import type { Meta, StoryObj } from '@storybook/react'
import { NPopover } from './NPopover'

const meta: Meta<typeof NPopover> = {
  title: 'P4-Auxiliary/NPopover',
  component: NPopover,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NPopover>

export const Default: Story = {
  args: {
    triggerLabel: 'Open Popover',
    children: (
      <div>
        <p style={{ fontWeight: 600, marginBottom: '8px' }}>Popover Content</p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          This is the popover body. You can put any content here.
        </p>
      </div>
    ),
  },
}

export const CustomTrigger: Story = {
  args: {
    triggerLabel: 'Settings',
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '14px' }}>Width: 100%</label>
        <label style={{ fontSize: '14px' }}>Height: auto</label>
      </div>
    ),
  },
}
