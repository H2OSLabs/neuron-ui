import type { Meta, StoryObj } from '@storybook/react'
import { NPagination } from './NPagination'

const meta: Meta<typeof NPagination> = {
  title: 'P3-Display/NPagination',
  component: NPagination,
  tags: ['autodocs'],
  argTypes: {
    currentPage: { control: { type: 'number', min: 1 } },
    totalPages: { control: { type: 'number', min: 1 } },
  },
}

export default meta
type Story = StoryObj<typeof NPagination>

export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 5,
  },
}

export const MiddlePage: Story = {
  args: {
    currentPage: 3,
    totalPages: 5,
  },
}

export const LastPage: Story = {
  args: {
    currentPage: 5,
    totalPages: 5,
  },
}

export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1,
  },
}
