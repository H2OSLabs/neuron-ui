import type { Meta, StoryObj } from '@storybook/react'
import { NHoverCard } from './NHoverCard'

const meta: Meta<typeof NHoverCard> = {
  title: 'P3-Display/NHoverCard',
  component: NHoverCard,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NHoverCard>

export const Default: Story = {
  args: {
    triggerText: 'Hover over me',
  },
}

export const WithContent: Story = {
  args: {
    triggerText: '@username',
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ fontWeight: 600, fontSize: '14px' }}>John Doe</p>
        <p style={{ fontSize: '12px', color: '#666' }}>
          Software engineer working on neuron-ui components.
        </p>
      </div>
    ),
  },
}
