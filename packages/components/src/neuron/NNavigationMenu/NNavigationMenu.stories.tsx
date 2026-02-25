import type { Meta, StoryObj } from '@storybook/react'
import { NNavigationMenu } from './NNavigationMenu'

const meta: Meta<typeof NNavigationMenu> = {
  title: 'P4-Auxiliary/NNavigationMenu',
  component: NNavigationMenu,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NNavigationMenu>

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Services', href: '/services' },
      { label: 'Contact', href: '/contact' },
    ],
  },
}

export const Simple: Story = {
  args: {
    items: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Settings', href: '/settings' },
    ],
  },
}

export const NoHrefs: Story = {
  args: {
    items: [
      { label: 'Tab One' },
      { label: 'Tab Two' },
      { label: 'Tab Three' },
    ],
  },
}
