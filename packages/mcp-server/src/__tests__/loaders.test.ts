// ============================================================
// Loader Tests — Verify data loaders return expected structures
// ============================================================

import { describe, it, expect } from 'vitest'
import {
  getMetadata,
  getManifest,
  getApiMapping,
  getCompositionRules,
} from '../loaders/metadata-loader.js'
import {
  getTokenData,
  getTokenCategory,
} from '../loaders/token-loader.js'
import {
  getCatalogPrompt,
  getCatalog,
} from '../loaders/catalog-loader.js'
import {
  getExamples,
  getExample,
  listExampleNames,
} from '../loaders/example-loader.js'

// ---- Metadata Loader ----

describe('metadata-loader', () => {
  it('getMetadata returns manifest, apiMapping, and compositionRules', () => {
    const store = getMetadata()
    expect(store).toHaveProperty('manifest')
    expect(store).toHaveProperty('apiMapping')
    expect(store).toHaveProperty('compositionRules')
  })

  it('manifest contains 53 components', () => {
    const manifest = getManifest()
    expect(manifest.components).toHaveLength(53)
  })

  it('manifest components all have N-prefix names', () => {
    const manifest = getManifest()
    for (const comp of manifest.components) {
      expect(comp.name).toMatch(/^N[A-Z]/)
    }
  })

  it('manifest has version field', () => {
    const manifest = getManifest()
    expect(manifest.version).toBeDefined()
    expect(typeof manifest.version).toBe('string')
  })

  it('apiMapping loads field type mapping rules', () => {
    const mapping = getApiMapping()
    expect(mapping).toHaveProperty('fieldTypeMapping')
    expect(mapping.fieldTypeMapping).toHaveProperty('display')
    expect(mapping.fieldTypeMapping).toHaveProperty('input')
  })

  it('apiMapping contains string:enum display rule mapping to NBadge', () => {
    const mapping = getApiMapping()
    const displayRules = mapping.fieldTypeMapping.display
    expect(displayRules).toHaveProperty('string:enum')
    expect(displayRules['string:enum'].component).toBe('NBadge')
  })

  it('compositionRules loads rules array', () => {
    const rules = getCompositionRules()
    expect(rules).toHaveProperty('rules')
    expect(Array.isArray(rules.rules)).toBe(true)
    expect(rules.rules.length).toBeGreaterThan(0)
  })

  it('compositionRules has globalConstraints', () => {
    const rules = getCompositionRules()
    expect(rules).toHaveProperty('globalConstraints')
    expect(rules.globalConstraints).toHaveProperty('maxNestingDepth')
    expect(rules.globalConstraints).toHaveProperty('rootContainers')
  })

  it('compositionRules includes NDialog parent rule', () => {
    const rules = getCompositionRules()
    const dialogRule = rules.rules.find((r) => r.parent === 'NDialog')
    expect(dialogRule).toBeDefined()
    expect(dialogRule!.allowedChildren).toContain('NButton')
  })
})

// ---- Token Loader ----

describe('token-loader', () => {
  it('getTokenData returns all token categories', () => {
    const data = getTokenData()
    expect(data).toHaveProperty('colors')
    expect(data).toHaveProperty('spacing')
    expect(data).toHaveProperty('radius')
    expect(data).toHaveProperty('typography')
  })

  it('colors has gray, accent, and semantic sub-objects', () => {
    const data = getTokenData()
    expect(data.colors).toHaveProperty('gray')
    expect(data.colors).toHaveProperty('accent')
    expect(data.colors).toHaveProperty('semantic')
  })

  it('gray scale has 14 levels', () => {
    const data = getTokenData()
    expect(Object.keys(data.colors.gray)).toHaveLength(14)
  })

  it('accent colors has 10 entries', () => {
    const data = getTokenData()
    expect(Object.keys(data.colors.accent)).toHaveLength(10)
  })

  it('semantic colors has 3 entries (error, warning, success)', () => {
    const data = getTokenData()
    expect(Object.keys(data.colors.semantic)).toHaveLength(3)
    expect(data.colors.semantic).toHaveProperty('error')
    expect(data.colors.semantic).toHaveProperty('warning')
    expect(data.colors.semantic).toHaveProperty('success')
  })

  it('spacing is a non-empty object with string values', () => {
    const data = getTokenData()
    const keys = Object.keys(data.spacing)
    expect(keys.length).toBeGreaterThan(0)
    for (const key of keys) {
      expect(typeof data.spacing[key]).toBe('string')
    }
  })

  it('spacing contains expected tokens (xs, sm, md, lg, xl)', () => {
    const data = getTokenData()
    expect(data.spacing).toHaveProperty('xs')
    expect(data.spacing).toHaveProperty('sm')
    expect(data.spacing).toHaveProperty('md')
    expect(data.spacing).toHaveProperty('lg')
    expect(data.spacing).toHaveProperty('xl')
  })

  it('radius is a non-empty object with string values', () => {
    const data = getTokenData()
    const keys = Object.keys(data.radius)
    expect(keys.length).toBeGreaterThan(0)
    for (const key of keys) {
      expect(typeof data.radius[key]).toBe('string')
    }
  })

  it('radius contains expected tokens (sm, md, lg, xl, full)', () => {
    const data = getTokenData()
    expect(data.radius).toHaveProperty('sm')
    expect(data.radius).toHaveProperty('md')
    expect(data.radius).toHaveProperty('lg')
    expect(data.radius).toHaveProperty('xl')
    expect(data.radius).toHaveProperty('full')
  })

  it('typography has fontFamily and fontSize', () => {
    const data = getTokenData()
    expect(data.typography).toHaveProperty('fontFamily')
    expect(data.typography).toHaveProperty('fontSize')
  })

  it('fontFamily includes heading and body entries', () => {
    const data = getTokenData()
    expect(data.typography.fontFamily).toHaveProperty('heading')
    expect(data.typography.fontFamily).toHaveProperty('body')
  })

  it('fontSize has 7 levels', () => {
    const data = getTokenData()
    expect(Object.keys(data.typography.fontSize)).toHaveLength(7)
  })

  it('getTokenCategory("colors") returns only colors', () => {
    const result = getTokenCategory('colors')
    expect(result).toHaveProperty('colors')
    expect(result).not.toHaveProperty('spacing')
    expect(result).not.toHaveProperty('radius')
    expect(result).not.toHaveProperty('typography')
  })

  it('getTokenCategory("spacing") returns only spacing', () => {
    const result = getTokenCategory('spacing')
    expect(result).toHaveProperty('spacing')
    expect(result).not.toHaveProperty('colors')
  })

  it('getTokenCategory("radius") returns only radius', () => {
    const result = getTokenCategory('radius')
    expect(result).toHaveProperty('radius')
    expect(result).not.toHaveProperty('colors')
  })

  it('getTokenCategory("typography") returns only typography', () => {
    const result = getTokenCategory('typography')
    expect(result).toHaveProperty('typography')
    expect(result).not.toHaveProperty('colors')
  })

  it('getTokenCategory("all") returns all token data', () => {
    const result = getTokenCategory('all')
    expect(result).toHaveProperty('colors')
    expect(result).toHaveProperty('spacing')
    expect(result).toHaveProperty('radius')
    expect(result).toHaveProperty('typography')
  })
})

// ---- Catalog Loader ----

describe('catalog-loader', () => {
  it('getCatalog returns a catalog object with name', () => {
    const catalog = getCatalog()
    expect(catalog.name).toBe('neuron-ui')
  })

  it('getCatalog has 53 components registered', () => {
    const catalog = getCatalog()
    expect(Object.keys(catalog.components)).toHaveLength(53)
  })

  it('getCatalog has 9 actions registered', () => {
    const catalog = getCatalog()
    expect(Object.keys(catalog.actions)).toHaveLength(9)
  })

  it('getCatalogPrompt returns a non-empty string', () => {
    const prompt = getCatalogPrompt()
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(0)
  })

  it('getCatalogPrompt contains component catalog header', () => {
    const prompt = getCatalogPrompt()
    expect(prompt).toContain('neuron-ui')
    expect(prompt).toContain('Component Catalog')
  })

  it('getCatalogPrompt mentions key components', () => {
    const prompt = getCatalogPrompt()
    expect(prompt).toContain('NButton')
    expect(prompt).toContain('NDataTable')
    expect(prompt).toContain('NCard')
  })

  it('getCatalogPrompt includes actions section', () => {
    const prompt = getCatalogPrompt()
    expect(prompt).toContain('Actions')
    expect(prompt).toContain('openDialog')
    expect(prompt).toContain('submitForm')
  })
})

// ---- Example Loader ----

describe('example-loader', () => {
  it('listExampleNames returns 3 examples', () => {
    const names = listExampleNames()
    expect(names).toHaveLength(3)
  })

  it('listExampleNames includes crud-page, dashboard-page, detail-page', () => {
    const names = listExampleNames()
    const nameList = names.map((n) => n.name)
    expect(nameList).toContain('crud-page')
    expect(nameList).toContain('dashboard-page')
    expect(nameList).toContain('detail-page')
  })

  it('listExampleNames entries have name and description', () => {
    const names = listExampleNames()
    for (const entry of names) {
      expect(typeof entry.name).toBe('string')
      expect(typeof entry.description).toBe('string')
      expect(entry.name.length).toBeGreaterThan(0)
      expect(entry.description.length).toBeGreaterThan(0)
    }
  })

  it('getExamples loads all 3 example schemas', () => {
    const examples = getExamples()
    expect(examples).toHaveLength(3)
  })

  it('each example has name, description, and schema', () => {
    const examples = getExamples()
    for (const example of examples) {
      expect(typeof example.name).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.schema).toBeDefined()
    }
  })

  it('crud-page example has valid page schema structure', () => {
    const example = getExample('crud-page')
    expect(example).toBeDefined()
    const schema = example!.schema as Record<string, unknown>
    expect(schema).toHaveProperty('version')
    expect(schema).toHaveProperty('page')
    expect(schema).toHaveProperty('tree')
    expect(schema).toHaveProperty('dataSources')
  })

  it('dashboard-page example has correct page id', () => {
    const example = getExample('dashboard-page')
    expect(example).toBeDefined()
    const schema = example!.schema as Record<string, unknown>
    const page = schema.page as Record<string, unknown>
    expect(page.id).toBe('sales-dashboard')
  })

  it('detail-page example has correct page id', () => {
    const example = getExample('detail-page')
    expect(example).toBeDefined()
    const schema = example!.schema as Record<string, unknown>
    const page = schema.page as Record<string, unknown>
    expect(page.id).toBe('user-detail')
  })

  it('getExample returns undefined for unknown name', () => {
    const example = getExample('nonexistent-page')
    expect(example).toBeUndefined()
  })
})
