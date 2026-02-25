import type { Meta, StoryObj } from '@storybook/react'
import { NCard } from './NCard'

const meta: Meta<typeof NCard> = {
  title: 'P1-Container/NCard',
  component: NCard,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'cover-left', 'cover-top', 'profile', 'notification'],
    },
  },
}

export default meta
type Story = StoryObj<typeof NCard>

export const Default: Story = {
  args: {
    title: 'Card Title',
    description: 'Card description text goes here.',
    children: <p>This is the card body content.</p>,
  },
}

export const CoverTop: Story = {
  args: {
    title: 'Cover Top Card',
    description: 'This card has a cover-top variant.',
    variant: 'cover-top',
    children: <p>Content below the cover area.</p>,
  },
}

export const Profile: Story = {
  args: {
    title: 'John Doe',
    description: 'Software Engineer',
    variant: 'profile',
    children: <p>Profile details go here.</p>,
  },
}

export const Notification: Story = {
  args: {
    title: 'New Message',
    description: 'You have a new notification.',
    variant: 'notification',
  },
}

export const WithFooter: Story = {
  args: {
    title: 'Action Card',
    description: 'A card with footer actions.',
    children: <p>Some content here.</p>,
    footer: <button>Save</button>,
  },
}
