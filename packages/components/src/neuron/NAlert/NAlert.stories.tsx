import type { Meta, StoryObj } from '@storybook/react'
import { NAlert } from './NAlert'

const meta: Meta<typeof NAlert> = {
  title: 'P3-Display/NAlert',
  component: NAlert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'warning', 'error', 'success'],
    },
  },
}

export default meta
type Story = StoryObj<typeof NAlert>

export const Info: Story = {
  args: {
    title: 'Information',
    description: 'This is an informational alert message.',
    variant: 'info',
  },
}

export const Warning: Story = {
  args: {
    title: 'Warning',
    description: 'This action may have unintended consequences.',
    variant: 'warning',
  },
}

export const Error: Story = {
  args: {
    title: 'Error',
    description: 'Something went wrong. Please try again.',
    variant: 'error',
  },
}

export const Success: Story = {
  args: {
    title: 'Success',
    description: 'Your changes have been saved successfully.',
    variant: 'success',
  },
}

export const DescriptionOnly: Story = {
  args: {
    description: 'A simple alert without a title.',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <NAlert title="Info" description="Informational message." variant="info" />
      <NAlert title="Warning" description="Warning message." variant="warning" />
      <NAlert title="Error" description="Error message." variant="error" />
      <NAlert title="Success" description="Success message." variant="success" />
    </div>
  ),
}
