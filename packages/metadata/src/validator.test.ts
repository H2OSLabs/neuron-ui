import { describe, it, expect } from 'vitest'
import { validateManifest, getComponent, getComponentsByCategory, canBeChildOf } from './validator'
import manifestJson from '../component-manifest.json'
import type { ComponentManifest } from './types'

const manifest = manifestJson as unknown as ComponentManifest

describe('validateManifest', () => {
  it('should validate the actual component-manifest.json without errors', () => {
    const result = validateManifest(manifest)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should contain exactly 53 components', () => {
    expect(manifest.components).toHaveLength(53)
    expect(manifest.totalComponents).toBe(53)
  })

  it('should detect missing version', () => {
    const result = validateManifest({ ...manifest, version: '' } as ComponentManifest)
    expect(result.errors.some(e => e.path === 'version')).toBe(true)
  })

  it('should detect invalid component name', () => {
    const bad = {
      ...manifest,
      components: [
        ...manifest.components,
        { name: 'badName', displayName: 'Bad', description: 'bad', category: 'display', importPath: '@neuron-ui/components', schemaPath: '', variants: [], sizes: [], props: [], slots: [], canBeChildOf: [], canContain: [], apiRole: {} },
      ],
    } as ComponentManifest
    const result = validateManifest(bad)
    expect(result.errors.some(e => e.rule === 'component')).toBe(true)
  })

  it('should detect duplicate component names', () => {
    const firstComp = manifest.components[0]
    const bad = {
      ...manifest,
      components: [...manifest.components, { ...firstComp }],
    } as ComponentManifest
    const result = validateManifest(bad)
    expect(result.errors.some(e => e.message.includes('Duplicate'))).toBe(true)
  })
})

describe('getComponent', () => {
  it('should find NButton', () => {
    const comp = getComponent(manifest, 'NButton')
    expect(comp).toBeDefined()
    expect(comp!.name).toBe('NButton')
    expect(comp!.category).toBe('action')
  })

  it('should return undefined for unknown component', () => {
    expect(getComponent(manifest, 'NUnknown')).toBeUndefined()
  })
})

describe('getComponentsByCategory', () => {
  it('should find display components', () => {
    const display = getComponentsByCategory(manifest, 'display')
    expect(display.length).toBeGreaterThan(0)
    expect(display.every(c => c.category === 'display')).toBe(true)
  })

  it('should find input components', () => {
    const input = getComponentsByCategory(manifest, 'input')
    expect(input.length).toBeGreaterThan(0)
    expect(input.every(c => c.category === 'input')).toBe(true)
  })
})

describe('canBeChildOf', () => {
  it('NButton can be child of NCard', () => {
    expect(canBeChildOf(manifest, 'NButton', 'NCard')).toBe(true)
  })

  it('NDataTable can be child of NResizable', () => {
    expect(canBeChildOf(manifest, 'NDataTable', 'NResizable')).toBe(true)
  })

  it('NResizable cannot be child of NButton', () => {
    expect(canBeChildOf(manifest, 'NResizable', 'NButton')).toBe(false)
  })
})
