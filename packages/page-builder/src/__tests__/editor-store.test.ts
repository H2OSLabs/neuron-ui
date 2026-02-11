import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore } from '../stores/editor-store'
import type { PageSchema, PageSchemaTreeNode } from '../types'

const TEST_SCHEMA: PageSchema = {
  version: '1.0.0',
  page: { id: 'test', name: 'Test Page' },
  tree: [
    {
      id: 'root',
      component: 'NResizable',
      props: { direction: 'vertical' },
      children: [
        {
          id: 'title',
          component: 'NText',
          props: { text: 'Hello', size: 'heading' },
        },
        {
          id: 'btn',
          component: 'NButton',
          props: { label: 'Click', variant: 'default' },
        },
      ],
    },
  ],
}

describe('editor-store', () => {
  beforeEach(() => {
    useEditorStore.getState().setSchema(JSON.parse(JSON.stringify(TEST_SCHEMA)))
  })

  it('should set schema', () => {
    const state = useEditorStore.getState()
    expect(state.pageSchema.page.id).toBe('test')
    expect(state.pageSchema.tree).toHaveLength(1)
  })

  it('should update node props', () => {
    useEditorStore.getState().updateNodeProps('title', { text: 'World' })
    const tree = useEditorStore.getState().pageSchema.tree
    const root = tree[0]
    const title = root.children![0]
    expect(title.props!.text).toBe('World')
    expect(title.props!.size).toBe('heading') // preserved
  })

  it('should add node at root level', () => {
    const newNode: PageSchemaTreeNode = {
      id: 'new-badge',
      component: 'NBadge',
      props: { label: 'New' },
    }
    useEditorStore.getState().addNode('', newNode)
    const tree = useEditorStore.getState().pageSchema.tree
    expect(tree).toHaveLength(2)
    expect(tree[1].id).toBe('new-badge')
  })

  it('should add node as child of parent', () => {
    const newNode: PageSchemaTreeNode = {
      id: 'child-text',
      component: 'NText',
      props: { text: 'Child' },
    }
    useEditorStore.getState().addNode('root', newNode, 1)
    const root = useEditorStore.getState().pageSchema.tree[0]
    expect(root.children).toHaveLength(3)
    expect(root.children![1].id).toBe('child-text')
  })

  it('should remove node', () => {
    useEditorStore.getState().removeNode('btn')
    const root = useEditorStore.getState().pageSchema.tree[0]
    expect(root.children).toHaveLength(1)
    expect(root.children![0].id).toBe('title')
  })

  it('should move node', () => {
    // Move btn before title (index 0)
    useEditorStore.getState().moveNode('btn', 'root', 0)
    const root = useEditorStore.getState().pageSchema.tree[0]
    expect(root.children![0].id).toBe('btn')
    expect(root.children![1].id).toBe('title')
  })

  it('should toggle mode', () => {
    expect(useEditorStore.getState().mode).toBe('edit')
    useEditorStore.getState().setMode('preview')
    expect(useEditorStore.getState().mode).toBe('preview')
  })

  it('should toggle viewport', () => {
    expect(useEditorStore.getState().viewport).toBe('desktop')
    useEditorStore.getState().setViewport('tablet')
    expect(useEditorStore.getState().viewport).toBe('tablet')
  })

  it('should update node with partial updates', () => {
    useEditorStore.getState().updateNode('title', { component: 'NBadge' })
    const root = useEditorStore.getState().pageSchema.tree[0]
    const title = root.children![0]
    expect(title.component).toBe('NBadge')
    expect(title.props!.text).toBe('Hello') // props preserved
  })
})
