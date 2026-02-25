import type { Meta, StoryObj } from '@storybook/react'
import { NTextarea } from './NTextarea'

const meta: Meta<typeof NTextarea> = {
  title: 'P2-Form/NTextarea',
  component: NTextarea,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NTextarea>

export const Default: Story = {
  args: {
    placeholder: 'Enter your message...',
  },
}

export const WithRows: Story = {
  args: {
    placeholder: 'Write a long description...',
    rows: 6,
  },
}

export const Invalid: Story = {
  args: {
    placeholder: 'Required field',
    invalid: true,
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled',
    disabled: true,
  },
}
