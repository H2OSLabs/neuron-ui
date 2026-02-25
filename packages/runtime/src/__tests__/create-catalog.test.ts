import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { createCatalog } from '../catalog/create-catalog'

describe('createCatalog', () => {
  const catalog = createCatalog({
    name: 'test-catalog',
    components: {
      TestButton: {
        props: z.object({ label: z.string() }),
        description: 'A test button',
      },
      TestCard: {
        props: z.object({ title: z.string().optional() }),
        hasChildren: true,
        description: 'A test card',
      },
    },
    actions: {
      testAction: {
        params: z.object({ target: z.string() }),
        description: 'A test action',
      },
    },
  })

  it('should create a catalog with the correct name', () => {
    expect(catalog.name).toBe('test-catalog')
  })

  it('should register components', () => {
    expect(Object.keys(catalog.components)).toHaveLength(2)
    expect(catalog.components.TestButton).toBeDefined()
  })

  it('should register actions', () => {
    expect(Object.keys(catalog.actions)).toHaveLength(1)
    expect(catalog.actions.testAction).toBeDefined()
  })

  it('should validate valid props', () => {
    const result = catalog.validateElement('TestButton', { label: 'Click' })
    expect(result.valid).toBe(true)
  })

  it('should reject invalid props', () => {
    const result = catalog.validateElement('TestButton', { label: 123 })
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('should reject unknown components', () => {
    const result = catalog.validateElement('Unknown', {})
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('Unknown component')
  })

  it('should generate a prompt', () => {
    const prompt = catalog.prompt()
    expect(prompt).toContain('test-catalog')
    expect(prompt).toContain('Components (2)')
    expect(prompt).toContain('Actions (1)')
    expect(prompt).toContain('TestButton')
    expect(prompt).toContain('testAction')
  })
})
