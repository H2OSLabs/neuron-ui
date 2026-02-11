import { describe, it, expect } from 'vitest'
import { validatePageSchema } from './page-schema-validator'
import manifestJson from '../component-manifest.json'
import compositionRulesJson from '../composition-rules.json'
import crudExample from '../page-schema/examples/crud-page.json'
import dashboardExample from '../page-schema/examples/dashboard-page.json'
import detailExample from '../page-schema/examples/detail-page.json'
import type { ComponentManifest, CompositionRules, PageSchema } from './types'

const manifest = manifestJson as unknown as ComponentManifest
const rules = compositionRulesJson as unknown as CompositionRules

describe('validatePageSchema', () => {
  it('should validate crud-page example without errors', () => {
    const result = validatePageSchema(crudExample as unknown as PageSchema, manifest, rules)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should validate dashboard-page example without errors', () => {
    const result = validatePageSchema(dashboardExample as unknown as PageSchema, manifest, rules)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should validate detail-page example without errors', () => {
    const result = validatePageSchema(detailExample as unknown as PageSchema, manifest, rules)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should detect missing version', () => {
    const bad = { page: { id: 'test', name: 'Test' }, tree: [] } as unknown as PageSchema
    const result = validatePageSchema(bad, manifest, rules)
    expect(result.errors.some(e => e.path === 'version')).toBe(true)
  })

  it('should detect missing page metadata', () => {
    const bad = { version: '1.0.0', tree: [{ id: 'root', component: 'NCard' }] } as unknown as PageSchema
    const result = validatePageSchema(bad, manifest, rules)
    expect(result.errors.some(e => e.path === 'page')).toBe(true)
  })

  it('should detect empty tree', () => {
    const bad = { version: '1.0.0', page: { id: 'test', name: 'Test' }, tree: [] } as unknown as PageSchema
    const result = validatePageSchema(bad, manifest, rules)
    expect(result.errors.some(e => e.path === 'tree')).toBe(true)
  })

  it('should detect unknown component', () => {
    const bad: PageSchema = {
      version: '1.0.0',
      page: { id: 'test', name: 'Test' },
      tree: [{ id: 'root', component: 'NUnknown' }],
    }
    const result = validatePageSchema(bad, manifest, rules)
    expect(result.errors.some(e => e.message.includes('Unknown component'))).toBe(true)
  })

  it('should detect duplicate node IDs', () => {
    const bad: PageSchema = {
      version: '1.0.0',
      page: { id: 'test', name: 'Test' },
      tree: [
        {
          id: 'root',
          component: 'NResizable',
          children: [
            { id: 'dup', component: 'NText', props: { text: 'A' } },
            { id: 'dup', component: 'NText', props: { text: 'B' } },
          ],
        },
      ],
    }
    const result = validatePageSchema(bad, manifest, rules)
    expect(result.errors.some(e => e.message.includes('Duplicate node id'))).toBe(true)
  })

  it('should detect invalid component name format', () => {
    const bad: PageSchema = {
      version: '1.0.0',
      page: { id: 'test', name: 'Test' },
      tree: [{ id: 'root', component: 'button' }],
    }
    const result = validatePageSchema(bad, manifest, rules)
    expect(result.errors.some(e => e.rule === 'component')).toBe(true)
  })

  it('should warn about raw color values', () => {
    const bad: PageSchema = {
      version: '1.0.0',
      page: { id: 'test', name: 'Test' },
      tree: [{ id: 'root', component: 'NBadge', props: { label: 'test', color: '#ff0000' } }],
    }
    const result = validatePageSchema(bad, manifest, rules)
    expect(result.warnings.some(e => e.rule === 'token')).toBe(true)
  })

  it('should warn about unknown data source references', () => {
    const bad: PageSchema = {
      version: '1.0.0',
      page: { id: 'test', name: 'Test' },
      dataSources: { users: { api: 'GET /api/users' } },
      tree: [{
        id: 'root',
        component: 'NDataTable',
        props: { columns: [], data: [] },
        binding: { dataSource: 'nonexistent' },
      }],
    }
    const result = validatePageSchema(bad, manifest, rules)
    expect(result.warnings.some(e => e.rule === 'binding')).toBe(true)
  })
})
