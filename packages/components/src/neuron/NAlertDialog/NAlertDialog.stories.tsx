import type { Meta, StoryObj } from '@storybook/react'
import { NAlertDialog } from './NAlertDialog'

const meta: Meta<typeof NAlertDialog> = {
  title: 'P1-Container/NAlertDialog',
  component: NAlertDialog,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NAlertDialog>

export const Default: Story = {
  args: {
    title: 'Are you sure?',
    description: 'This action cannot be undone. This will permanently delete your account.',
    trigger: <button>Delete Account</button>,
  },
}

export const DestructiveConfirm: Story = {
  args: {
    title: 'Delete all data',
    description: 'This will permanently delete all your data. This action cannot be reversed.',
    confirmLabel: 'Yes, delete everything',
    cancelLabel: 'No, keep my data',
    destructive: true,
    trigger: <button>Delete All</button>,
  },
}
