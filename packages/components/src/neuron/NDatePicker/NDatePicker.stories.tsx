import type { Meta, StoryObj } from '@storybook/react'
import { NDatePicker } from './NDatePicker'

const meta: Meta<typeof NDatePicker> = {
  title: 'P2-Form/NDatePicker',
  component: NDatePicker,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NDatePicker>

export const Default: Story = {
  args: {},
}

export const WithValue: Story = {
  args: {
    value: '2025-06-15',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}
