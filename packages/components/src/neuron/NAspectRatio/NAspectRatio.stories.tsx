import type { Meta, StoryObj } from '@storybook/react'
import { NAspectRatio } from './NAspectRatio'

const meta: Meta<typeof NAspectRatio> = {
  title: 'P1-Container/NAspectRatio',
  component: NAspectRatio,
  tags: ['autodocs'],
  argTypes: {
    ratio: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof NAspectRatio>

const PlaceholderImage = ({ label }: { label: string }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#e5e5e5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      color: '#737373',
    }}
  >
    {label}
  </div>
)

export const Ratio16x9: Story = {
  args: {
    ratio: 16 / 9,
    children: <PlaceholderImage label="16:9" />,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
}

export const Ratio4x3: Story = {
  args: {
    ratio: 4 / 3,
    children: <PlaceholderImage label="4:3" />,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
}

export const Ratio1x1: Story = {
  args: {
    ratio: 1,
    children: <PlaceholderImage label="1:1" />,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
}
