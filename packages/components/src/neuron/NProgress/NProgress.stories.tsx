import type { Meta, StoryObj } from '@storybook/react'
import { NProgress } from './NProgress'

const meta: Meta<typeof NProgress> = {
  title: 'P3-Display/NProgress',
  component: NProgress,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    max: { control: { type: 'number' } },
  },
}

export default meta
type Story = StoryObj<typeof NProgress>

export const Default: Story = {
  args: { value: 50 },
}

export const Empty: Story = {
  args: { value: 0 },
}

export const Full: Story = {
  args: { value: 100 },
}

export const CustomMax: Story = {
  args: { value: 3, max: 10 },
}

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <NProgress value={0} />
      <NProgress value={25} />
      <NProgress value={50} />
      <NProgress value={75} />
      <NProgress value={100} />
    </div>
  ),
}
