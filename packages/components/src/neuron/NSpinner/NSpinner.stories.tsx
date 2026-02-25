import type { Meta, StoryObj } from '@storybook/react'
import { NSpinner } from './NSpinner'

const meta: Meta<typeof NSpinner> = {
  title: 'P0-Core/NSpinner',
  component: NSpinner,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NSpinner>

export const Default: Story = {
  args: {},
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <NSpinner size="sm" />
      <NSpinner size="md" />
      <NSpinner size="lg" />
    </div>
  ),
}
