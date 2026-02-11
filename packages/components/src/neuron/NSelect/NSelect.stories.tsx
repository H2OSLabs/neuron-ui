import type { Meta, StoryObj } from '@storybook/react'
import { NSelect } from './NSelect'

const meta: Meta<typeof NSelect> = {
  title: 'P2-Form/NSelect',
  component: NSelect,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NSelect>

const colors = [
  { value: 'red', label: 'Red' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'yellow', label: 'Yellow' },
]

export const Default: Story = {
  args: {
    options: colors,
    placeholder: 'Select a color...',
  },
}

export const WithValue: Story = {
  args: {
    options: colors,
    value: 'blue',
  },
}
