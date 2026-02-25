import type { Meta, StoryObj } from '@storybook/react'
import { NAvatar } from './NAvatar'

const meta: Meta<typeof NAvatar> = {
  title: 'P0-Core/NAvatar',
  component: NAvatar,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NAvatar>

export const Default: Story = {
  args: { fallback: 'JD', alt: 'John Doe' },
}

export const WithStatus: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <NAvatar fallback="ON" status="online" />
      <NAvatar fallback="OF" status="offline" />
      <NAvatar fallback="BU" status="busy" />
      <NAvatar fallback="AW" status="away" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <NAvatar fallback="S" size="sm" />
      <NAvatar fallback="M" size="md" />
      <NAvatar fallback="L" size="lg" />
    </div>
  ),
}

export const Square: Story = {
  args: { fallback: 'SQ', shape: 'square' },
}
