import type { Meta, StoryObj } from '@storybook/react'
import { NKbd } from './NKbd'

const meta: Meta<typeof NKbd> = {
  title: 'P4-Auxiliary/NKbd',
  component: NKbd,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NKbd>

export const SingleKey: Story = {
  args: { keys: 'Enter' },
}

export const KeyCombination: Story = {
  args: { keys: ['Ctrl', 'K'] },
}

export const ThreeKeys: Story = {
  args: { keys: ['Ctrl', 'Shift', 'P'] },
}

export const AllShortcuts: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', minWidth: '120px' }}>Command Palette</span>
        <NKbd keys={['Ctrl', 'K']} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', minWidth: '120px' }}>Save</span>
        <NKbd keys={['Ctrl', 'S']} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', minWidth: '120px' }}>Undo</span>
        <NKbd keys={['Ctrl', 'Z']} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', minWidth: '120px' }}>Escape</span>
        <NKbd keys="Esc" />
      </div>
    </div>
  ),
}
