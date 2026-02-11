import type { Meta, StoryObj } from '@storybook/react'
import { NCommand } from './NCommand'

const meta: Meta<typeof NCommand> = {
  title: 'P4-Auxiliary/NCommand',
  component: NCommand,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NCommand>

const defaultItems = [
  { label: 'Calendar', value: 'calendar' },
  { label: 'Search Emoji', value: 'search-emoji' },
  { label: 'Calculator', value: 'calculator' },
  { label: 'Settings', value: 'settings' },
  { label: 'Profile', value: 'profile' },
]

export const Default: Story = {
  args: {
    placeholder: 'Type a command or search...',
    items: defaultItems,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '400px' }}>
        <Story />
      </div>
    ),
  ],
}

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Search actions...',
    items: defaultItems,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '400px' }}>
        <Story />
      </div>
    ),
  ],
}

export const Empty: Story = {
  args: {
    items: [],
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '400px' }}>
        <Story />
      </div>
    ),
  ],
}
