import type { Meta, StoryObj } from '@storybook/react'
import { NInputGroup } from './NInputGroup'
import { NInput } from '../NInput'

const meta: Meta<typeof NInputGroup> = {
  title: 'P2-Form/NInputGroup',
  component: NInputGroup,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NInputGroup>

export const Default: Story = {
  args: {
    label: 'Username',
    children: <NInput placeholder="Enter username..." />,
  },
}

export const WithIcon: Story = {
  args: {
    label: 'Email',
    icon: '@',
    children: <NInput placeholder="you@example.com" />,
  },
}

export const NoLabel: Story = {
  args: {
    children: <NInput placeholder="Search..." />,
  },
}
