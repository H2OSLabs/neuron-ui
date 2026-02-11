import type { Meta, StoryObj } from '@storybook/react'
import { NToast } from './NToast'

const meta: Meta<typeof NToast> = {
  title: 'P4-Auxiliary/NToast',
  component: NToast,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'error', 'warning'],
    },
  },
}

export default meta
type Story = StoryObj<typeof NToast>

export const Default: Story = {
  args: { title: 'Notification', description: 'Something happened.' },
}

export const Success: Story = {
  args: { title: 'Success', description: 'Operation completed.', variant: 'success' },
}

export const Error: Story = {
  args: { title: 'Error', description: 'Something went wrong.', variant: 'error' },
}

export const Warning: Story = {
  args: { title: 'Warning', description: 'Please check your input.', variant: 'warning' },
}

export const TitleOnly: Story = {
  args: { title: 'Simple notification' },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '400px' }}>
      <NToast title="Default" description="Default toast" variant="default" />
      <NToast title="Success" description="Success toast" variant="success" />
      <NToast title="Error" description="Error toast" variant="error" />
      <NToast title="Warning" description="Warning toast" variant="warning" />
    </div>
  ),
}
