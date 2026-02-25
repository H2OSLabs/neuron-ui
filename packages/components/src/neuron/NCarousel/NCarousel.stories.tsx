import type { Meta, StoryObj } from '@storybook/react'
import { NCarousel } from './NCarousel'

const meta: Meta<typeof NCarousel> = {
  title: 'P3-Display/NCarousel',
  component: NCarousel,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NCarousel>

export const Default: Story = {
  args: {
    items: ['Slide 1', 'Slide 2', 'Slide 3', 'Slide 4', 'Slide 5'],
  },
}

export const Empty: Story = {
  args: {},
}

export const TwoItems: Story = {
  args: {
    items: ['First', 'Second'],
  },
}
