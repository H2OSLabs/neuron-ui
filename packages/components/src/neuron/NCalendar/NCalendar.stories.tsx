import type { Meta, StoryObj } from '@storybook/react'
import { NCalendar } from './NCalendar'

const meta: Meta<typeof NCalendar> = {
  title: 'P3-Display/NCalendar',
  component: NCalendar,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NCalendar>

export const Default: Story = {}
