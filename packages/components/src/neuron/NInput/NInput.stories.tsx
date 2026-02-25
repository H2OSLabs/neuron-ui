import type { Meta, StoryObj } from '@storybook/react'
import { NInput } from './NInput'

const meta: Meta<typeof NInput> = {
  title: 'P0-Core/NInput',
  component: NInput,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NInput>

export const Default: Story = {
  args: { placeholder: 'Enter text...' },
}

export const Invalid: Story = {
  args: { placeholder: 'Email', invalid: true, errorMessage: 'Invalid email address' },
}

export const Disabled: Story = {
  args: { placeholder: 'Disabled', disabled: true },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '300px' }}>
      <NInput placeholder="Small" size="sm" />
      <NInput placeholder="Medium" size="md" />
      <NInput placeholder="Large" size="lg" />
    </div>
  ),
}
