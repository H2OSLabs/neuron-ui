import { describe, it, expect } from 'vitest'
import { fallbackGenerate, buildSystemPrompt, buildUserPrompt } from '../../../generator/src/index'
import { validatePageSchema, componentManifest, compositionRules } from '../index'
import type { PageSchema } from '../types'
import { pageSchemaToUITree, neuronCatalog, extractComponentNames } from '../../../runtime/src/index'
import { generatePageComponent, generateHooksFile, generateTypesFile } from '../../../codegen/src/index'
import { colors, spacing, radius, fontSize } from '../../../tokens/src/index'

import crudExample from '../../page-schema/examples/crud-page.json'
import dashboardExample from '../../page-schema/examples/dashboard-page.json'
import detailExample from '../../page-schema/examples/detail-page.json'

// ============================================================
// Cross-Package Integration Tests
// Verify the full pipeline works across neuron-ui packages
// ============================================================

describe('Generator -> Metadata Validation Pipeline', () => {
  it('should generate a valid CRUD skeleton and pass schema validation', () => {
    const { pageSchema } = fallbackGenerate(
      'GET /api/users\nPOST /api/users\nPUT /api/users/:id\nDELETE /api/users/:id',
      'User management CRUD',
      'crud',
      0,
      [],
    )

    const result = validatePageSchema(pageSchema, componentManifest, compositionRules)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(pageSchema.version).toBe('1.0.0')
    expect(pageSchema.page.id).toContain('crud')
    expect(pageSchema.dataSources).toBeDefined()
    expect(Object.keys(pageSchema.dataSources!)).toHaveLength(4)
  })

  it('should generate a valid dashboard skeleton and pass schema validation', () => {
    const { pageSchema } = fallbackGenerate(
      'GET /api/dashboard/stats',
      'Sales dashboard overview',
      'dashboard',
      0,
      [],
    )

    const result = validatePageSchema(pageSchema, componentManifest, compositionRules)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(pageSchema.tree[0].component).toBe('NResizable')
  })

  it('should generate a valid detail skeleton and pass schema validation', () => {
    const { pageSchema } = fallbackGenerate(
      'GET /api/users/:id',
      'User detail page',
      'detail',
      0,
      [],
    )

    const result = validatePageSchema(pageSchema, componentManifest, compositionRules)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(pageSchema.tree[0].component).toBe('NCard')
  })

  it('should mark fallback results as degraded with suggested actions', () => {
    const result = fallbackGenerate(
      'GET /api/items',
      'Some page',
      'auto',
      2,
      [{ path: 'test', message: 'test error', severity: 'error', rule: 'format' }],
    )

    expect(result.metadata.degraded).toBe(true)
    expect(result.metadata.suggestedActions).toBeDefined()
    expect(result.metadata.suggestedActions!.length).toBeGreaterThan(0)
    expect(result.metadata.retries).toBe(2)
    expect(result.metadata.degradeReason).toHaveLength(1)
  })

  it('should produce valid schemas for all page types accepted by validatePageSchema', () => {
    const pageTypes = ['crud', 'dashboard', 'detail', 'auto'] as const

    for (const pageType of pageTypes) {
      const { pageSchema } = fallbackGenerate('GET /api/resource', `Test ${pageType}`, pageType, 0, [])
      const result = validatePageSchema(pageSchema, componentManifest, compositionRules)
      expect(result.valid).toBe(true)
    }
  })
})

describe('SchemaAdapter Pipeline', () => {
  it('should convert CRUD example schema to valid UITree', () => {
    const schema = crudExample as unknown as PageSchema
    const uiTree = pageSchemaToUITree(schema)

    expect(uiTree.root).toBe('root')
    expect(uiTree.elements).toBeDefined()
    expect(Object.keys(uiTree.elements).length).toBeGreaterThan(0)
    expect(uiTree.elements['root'].type).toBe('NResizable')
    expect(uiTree.elements['root'].children).toBeDefined()
    expect(uiTree.elements['root'].children!.length).toBeGreaterThan(0)
  })

  it('should convert dashboard example schema to valid UITree', () => {
    const schema = dashboardExample as unknown as PageSchema
    const uiTree = pageSchemaToUITree(schema)

    expect(uiTree.root).toBe('root')
    expect(uiTree.elements['root'].type).toBe('NResizable')
    // Dashboard has sidebar + main-content as children of root
    expect(uiTree.elements['sidebar']).toBeDefined()
    expect(uiTree.elements['sidebar'].type).toBe('NSidebar')
    expect(uiTree.elements['main-content']).toBeDefined()
  })

  it('should convert detail example schema to valid UITree', () => {
    const schema = detailExample as unknown as PageSchema
    const uiTree = pageSchemaToUITree(schema)

    expect(uiTree.root).toBe('root')
    expect(uiTree.elements['root'].type).toBe('NResizable')
    expect(uiTree.elements['header-card']).toBeDefined()
    expect(uiTree.elements['detail-tabs']).toBeDefined()
  })

  it('should flatten all nested elements into the UITree elements map', () => {
    const schema = crudExample as unknown as PageSchema
    const uiTree = pageSchemaToUITree(schema)

    // All node IDs from the crud example should exist as keys in elements
    const allIds: string[] = []
    function collectIds(nodes: PageSchema['tree']): void {
      for (const node of nodes) {
        allIds.push(node.id)
        if (node.children) collectIds(node.children)
      }
    }
    collectIds(schema.tree)

    for (const id of allIds) {
      expect(uiTree.elements[id]).toBeDefined()
    }
  })

  it('should preserve binding props through adapter conversion', () => {
    const schema = crudExample as unknown as PageSchema
    const uiTree = pageSchemaToUITree(schema)

    // The user-table node has binding { dataSource: 'userList', field: 'data' }
    const tableElement = uiTree.elements['user-table']
    expect(tableElement).toBeDefined()
    // adaptBinding converts dataSource to __dataPath and field to __statePath
    expect(tableElement.props.__dataPath).toBeDefined()
  })

  it('should extract component names from example schemas', () => {
    const schema = crudExample as unknown as PageSchema
    const names = extractComponentNames(schema.tree)

    expect(names).toContain('NResizable')
    expect(names).toContain('NDataTable')
    expect(names).toContain('NButton')
    expect(names).toContain('NDialog')
    expect(names).toContain('NInput')
    expect(names.length).toBeGreaterThan(5)
  })
})

describe('Codegen Pipeline', () => {
  it('should generate page component code from CRUD example', () => {
    const schema = crudExample as unknown as PageSchema
    const code = generatePageComponent(schema, 'hooks')

    expect(code.length).toBeGreaterThan(0)
    expect(code).toContain("'use client'")
    expect(code).toContain('import')
    expect(code).toContain('@neuron-ui/components')
    expect(code).toContain('export function')
    expect(code).toContain('NDataTable')
    expect(code).toContain('NButton')
  })

  it('should generate hooks file from CRUD example', () => {
    const schema = crudExample as unknown as PageSchema
    const code = generateHooksFile(schema, 'hooks', 'fetch')

    expect(code.length).toBeGreaterThan(0)
    expect(code).toContain('hooks.ts')
    expect(code).toContain('useState')
    expect(code).toContain('useEffect')
    expect(code).toContain('export function')
    // CRUD has 4 data sources: userList (GET), createUser (POST), updateUser (PUT), deleteUser (DELETE)
    expect(code).toContain('useUserList')
    expect(code).toContain('useCreateUser')
  })

  it('should generate types file from CRUD example', () => {
    const schema = crudExample as unknown as PageSchema
    const code = generateTypesFile(schema)

    expect(code.length).toBeGreaterThan(0)
    expect(code).toContain('types.ts')
    expect(code).toContain('export')
    // Should include data source type definitions
    expect(code).toContain('UserList')
    expect(code).toContain('Data')
  })

  it('should generate hooks with different styles (swr)', () => {
    const schema = crudExample as unknown as PageSchema
    const code = generateHooksFile(schema, 'swr', 'fetch')

    expect(code).toContain('useSWR')
  })

  it('should generate hooks with different styles (react-query)', () => {
    const schema = crudExample as unknown as PageSchema
    const code = generateHooksFile(schema, 'react-query', 'fetch')

    expect(code).toContain('useQuery')
    expect(code).toContain('@tanstack/react-query')
  })

  it('should generate code from dashboard example without errors', () => {
    const schema = dashboardExample as unknown as PageSchema
    const pageCode = generatePageComponent(schema, 'hooks')
    const hooksCode = generateHooksFile(schema, 'hooks', 'fetch')
    const typesCode = generateTypesFile(schema)

    expect(pageCode.length).toBeGreaterThan(0)
    expect(hooksCode.length).toBeGreaterThan(0)
    expect(typesCode.length).toBeGreaterThan(0)
    expect(pageCode).toContain('NChart')
    expect(pageCode).toContain('NCard')
  })

  it('should generate code from detail example without errors', () => {
    const schema = detailExample as unknown as PageSchema
    const pageCode = generatePageComponent(schema, 'hooks')
    const hooksCode = generateHooksFile(schema, 'hooks', 'fetch')
    const typesCode = generateTypesFile(schema)

    expect(pageCode.length).toBeGreaterThan(0)
    expect(hooksCode.length).toBeGreaterThan(0)
    expect(typesCode.length).toBeGreaterThan(0)
    expect(pageCode).toContain('NTabs')
    expect(pageCode).toContain('NAvatar')
  })
})

describe('Token Compliance', () => {
  it('should have 14 gray scale entries', () => {
    expect(Object.keys(colors.gray)).toHaveLength(14)
  })

  it('should have 10 accent color entries', () => {
    expect(Object.keys(colors.accent)).toHaveLength(10)
  })

  it('should have 3 semantic color entries', () => {
    expect(Object.keys(colors.semantic)).toHaveLength(3)
    expect(colors.semantic).toHaveProperty('error')
    expect(colors.semantic).toHaveProperty('warning')
    expect(colors.semantic).toHaveProperty('success')
  })

  it('should have 10 spacing entries', () => {
    expect(Object.keys(spacing)).toHaveLength(10)
  })

  it('should have 5 radius entries', () => {
    expect(Object.keys(radius)).toHaveLength(5)
  })

  it('should have 7 fontSize entries', () => {
    expect(Object.keys(fontSize)).toHaveLength(7)
    expect(fontSize).toHaveProperty('display')
    expect(fontSize).toHaveProperty('heading')
    expect(fontSize).toHaveProperty('subheading')
    expect(fontSize).toHaveProperty('section')
    expect(fontSize).toHaveProperty('body-lg')
    expect(fontSize).toHaveProperty('body')
    expect(fontSize).toHaveProperty('caption')
  })

  it('should have consistent accent color names between tokens and catalog', () => {
    const tokenAccentNames = Object.keys(colors.accent)
    // These accent colors should all be recognized by the catalog's ColorToken enum
    const catalogComponentDef = neuronCatalog.components['NBadge']
    expect(catalogComponentDef).toBeDefined()

    // Verify each accent color validates successfully against NBadge
    for (const colorName of tokenAccentNames) {
      const result = neuronCatalog.validateElement('NBadge', { label: 'test', color: colorName })
      expect(result.valid).toBe(true)
    }
  })
})

describe('Catalog Integrity', () => {
  it('should have 53 components registered', () => {
    const componentCount = Object.keys(neuronCatalog.components).length
    expect(componentCount).toBe(53)
  })

  it('should have 9 actions registered', () => {
    const actionCount = Object.keys(neuronCatalog.actions).length
    expect(actionCount).toBe(9)
  })

  it('should produce non-empty prompt output', () => {
    const prompt = neuronCatalog.prompt()

    expect(prompt.length).toBeGreaterThan(0)
    expect(prompt).toContain('neuron-ui')
    expect(prompt).toContain('Components (53)')
    expect(prompt).toContain('Actions (9)')
  })

  it('should include component names in prompt output', () => {
    const prompt = neuronCatalog.prompt()

    // Spot-check representative components from each category
    expect(prompt).toContain('NButton')
    expect(prompt).toContain('NDataTable')
    expect(prompt).toContain('NInput')
    expect(prompt).toContain('NCard')
    expect(prompt).toContain('NDialog')
    expect(prompt).toContain('NChart')
    expect(prompt).toContain('NTabs')
    expect(prompt).toContain('NResizable')
    expect(prompt).toContain('NToast')
  })

  it('should include action names in prompt output', () => {
    const prompt = neuronCatalog.prompt()

    expect(prompt).toContain('openDialog')
    expect(prompt).toContain('closeDialog')
    expect(prompt).toContain('submitForm')
    expect(prompt).toContain('deleteItem')
    expect(prompt).toContain('refresh')
    expect(prompt).toContain('navigate')
    expect(prompt).toContain('toast')
  })

  it('should validate known component props correctly', () => {
    const buttonResult = neuronCatalog.validateElement('NButton', { label: 'Click me', variant: 'capsule' })
    expect(buttonResult.valid).toBe(true)

    const badgeResult = neuronCatalog.validateElement('NBadge', { label: 'Active', color: 'green' })
    expect(badgeResult.valid).toBe(true)

    const cardResult = neuronCatalog.validateElement('NCard', { title: 'My Card' })
    expect(cardResult.valid).toBe(true)
  })

  it('should reject unknown component types', () => {
    const result = neuronCatalog.validateElement('NNonExistent', { foo: 'bar' })
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('should match manifest component count', () => {
    expect(componentManifest.totalComponents).toBe(53)
    expect(componentManifest.components).toHaveLength(53)

    // All manifest components should have N-prefix naming
    for (const comp of componentManifest.components) {
      expect(comp.name).toMatch(/^N[A-Z]/)
    }
  })
})

describe('End-to-End: Generator -> Validator -> Adapter -> Codegen', () => {
  it('should generate, validate, adapt, and produce code for a CRUD page', () => {
    // Step 1: Generate skeleton schema
    const { pageSchema } = fallbackGenerate(
      'GET /api/products\nPOST /api/products\nDELETE /api/products/:id',
      'Product management page',
      'crud',
      0,
      [],
    )

    // Step 2: Validate the generated schema
    const validation = validatePageSchema(pageSchema, componentManifest, compositionRules)
    expect(validation.valid).toBe(true)

    // Step 3: Convert to UITree
    const uiTree = pageSchemaToUITree(pageSchema)
    expect(uiTree.root).toBeDefined()
    expect(Object.keys(uiTree.elements).length).toBeGreaterThan(0)

    // Step 4: Generate code
    const pageCode = generatePageComponent(pageSchema, 'hooks')
    const hooksCode = generateHooksFile(pageSchema, 'hooks', 'fetch')
    const typesCode = generateTypesFile(pageSchema)

    expect(pageCode).toContain('export function')
    expect(hooksCode).toContain('export function')
    expect(typesCode.length).toBeGreaterThan(0)
  })

  it('should produce consistent component names across adapter and codegen', () => {
    const schema = crudExample as unknown as PageSchema

    // Extract component names from schema tree
    const componentNames = extractComponentNames(schema.tree)

    // Generated code should import all these components
    const pageCode = generatePageComponent(schema, 'hooks')

    for (const name of componentNames) {
      expect(pageCode).toContain(name)
    }
  })
})

describe('Prompt System Integration', () => {
  it('should build system prompt that references metadata', () => {
    const prompt = buildSystemPrompt({ pageType: 'crud' })

    expect(prompt.length).toBeGreaterThan(0)
    // System prompt should reference component information
    expect(prompt).toContain('NDataTable')
  })

  it('should build user prompt with API and task content', () => {
    const prompt = buildUserPrompt(
      'GET /api/users\nPOST /api/users',
      'Create a user management page',
    )

    expect(prompt).toContain('GET /api/users')
    expect(prompt).toContain('POST /api/users')
    expect(prompt).toContain('Create a user management page')
  })
})
