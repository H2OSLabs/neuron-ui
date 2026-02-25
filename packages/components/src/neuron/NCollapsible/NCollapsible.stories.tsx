import type { Meta, StoryObj } from '@storybook/react'
import { NCollapsible } from './NCollapsible'

const meta: Meta<typeof NCollapsible> = {
  title: 'P1-Container/NCollapsible',
  component: NCollapsible,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NCollapsible>

export const Default: Story = {
  args: {
    title: 'Click to expand',
    children: (
      <div style={{ padding: '8px', border: '1px solid #eee', borderRadius: '6px' }}>
        <p>This content is collapsible. Click the header to toggle visibility.</p>
      </div>
    ),
  },
}

export const InitiallyOpen: Story = {
  args: {
    title: 'Already expanded',
    defaultOpen: true,
    children: (
      <div style={{ padding: '8px', border: '1px solid #eee', borderRadius: '6px' }}>
        <p>This section starts open by default.</p>
        <p>You can click the header to collapse it.</p>
      </div>
    ),
  },
}
