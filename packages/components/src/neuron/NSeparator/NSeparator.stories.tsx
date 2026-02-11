import type { Meta, StoryObj } from '@storybook/react'
import { NSeparator } from './NSeparator'

const meta: Meta<typeof NSeparator> = {
  title: 'P0-Core/NSeparator',
  component: NSeparator,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NSeparator>

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
}

export const Vertical: Story = {
  decorators: [(Story) => <div style={{ height: '100px', display: 'flex' }}><Story /></div>],
  args: { orientation: 'vertical' },
}
