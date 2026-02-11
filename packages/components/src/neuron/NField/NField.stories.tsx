import type { Meta, StoryObj } from '@storybook/react'
import { NField } from './NField'
import { NInput } from '../NInput'

const meta: Meta<typeof NField> = {
  title: 'P2-Form/NField',
  component: NField,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NField>

export const Default: Story = {
  args: {
    label: 'Username',
    children: <NInput placeholder="Enter username..." />,
  },
}

export const Required: Story = {
  args: {
    label: 'Email',
    required: true,
    children: <NInput placeholder="you@example.com" />,
  },
}

export const WithError: Story = {
  args: {
    label: 'Password',
    required: true,
    error: 'Password must be at least 8 characters',
    children: <NInput type="password" placeholder="Enter password" invalid />,
  },
}
