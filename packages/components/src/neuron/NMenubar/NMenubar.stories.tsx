import type { Meta, StoryObj } from '@storybook/react'
import { NMenubar } from './NMenubar'

const meta: Meta<typeof NMenubar> = {
  title: 'P4-Auxiliary/NMenubar',
  component: NMenubar,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NMenubar>

export const Default: Story = {
  args: {
    menus: [
      {
        label: 'File',
        items: [
          { label: 'New Tab' },
          { label: 'New Window' },
          { label: 'Share' },
          { label: 'Print' },
        ],
      },
      {
        label: 'Edit',
        items: [
          { label: 'Undo' },
          { label: 'Redo' },
          { label: 'Cut' },
          { label: 'Copy' },
          { label: 'Paste' },
        ],
      },
      {
        label: 'View',
        items: [
          { label: 'Zoom In' },
          { label: 'Zoom Out' },
          { label: 'Full Screen' },
        ],
      },
    ],
  },
}

export const Simple: Story = {
  args: {
    menus: [
      {
        label: 'File',
        items: [{ label: 'New' }, { label: 'Open' }, { label: 'Save' }],
      },
    ],
  },
}
