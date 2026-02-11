import type { Meta, StoryObj } from '@storybook/react'
import { NInputOTP } from './NInputOTP'

const meta: Meta<typeof NInputOTP> = {
  title: 'P2-Form/NInputOTP',
  component: NInputOTP,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NInputOTP>

export const Default: Story = {
  args: {
    length: 6,
  },
}

export const FourDigits: Story = {
  args: {
    length: 4,
  },
}

export const EightDigits: Story = {
  args: {
    length: 8,
  },
}
