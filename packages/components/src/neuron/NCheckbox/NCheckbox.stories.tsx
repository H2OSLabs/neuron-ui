import type { Meta, StoryObj } from '@storybook/react'
import { NCheckbox } from './NCheckbox'

const meta: Meta<typeof NCheckbox> = {
  title: 'P2-Form/NCheckbox',
  component: NCheckbox,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NCheckbox>

export const Default: Story = {
  args: {
    label: 'Accept terms and conditions',
  },
}

export const Checked: Story = {
  args: {
    label: 'I agree',
    checked: true,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled option',
    disabled: true,
  },
}

export const NoLabel: Story = {
  args: {},
}
