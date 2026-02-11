import type { Meta, StoryObj } from '@storybook/react'
import { NCombobox } from './NCombobox'

const meta: Meta<typeof NCombobox> = {
  title: 'P2-Form/NCombobox',
  component: NCombobox,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NCombobox>

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'grape', label: 'Grape' },
  { value: 'mango', label: 'Mango' },
  { value: 'orange', label: 'Orange' },
]

export const Default: Story = {
  args: {
    options: fruits,
    placeholder: 'Select a fruit...',
  },
}

export const WithValue: Story = {
  args: {
    options: fruits,
    value: 'cherry',
  },
}

export const NotSearchable: Story = {
  args: {
    options: fruits,
    placeholder: 'Pick one...',
    searchable: false,
  },
}
