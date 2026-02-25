import type { Meta, StoryObj } from '@storybook/react'
import { NText } from './NText'

const meta: Meta<typeof NText> = {
  title: 'P0-Core/NText',
  component: NText,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NText>

export const Default: Story = {
  args: { text: 'This is body text.' },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <NText text="Display (48px)" size="display" weight="bold" />
      <NText text="Heading (36px)" size="heading" weight="bold" />
      <NText text="Subheading (28px)" size="subheading" weight="bold" />
      <NText text="Section (24px)" size="section" weight="medium" />
      <NText text="Body Large (18px)" size="body-lg" />
      <NText text="Body (14px)" size="body" />
      <NText text="Caption (12px)" size="caption" color="muted" />
    </div>
  ),
}

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <NText text="Default" color="default" />
      <NText text="Muted" color="muted" />
      <NText text="Error" color="error" />
      <NText text="Success" color="success" />
      <NText text="Warning" color="warning" />
    </div>
  ),
}
