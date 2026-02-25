import type { Meta, StoryObj } from '@storybook/react'
import { NTooltip } from './NTooltip'

const meta: Meta<typeof NTooltip> = {
  title: 'P4-Auxiliary/NTooltip',
  component: NTooltip,
  tags: ['autodocs'],
  argTypes: {
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
    },
  },
}

export default meta
type Story = StoryObj<typeof NTooltip>

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    children: <button>Hover me</button>,
  },
}

export const Top: Story = {
  args: {
    content: 'Tooltip on top',
    side: 'top',
    children: <button>Top tooltip</button>,
  },
}

export const Right: Story = {
  args: {
    content: 'Tooltip on right',
    side: 'right',
    children: <button>Right tooltip</button>,
  },
}

export const Bottom: Story = {
  args: {
    content: 'Tooltip on bottom',
    side: 'bottom',
    children: <button>Bottom tooltip</button>,
  },
}

export const Left: Story = {
  args: {
    content: 'Tooltip on left',
    side: 'left',
    children: <button>Left tooltip</button>,
  },
}
