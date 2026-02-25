import type { Meta, StoryObj } from '@storybook/react'
import { NToggleGroup } from './NToggleGroup'

const meta: Meta<typeof NToggleGroup> = {
  title: 'P4-Auxiliary/NToggleGroup',
  component: NToggleGroup,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['single', 'multiple'],
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
}

export default meta
type Story = StoryObj<typeof NToggleGroup>

const textFormatItems = [
  { value: 'bold', label: 'Bold' },
  { value: 'italic', label: 'Italic' },
  { value: 'underline', label: 'Underline' },
]

export const Default: Story = {
  args: { items: textFormatItems },
}

export const Multiple: Story = {
  args: { items: textFormatItems, type: 'multiple' },
}

export const Vertical: Story = {
  args: { items: textFormatItems, orientation: 'vertical' },
}
