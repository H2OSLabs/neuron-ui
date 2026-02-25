import type { Meta, StoryObj } from '@storybook/react'
import { NSheet } from './NSheet'

const meta: Meta<typeof NSheet> = {
  title: 'P1-Container/NSheet',
  component: NSheet,
  tags: ['autodocs'],
  argTypes: {
    side: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
    },
  },
}

export default meta
type Story = StoryObj<typeof NSheet>

export const Right: Story = {
  args: {
    title: 'Right Sheet',
    description: 'This sheet slides in from the right.',
    side: 'right',
    trigger: <button>Open Right</button>,
    children: <p>Sheet content goes here.</p>,
  },
}

export const Left: Story = {
  args: {
    title: 'Left Sheet',
    description: 'This sheet slides in from the left.',
    side: 'left',
    trigger: <button>Open Left</button>,
    children: <p>Navigation or filter content.</p>,
  },
}
