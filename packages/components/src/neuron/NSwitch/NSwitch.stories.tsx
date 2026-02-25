import type { Meta, StoryObj } from '@storybook/react'
import { NSwitch } from './NSwitch'

const meta: Meta<typeof NSwitch> = {
  title: 'P2-Form/NSwitch',
  component: NSwitch,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NSwitch>

export const Default: Story = {
  args: {
    label: 'Enable notifications',
  },
}

export const Checked: Story = {
  args: {
    label: 'Dark mode',
    checked: true,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Unavailable',
    disabled: true,
  },
}

export const NoLabel: Story = {
  args: {},
}
