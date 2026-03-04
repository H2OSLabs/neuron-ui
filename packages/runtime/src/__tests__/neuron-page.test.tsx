import { describe, it, expect } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import { NeuronPage } from '../NeuronPage'
import type { PageSchema } from '../types'

const validSchema: PageSchema = {
  version: '1.0.0',
  page: { id: 'test', name: 'Test' },
  tree: [{ id: 'root', component: 'NText', props: { text: 'Hello World' } }],
}

describe('NeuronPage', () => {
  it('renders without crashing for a valid schema', () => {
    const { container } = render(<NeuronPage schema={validSchema} />)
    expect(container).toBeDefined()
  })

  it('renders error fallback for invalid schema', () => {
    const invalidSchema = { version: '1.0.0', page: { id: 'x', name: 'X' }, tree: null } as unknown as PageSchema
    const { container } = render(<NeuronPage schema={invalidSchema} />)
    expect(container.textContent).toContain('Invalid Page Schema')
  })

  it('uses custom error component when provided', () => {
    const invalidSchema = { version: '1.0.0', page: { id: 'x', name: 'X' }, tree: null } as unknown as PageSchema
    const ErrorComp = ({ error }: { error: Error }) => <div>Error: {error.message}</div>
    const { container } = render(<NeuronPage schema={invalidSchema} error={ErrorComp} />)
    expect(container.textContent).toContain('Error: Invalid Page Schema')
  })
})
