import { describe, it, expect } from 'vitest'
import { validateProjectSchema } from '../project-schema-validator'
import manifestJson from '../../component-manifest.json'
import compositionRulesJson from '../../composition-rules.json'
import type { ComponentManifest, CompositionRules, PageSchema, ProjectSchema } from '../types'

const manifest = manifestJson as unknown as ComponentManifest
const rules = compositionRulesJson as unknown as CompositionRules

function makeValidPage(id: string, route: string): PageSchema {
  return {
    version: '1.0.0',
    page: { id, name: `Page ${id}`, route },
    tree: [{ id: 'root', component: 'NCard', props: {} }],
  }
}

function makeValidProject(overrides?: Partial<ProjectSchema>): ProjectSchema {
  return {
    version: '1.0.0',
    project: { id: 'test-proj', name: 'Test Project' },
    pages: [makeValidPage('home', '/home'), makeValidPage('users', '/users')],
    ...overrides,
  } as ProjectSchema
}

describe('validateProjectSchema', () => {
  // -- Project metadata
  it('validates a correct project schema', () => {
    const result = validateProjectSchema(makeValidProject(), manifest, rules)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects missing version', () => {
    const schema = makeValidProject({ version: '' })
    const result = validateProjectSchema(schema, manifest, rules)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.path === 'version')).toBe(true)
  })

  it('rejects invalid semver version', () => {
    const schema = makeValidProject({ version: 'abc' })
    const result = validateProjectSchema(schema, manifest, rules)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('semver'))).toBe(true)
  })

  it('rejects missing project metadata', () => {
    const schema = makeValidProject({ project: undefined as unknown as ProjectSchema['project'] })
    const result = validateProjectSchema(schema, manifest, rules)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.path === 'project')).toBe(true)
  })

  it('rejects missing project.id', () => {
    const schema = makeValidProject({ project: { id: '', name: 'Test' } })
    const result = validateProjectSchema(schema, manifest, rules)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.path === 'project.id')).toBe(true)
  })

  it('rejects missing project.name', () => {
    const schema = makeValidProject({ project: { id: 'test', name: '' } })
    const result = validateProjectSchema(schema, manifest, rules)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.path === 'project.name')).toBe(true)
  })

  // -- Pages validation
  it('rejects empty pages array', () => {
    const schema = makeValidProject({ pages: [] })
    const result = validateProjectSchema(schema, manifest, rules)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.path === 'pages')).toBe(true)
  })

  it('rejects non-array pages', () => {
    const schema = makeValidProject({ pages: 'not an array' as unknown as PageSchema[] })
    const result = validateProjectSchema(schema, manifest, rules)
    expect(result.valid).toBe(false)
  })

  it('detects duplicate page IDs', () => {
    const schema = makeValidProject({
      pages: [makeValidPage('dup', '/a'), makeValidPage('dup', '/b')],
    })
    const result = validateProjectSchema(schema, manifest, rules)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('Duplicate page id'))).toBe(true)
  })

  it('detects duplicate routes', () => {
    const schema = makeValidProject({
      pages: [makeValidPage('p1', '/same'), makeValidPage('p2', '/same')],
    })
    const result = validateProjectSchema(schema, manifest, rules)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('Duplicate route'))).toBe(true)
  })

  it('validates individual page schemas within pages array', () => {
    const schema = makeValidProject({
      pages: [{
        version: '1.0.0',
        page: { id: 'bad', name: 'Bad Page' },
        tree: [{ id: 'node', component: 'FakeComponent', props: {} }],
      } as PageSchema],
    })
    const result = validateProjectSchema(schema, manifest, rules)
    // Should have errors from nested page validation
    expect(result.errors.some(e => e.path.startsWith('pages[0]'))).toBe(true)
  })

  // -- Navigation validation
  it('validates project with navigation', () => {
    const schema = makeValidProject({
      navigation: {
        type: 'sidebar',
        items: [
          { pageId: 'home', label: 'Home' },
          { pageId: 'users', label: 'Users' },
        ],
      },
    })
    const result = validateProjectSchema(schema, manifest, rules)
    expect(result.valid).toBe(true)
  })

  it('rejects invalid navigation type', () => {
    const schema = makeValidProject({
      navigation: {
        type: 'bottom-tab' as 'sidebar',
        items: [{ pageId: 'home', label: 'Home' }],
      },
    })
    const result = validateProjectSchema(schema, manifest, rules)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.path === 'navigation.type')).toBe(true)
  })

  it('rejects navigation referencing unknown page', () => {
    const schema = makeValidProject({
      navigation: {
        type: 'sidebar',
        items: [{ pageId: 'nonexistent', label: 'Ghost' }],
      },
    })
    const result = validateProjectSchema(schema, manifest, rules)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('unknown page'))).toBe(true)
  })

  it('rejects navigation item missing pageId', () => {
    const schema = makeValidProject({
      navigation: {
        type: 'header',
        items: [{ pageId: '', label: 'Home' }],
      },
    })
    const result = validateProjectSchema(schema, manifest, rules)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('Missing pageId'))).toBe(true)
  })

  it('rejects navigation item missing label', () => {
    const schema = makeValidProject({
      navigation: {
        type: 'sidebar',
        items: [{ pageId: 'home', label: '' }],
      },
    })
    const result = validateProjectSchema(schema, manifest, rules)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.message.includes('Missing label'))).toBe(true)
  })

  it('validates nested navigation children', () => {
    const schema = makeValidProject({
      navigation: {
        type: 'sidebar',
        items: [{
          pageId: 'home',
          label: 'Home',
          children: [{ pageId: 'nonexistent', label: 'Sub' }],
        }],
      },
    })
    const result = validateProjectSchema(schema, manifest, rules)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.path.includes('children'))).toBe(true)
  })
})
