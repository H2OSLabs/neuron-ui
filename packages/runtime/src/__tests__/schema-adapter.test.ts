import { describe, it, expect } from 'vitest'
import { pageSchemaToUITree, extractComponentNames } from '../adapter/schema-adapter'
import type { PageSchema } from '@neuron-ui/metadata'

const simpleCrudSchema: PageSchema = {
  version: '1.0.0',
  page: { id: 'test', name: 'Test Page' },
  dataSources: {
    list: { api: 'GET /api/items', autoFetch: true },
  },
  tree: [{
    id: 'root',
    component: 'NResizable',
    props: { direction: 'vertical' },
    children: [
      {
        id: 'table',
        component: 'NDataTable',
        props: { columns: [{ key: 'name', label: 'Name' }], data: [] },
        binding: { dataSource: 'list', field: 'data' },
      },
      {
        id: 'btn',
        component: 'NButton',
        props: { label: 'Add' },
      },
    ],
  }],
}

describe('pageSchemaToUITree', () => {
  it('should flatten a nested tree into a UITree', () => {
    const tree = pageSchemaToUITree(simpleCrudSchema)

    expect(tree.root).toBe('root')
    expect(Object.keys(tree.elements)).toHaveLength(3)
    expect(tree.elements['root'].type).toBe('NResizable')
    expect(tree.elements['root'].children).toEqual(['table', 'btn'])
    expect(tree.elements['table'].type).toBe('NDataTable')
    expect(tree.elements['btn'].type).toBe('NButton')
  })

  it('should adapt binding props', () => {
    const tree = pageSchemaToUITree(simpleCrudSchema)
    const tableElement = tree.elements['table']

    expect(tableElement.props.__dataPath).toBe('/dataSources/list')
    expect(tableElement.props.__statePath).toBe('/form/data')
  })

  it('should handle multiple root nodes with virtual fragment', () => {
    const multiRootSchema: PageSchema = {
      version: '1.0.0',
      page: { id: 'multi', name: 'Multi Root' },
      tree: [
        { id: 'a', component: 'NText', props: { text: 'A' } },
        { id: 'b', component: 'NText', props: { text: 'B' } },
      ],
    }

    const tree = pageSchemaToUITree(multiRootSchema)
    expect(tree.root).toBe('__root__')
    expect(tree.elements['__root__'].type).toBe('__Fragment__')
    expect(tree.elements['__root__'].children).toEqual(['a', 'b'])
  })

  it('should handle deeply nested trees', () => {
    const deepSchema: PageSchema = {
      version: '1.0.0',
      page: { id: 'deep', name: 'Deep' },
      tree: [{
        id: 'l1', component: 'NCard', props: {},
        children: [{
          id: 'l2', component: 'NCard', props: {},
          children: [{
            id: 'l3', component: 'NText', props: { text: 'Deep' },
          }],
        }],
      }],
    }

    const tree = pageSchemaToUITree(deepSchema)
    expect(tree.root).toBe('l1')
    expect(tree.elements['l1'].children).toEqual(['l2'])
    expect(tree.elements['l2'].children).toEqual(['l3'])
    expect(tree.elements['l3'].children).toBeUndefined()
  })
})

describe('extractComponentNames', () => {
  it('should extract all unique component names', () => {
    const names = extractComponentNames(simpleCrudSchema.tree)
    expect(names).toContain('NResizable')
    expect(names).toContain('NDataTable')
    expect(names).toContain('NButton')
    expect(names).toHaveLength(3)
  })
})
