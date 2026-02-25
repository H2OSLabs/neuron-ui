import type { Meta, StoryObj } from '@storybook/react'
import { NResizable } from './NResizable'

const meta: Meta<typeof NResizable> = {
  title: 'P4-Auxiliary/NResizable',
  component: NResizable,
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
}

export default meta
type Story = StoryObj<typeof NResizable>

export const Horizontal: Story = {
  args: {
    direction: 'horizontal',
    children: (
      <div style={{ padding: '16px', minWidth: '200px' }}>
        Drag the right edge to resize horizontally.
      </div>
    ),
  },
}

export const Vertical: Story = {
  args: {
    direction: 'vertical',
    children: (
      <div style={{ padding: '16px', minHeight: '100px' }}>
        Drag the bottom edge to resize vertically.
      </div>
    ),
  },
}
