import { describe, it, expect } from 'vitest'
import { neuronCatalog } from '../catalog/neuron-catalog'

describe('neuronCatalog', () => {
  it('should have 53 registered components', () => {
    expect(Object.keys(neuronCatalog.components)).toHaveLength(53)
  })

  it('should have 9 registered actions', () => {
    expect(Object.keys(neuronCatalog.actions)).toHaveLength(9)
  })

  it('should have all expected action names', () => {
    const actionNames = Object.keys(neuronCatalog.actions)
    expect(actionNames).toContain('openDialog')
    expect(actionNames).toContain('closeDialog')
    expect(actionNames).toContain('openSheet')
    expect(actionNames).toContain('closeSheet')
    expect(actionNames).toContain('submitForm')
    expect(actionNames).toContain('deleteItem')
    expect(actionNames).toContain('refresh')
    expect(actionNames).toContain('navigate')
    expect(actionNames).toContain('toast')
  })

  it('should validate NButton props correctly', () => {
    const valid = neuronCatalog.validateElement('NButton', { label: 'Click me' })
    expect(valid.valid).toBe(true)
    expect(valid.errors).toHaveLength(0)
  })

  it('should reject invalid NButton props', () => {
    const invalid = neuronCatalog.validateElement('NButton', {})
    expect(invalid.valid).toBe(false)
    expect(invalid.errors.length).toBeGreaterThan(0)
  })

  it('should reject unknown component', () => {
    const result = neuronCatalog.validateElement('NUnknown', {})
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('Unknown component')
  })

  it('should validate NDataTable props', () => {
    const valid = neuronCatalog.validateElement('NDataTable', {
      columns: [{ key: 'name', label: 'Name' }],
      data: [{ name: 'Alice' }],
    })
    expect(valid.valid).toBe(true)
  })

  it('should generate a prompt string', () => {
    const prompt = neuronCatalog.prompt()
    expect(prompt).toContain('neuron-ui')
    expect(prompt).toContain('Components (53)')
    expect(prompt).toContain('Actions (9)')
    expect(prompt).toContain('NButton')
    expect(prompt).toContain('NDataTable')
    expect(prompt).toContain('openDialog')
  })

  it('should include all 7 component categories', () => {
    const components = neuronCatalog.components
    // Display
    expect(components.NText).toBeDefined()
    expect(components.NBadge).toBeDefined()
    expect(components.NChart).toBeDefined()
    // Input
    expect(components.NInput).toBeDefined()
    expect(components.NSelect).toBeDefined()
    // Action
    expect(components.NButton).toBeDefined()
    // Container
    expect(components.NCard).toBeDefined()
    expect(components.NDialog).toBeDefined()
    // Feedback
    expect(components.NToast).toBeDefined()
    // Navigation
    expect(components.NTabs).toBeDefined()
    // Layout
    expect(components.NResizable).toBeDefined()
  })
})
