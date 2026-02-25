import type { Meta, StoryObj } from '@storybook/react'
import { NScrollArea } from './NScrollArea'

const meta: Meta<typeof NScrollArea> = {
  title: 'P1-Container/NScrollArea',
  component: NScrollArea,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal', 'both'],
    },
  },
}

export default meta
type Story = StoryObj<typeof NScrollArea>

const VerticalContent = () => (
  <div>
    {Array.from({ length: 20 }, (_, i) => (
      <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
        Item {i + 1}
      </div>
    ))}
  </div>
)

const HorizontalContent = () => (
  <div style={{ display: 'flex', gap: '16px', width: '1200px' }}>
    {Array.from({ length: 15 }, (_, i) => (
      <div
        key={i}
        style={{
          minWidth: '120px',
          height: '80px',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
        }}
      >
        Card {i + 1}
      </div>
    ))}
  </div>
)

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    maxHeight: '250px',
    children: <VerticalContent />,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
}

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
    maxWidth: '400px',
    children: <HorizontalContent />,
  },
}
