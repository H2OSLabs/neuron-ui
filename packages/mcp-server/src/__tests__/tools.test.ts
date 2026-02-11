// ============================================================
// Tool Logic Tests — Test core tool handler logic directly
// ============================================================

import { describe, it, expect } from 'vitest'
import {
  getManifest,
  getApiMapping,
  getCompositionRules,
  getTokenCategory,
} from '../loaders/index.js'
import {
  getComponent,
  getComponentsByCategory,
  validatePageSchema,
  componentManifest,
  compositionRules,
} from '@neuron-ui/metadata'

// ---- list-components logic ----

describe('list-components logic', () => {
  it('returns 53 components when no filter applied', () => {
    const manifest = getManifest()
    expect(manifest.components).toHaveLength(53)
  })

  it('filters by category "display"', () => {
    const manifest = getManifest()
    const display = manifest.components.filter((c) => c.category === 'display')
    expect(display.length).toBeGreaterThan(0)
    for (const comp of display) {
      expect(comp.category).toBe('display')
    }
  })

  it('filters by category "input"', () => {
    const manifest = getManifest()
    const input = manifest.components.filter((c) => c.category === 'input')
    expect(input.length).toBeGreaterThan(0)
    for (const comp of input) {
      expect(comp.category).toBe('input')
    }
  })

  it('filters by category "action"', () => {
    const manifest = getManifest()
    const action = manifest.components.filter((c) => c.category === 'action')
    expect(action.length).toBeGreaterThan(0)
    for (const comp of action) {
      expect(comp.category).toBe('action')
    }
  })

  it('filters by category "container"', () => {
    const manifest = getManifest()
    const container = manifest.components.filter((c) => c.category === 'container')
    expect(container.length).toBeGreaterThan(0)
  })

  it('filters by category "feedback"', () => {
    const manifest = getManifest()
    const feedback = manifest.components.filter((c) => c.category === 'feedback')
    expect(feedback.length).toBeGreaterThan(0)
  })

  it('filters by category "navigation"', () => {
    const manifest = getManifest()
    const navigation = manifest.components.filter((c) => c.category === 'navigation')
    expect(navigation.length).toBeGreaterThan(0)
  })

  it('filters by category "layout"', () => {
    const manifest = getManifest()
    const layout = manifest.components.filter((c) => c.category === 'layout')
    expect(layout.length).toBeGreaterThan(0)
  })

  it('filters by apiRole "submit"', () => {
    const manifest = getManifest()
    const submit = manifest.components.filter((c) => {
      const roles = Object.values(c.apiRole)
      return roles.includes('submit' as never)
    })
    expect(submit.length).toBeGreaterThan(0)
    // NButton should be in the results
    expect(submit.some((c) => c.name === 'NButton')).toBe(true)
  })

  it('returns empty array for unknown category', () => {
    const manifest = getManifest()
    const unknown = manifest.components.filter((c) => c.category === ('nonexistent' as never))
    expect(unknown).toHaveLength(0)
  })
})

// ---- get-component logic ----

describe('get-component logic', () => {
  it('returns NButton details', () => {
    const comp = getComponent(componentManifest, 'NButton')
    expect(comp).toBeDefined()
    expect(comp!.name).toBe('NButton')
    expect(comp!.category).toBe('action')
    expect(comp!.variants).toBeDefined()
    expect(comp!.sizes).toBeDefined()
  })

  it('returns NDataTable details', () => {
    const comp = getComponent(componentManifest, 'NDataTable')
    expect(comp).toBeDefined()
    expect(comp!.name).toBe('NDataTable')
    expect(comp!.category).toBe('display')
  })

  it('returns NCard details', () => {
    const comp = getComponent(componentManifest, 'NCard')
    expect(comp).toBeDefined()
    expect(comp!.name).toBe('NCard')
    expect(comp!.category).toBe('container')
  })

  it('returns NInput details', () => {
    const comp = getComponent(componentManifest, 'NInput')
    expect(comp).toBeDefined()
    expect(comp!.name).toBe('NInput')
    expect(comp!.category).toBe('input')
  })

  it('returns undefined for unknown component', () => {
    const comp = getComponent(componentManifest, 'NUnknown')
    expect(comp).toBeUndefined()
  })

  it('getComponentsByCategory("display") returns display components', () => {
    const comps = getComponentsByCategory(componentManifest, 'display')
    expect(comps.length).toBeGreaterThan(0)
    for (const c of comps) {
      expect(c.category).toBe('display')
    }
  })
})

// ---- get-tokens logic ----

describe('get-tokens logic', () => {
  it('returns colors when category is "colors"', () => {
    const result = getTokenCategory('colors')
    expect(result).toHaveProperty('colors')
    const colors = (result as Record<string, unknown>).colors as Record<string, unknown>
    expect(colors).toHaveProperty('gray')
    expect(colors).toHaveProperty('accent')
    expect(colors).toHaveProperty('semantic')
  })

  it('returns spacing when category is "spacing"', () => {
    const result = getTokenCategory('spacing')
    expect(result).toHaveProperty('spacing')
    const spacing = (result as Record<string, unknown>).spacing as Record<string, string>
    expect(spacing).toHaveProperty('xs')
    expect(spacing.xs).toBe('4px')
  })

  it('returns radius when category is "radius"', () => {
    const result = getTokenCategory('radius')
    expect(result).toHaveProperty('radius')
  })

  it('returns typography when category is "typography"', () => {
    const result = getTokenCategory('typography')
    expect(result).toHaveProperty('typography')
  })

  it('returns all tokens when category is "all"', () => {
    const result = getTokenCategory('all')
    expect(result).toHaveProperty('colors')
    expect(result).toHaveProperty('spacing')
    expect(result).toHaveProperty('radius')
    expect(result).toHaveProperty('typography')
  })
})

// ---- validate-schema logic ----

describe('validate-schema logic', () => {
  it('validates a correct minimal schema', () => {
    const validSchema = {
      version: '1.0.0',
      page: { id: 'test', name: 'Test Page' },
      tree: [
        {
          id: 'root',
          component: 'NResizable',
          props: { direction: 'vertical' },
          children: [],
        },
      ],
    }

    const result = validatePageSchema(
      validSchema as never,
      componentManifest,
      compositionRules,
    )
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects schema missing version', () => {
    const invalidSchema = {
      page: { id: 'test', name: 'Test' },
      tree: [
        {
          id: 'root',
          component: 'NResizable',
          props: {},
          children: [],
        },
      ],
    }

    const result = validatePageSchema(
      invalidSchema as never,
      componentManifest,
      compositionRules,
    )
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.path === 'version')).toBe(true)
  })

  it('rejects schema missing page.id', () => {
    const invalidSchema = {
      version: '1.0.0',
      page: { name: 'Test' },
      tree: [
        {
          id: 'root',
          component: 'NResizable',
          props: {},
          children: [],
        },
      ],
    }

    const result = validatePageSchema(
      invalidSchema as never,
      componentManifest,
      compositionRules,
    )
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.path === 'page.id')).toBe(true)
  })

  it('rejects schema with empty tree', () => {
    const invalidSchema = {
      version: '1.0.0',
      page: { id: 'test', name: 'Test' },
      tree: [],
    }

    const result = validatePageSchema(
      invalidSchema as never,
      componentManifest,
      compositionRules,
    )
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.path === 'tree')).toBe(true)
  })

  it('rejects schema with invalid version format', () => {
    const invalidSchema = {
      version: 'abc',
      page: { id: 'test', name: 'Test' },
      tree: [
        {
          id: 'root',
          component: 'NResizable',
          props: {},
          children: [],
        },
      ],
    }

    const result = validatePageSchema(
      invalidSchema as never,
      componentManifest,
      compositionRules,
    )
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('semver'))).toBe(true)
  })

  it('reports unknown component in tree', () => {
    const schema = {
      version: '1.0.0',
      page: { id: 'test', name: 'Test' },
      tree: [
        {
          id: 'root',
          component: 'NUnknownWidget',
          props: {},
          children: [],
        },
      ],
    }

    const result = validatePageSchema(
      schema as never,
      componentManifest,
      compositionRules,
    )
    expect(result.valid).toBe(false)
    expect(
      result.errors.some((e) => e.message.includes('Unknown component')),
    ).toBe(true)
  })

  it('reports duplicate node ids', () => {
    const schema = {
      version: '1.0.0',
      page: { id: 'test', name: 'Test' },
      tree: [
        {
          id: 'root',
          component: 'NResizable',
          props: {},
          children: [
            {
              id: 'duplicate',
              component: 'NButton',
              props: { label: 'A' },
            },
            {
              id: 'duplicate',
              component: 'NButton',
              props: { label: 'B' },
            },
          ],
        },
      ],
    }

    const result = validatePageSchema(
      schema as never,
      componentManifest,
      compositionRules,
    )
    expect(result.valid).toBe(false)
    expect(
      result.errors.some((e) => e.message.includes('Duplicate node id')),
    ).toBe(true)
  })
})

// ---- suggest-components logic ----

describe('suggest-components logic (api-mapping)', () => {
  it('display string:enum maps to NBadge', () => {
    const mapping = getApiMapping()
    const rule = mapping.fieldTypeMapping.display['string:enum']
    expect(rule).toBeDefined()
    expect(rule.component).toBe('NBadge')
  })

  it('display number:percentage maps to NProgress', () => {
    const mapping = getApiMapping()
    const rule = mapping.fieldTypeMapping.display['number:percentage']
    expect(rule).toBeDefined()
    expect(rule.component).toBe('NProgress')
  })

  it('display array:object maps to NDataTable', () => {
    const mapping = getApiMapping()
    const rule = mapping.fieldTypeMapping.display['array:object']
    expect(rule).toBeDefined()
    expect(rule.component).toBe('NDataTable')
  })

  it('display string maps to NText', () => {
    const mapping = getApiMapping()
    const rule = mapping.fieldTypeMapping.display['string']
    expect(rule).toBeDefined()
    expect(rule.component).toBe('NText')
  })

  it('input string maps to NInput', () => {
    const mapping = getApiMapping()
    const rule = mapping.fieldTypeMapping.input['string']
    expect(rule).toBeDefined()
    expect(rule.component).toBe('NInput')
  })

  it('input boolean maps to NSwitch', () => {
    const mapping = getApiMapping()
    const rule = mapping.fieldTypeMapping.input['boolean']
    expect(rule).toBeDefined()
    expect(rule.component).toBe('NSwitch')
  })

  it('fieldTypeMapping has both display and input sections', () => {
    const mapping = getApiMapping()
    expect(mapping.fieldTypeMapping).toHaveProperty('display')
    expect(mapping.fieldTypeMapping).toHaveProperty('input')
    expect(Object.keys(mapping.fieldTypeMapping.display).length).toBeGreaterThan(0)
    expect(Object.keys(mapping.fieldTypeMapping.input).length).toBeGreaterThan(0)
  })
})
