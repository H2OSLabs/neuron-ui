import type { Meta, StoryObj } from '@storybook/react'
import { NBreadcrumb } from './NBreadcrumb'

const meta: Meta<typeof NBreadcrumb> = {
  title: 'P1-Container/NBreadcrumb',
  component: NBreadcrumb,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NBreadcrumb>

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Library', href: '/library' },
      { label: 'Current Page' },
    ],
  },
}

export const WithLinks: Story = {
  args: {
    items: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Settings', href: '/dashboard/settings' },
      { label: 'Profile', href: '/dashboard/settings/profile' },
      { label: 'Edit' },
    ],
  },
}

export const CustomSeparator: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Detail' },
    ],
    separator: '>',
  },
}
