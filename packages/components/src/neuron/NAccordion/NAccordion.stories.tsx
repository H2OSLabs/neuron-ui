import type { Meta, StoryObj } from '@storybook/react'
import { NAccordion } from './NAccordion'

const meta: Meta<typeof NAccordion> = {
  title: 'P3-Display/NAccordion',
  component: NAccordion,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NAccordion>

export const Default: Story = {
  args: {
    items: [
      {
        id: 'faq-1',
        title: 'What is neuron-ui?',
        content:
          'neuron-ui is an AI-driven frontend page auto-generation component library.',
      },
      {
        id: 'faq-2',
        title: 'How does it work?',
        content:
          'Users provide API lists and TaskCase descriptions. AI generates frontend pages using a component-to-API mapping system.',
      },
      {
        id: 'faq-3',
        title: 'Can I customize the components?',
        content:
          'Yes, all components support className props and can be styled with Tailwind CSS.',
      },
    ],
  },
}

export const SingleItem: Story = {
  args: {
    items: [
      {
        id: 'single',
        title: 'Click to expand',
        content: 'This is the expanded content.',
      },
    ],
  },
}
