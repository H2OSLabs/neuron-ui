import type { Meta, StoryObj } from '@storybook/react'
import { NRadioGroup } from './NRadioGroup'

const meta: Meta<typeof NRadioGroup> = {
  title: 'P2-Form/NRadioGroup',
  component: NRadioGroup,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NRadioGroup>

const sizes = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
]

export const Default: Story = {
  args: {
    options: sizes,
  },
}

export const WithValue: Story = {
  args: {
    options: sizes,
    value: 'medium',
  },
}

export const WithDisabled: Story = {
  args: {
    options: [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B', disabled: true },
      { value: 'c', label: 'Option C' },
    ],
  },
}
