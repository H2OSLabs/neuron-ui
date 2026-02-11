import type { Meta, StoryObj } from '@storybook/react'
import { NDrawer } from './NDrawer'

const meta: Meta<typeof NDrawer> = {
  title: 'P1-Container/NDrawer',
  component: NDrawer,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NDrawer>

export const Default: Story = {
  args: {
    title: 'Bottom Drawer',
    trigger: <button>Open Drawer</button>,
    children: (
      <div style={{ padding: '16px 0' }}>
        <p>This is a bottom drawer panel.</p>
        <p>Swipe down or click overlay to close.</p>
      </div>
    ),
  },
}
