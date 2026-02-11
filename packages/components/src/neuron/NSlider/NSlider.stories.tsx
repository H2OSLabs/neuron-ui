import type { Meta, StoryObj } from '@storybook/react'
import { NSlider } from './NSlider'

const meta: Meta<typeof NSlider> = {
  title: 'P2-Form/NSlider',
  component: NSlider,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NSlider>

export const Default: Story = {
  args: {
    value: 50,
  },
}

export const CustomRange: Story = {
  args: {
    value: 25,
    min: 0,
    max: 100,
    step: 5,
  },
}

export const SmallRange: Story = {
  args: {
    value: 3,
    min: 1,
    max: 10,
    step: 1,
  },
}
