import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { NSidebar } from './NSidebar'

const meta: Meta<typeof NSidebar> = {
  title: 'P1-Container/NSidebar',
  component: NSidebar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '400px', display: 'flex' }}>
        <Story />
        <div style={{ flex: 1, padding: '16px' }}>Main content area</div>
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof NSidebar>

const NavItems = ({ collapsed }: { collapsed?: boolean }) => (
  <div style={{ padding: '8px' }}>
    {['Dashboard', 'Users', 'Settings', 'Reports'].map((item) => (
      <div
        key={item}
        style={{
          padding: '8px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {collapsed ? item[0] : item}
      </div>
    ))}
  </div>
)

export const Default: Story = {
  render: () => {
    const [collapsed, setCollapsed] = useState(false)
    return (
      <NSidebar collapsed={collapsed} onCollapsedChange={setCollapsed}>
        <NavItems collapsed={collapsed} />
      </NSidebar>
    )
  },
}

export const Collapsed: Story = {
  render: () => {
    const [collapsed, setCollapsed] = useState(true)
    return (
      <NSidebar collapsed={collapsed} onCollapsedChange={setCollapsed}>
        <NavItems collapsed={collapsed} />
      </NSidebar>
    )
  },
}
