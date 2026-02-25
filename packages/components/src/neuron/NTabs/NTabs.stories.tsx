import type { Meta, StoryObj } from '@storybook/react'
import { NTabs, NTabsContent } from './NTabs'

const meta: Meta<typeof NTabs> = {
  title: 'P1-Container/NTabs',
  component: NTabs,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NTabs>

export const Default: Story = {
  args: {
    tabs: [
      { id: 'overview', label: 'Overview' },
      { id: 'settings', label: 'Settings' },
    ],
    children: (
      <>
        <NTabsContent value="overview">
          <p>Overview content goes here.</p>
        </NTabsContent>
        <NTabsContent value="settings">
          <p>Settings content goes here.</p>
        </NTabsContent>
      </>
    ),
  },
}

export const MultipleTabs: Story = {
  args: {
    tabs: [
      { id: 'general', label: 'General' },
      { id: 'security', label: 'Security' },
      { id: 'notifications', label: 'Notifications' },
      { id: 'billing', label: 'Billing' },
    ],
    children: (
      <>
        <NTabsContent value="general">
          <p>General settings and preferences.</p>
        </NTabsContent>
        <NTabsContent value="security">
          <p>Security and password settings.</p>
        </NTabsContent>
        <NTabsContent value="notifications">
          <p>Notification preferences.</p>
        </NTabsContent>
        <NTabsContent value="billing">
          <p>Billing and subscription info.</p>
        </NTabsContent>
      </>
    ),
  },
}
