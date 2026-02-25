import type { Meta, StoryObj } from '@storybook/react'
import { NSkeleton } from './NSkeleton'

const meta: Meta<typeof NSkeleton> = {
  title: 'P3-Display/NSkeleton',
  component: NSkeleton,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NSkeleton>

export const Default: Story = {
  args: {
    width: '200px',
    height: '20px',
  },
}

export const Rounded: Story = {
  args: {
    width: '48px',
    height: '48px',
    rounded: true,
  },
}

export const CardSkeleton: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '300px' }}>
      <NSkeleton width="300px" height="200px" />
      <NSkeleton width="200px" height="16px" />
      <NSkeleton width="260px" height="12px" />
      <NSkeleton width="240px" height="12px" />
    </div>
  ),
}

export const ProfileSkeleton: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <NSkeleton width="48px" height="48px" rounded />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <NSkeleton width="120px" height="16px" />
        <NSkeleton width="80px" height="12px" />
      </div>
    </div>
  ),
}
